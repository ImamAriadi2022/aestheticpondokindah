import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { getSession } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { logger } from "@/core/utils/logger";
import { API_BASE } from "@/core/api/apiConfig";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";
import {
  Crown,
  Sparkles,
  Star,
  Zap,
  Check,
  Loader2,
  ArrowLeft,
  Info,
  TrendingUp,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const tierIcons = {
  bronze: Star,
  gold: Crown,
  platinum: Sparkles,
};

const tierColors = {
  bronze: {
    gradient: "from-[#CD7F32] to-[#A0522D]",
    text: "text-[#A0522D]",
    bg: "bg-[#CD7F32]",
    border: "border-[#CD7F32]/30",
  },
  gold: {
    gradient: "from-[#c9a24a] to-[#a8843a]",
    text: "text-[#a8843a]",
    bg: "bg-[#c9a24a]",
    border: "border-[#c9a24a]/30",
  },
  platinum: {
    gradient: "from-[#8B9DAF] to-[#6B7D8F]",
    text: "text-[#6B7D8F]",
    bg: "bg-[#8B9DAF]",
    border: "border-[#8B9DAF]/30",
  },
};

interface UpgradeOption {
  level: 'bronze' | 'gold' | 'platinum';
  label: string;
  price: number;
  price_formatted: string;
  benefits: {
    discount_percentage: number;
    point_multiplier: number;
    priority_booking?: boolean;
    free_scaling_per_year?: number;
    dedicated_customer_care?: boolean;
    [key: string]: any;
  };
}

const getMembershipAuthToken = (): string | null => {
  const directToken = localStorage.getItem("apident:token");
  if (directToken) return directToken;

  try {
    const storedUser = localStorage.getItem("apident:user");
    return storedUser ? JSON.parse(storedUser)?.token ?? null : null;
  } catch {
    return null;
  }
};

const TIER_RANKS: Record<string, number> = {
  bronze: 1,
  gold: 2,
  platinum: 3,
};

const getLevelRank = (lvl: string) => TIER_RANKS[lvl?.toLowerCase()] || 0;

export default function MembershipUpgradePage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<UpgradeOption[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("bronze");
  const [currentLabel, setCurrentLabel] = useState<string>("Bronze Member");
  const [autoProgress, setAutoProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clinicPhone, setClinicPhone] = useState<string>("081990114949");

  const [unmetRequirements, setUnmetRequirements] = useState<Array<{ message: string; action: string }>>([]);
  const [showRequirementsDialog, setShowRequirementsDialog] = useState(false);

  const [manualPayment, setManualPayment] = useState<{
    orderId: string;
    targetLevel: string;
    targetLabel: string;
    priceFormatted: string;
    whatsappUrl: string;
  } | null>(null);

  const session = getSession();

  useEffect(() => {
    fetchUpgradeOptions();
    getPublicClinicSettings()
      .then((settings) => {
        if (settings?.phone || settings?.whatsapp) {
          setClinicPhone(settings.whatsapp || settings.phone || "081234567890");
        }
      })
      .catch(() => {});
  }, []);

  const fetchUpgradeOptions = async () => {
    try {
      const token = getMembershipAuthToken();
      
      const response = await fetch(`${API_BASE}/membership/payment/options`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOptions(data.data.tiers || data.data.upgrade_options || []);
          setCurrentLevel(data.data.current_level);
          setCurrentLabel(data.data.current_label);
          setAutoProgress(data.data.auto_upgrade_progress);
          setUnmetRequirements(data.data.unmet_requirements || []);
          return;
        }
      }

      const tiersRes = await fetch(`${API_BASE}/public/membership/tiers`);
      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        if (tiersData.success && tiersData.data) {
          const formatted: UpgradeOption[] = Object.entries(tiersData.data)
            .filter(([level]) => level === 'bronze' || level === 'gold' || level === 'platinum')
            .map(([level, info]: [string, any]) => ({
              level: level as 'bronze' | 'gold' | 'platinum',
              label: info.label,
              price: info.price,
              price_formatted: `Rp ${info.price.toLocaleString('id-ID')}`,
              benefits: info.benefits,
            }));
          setOptions(formatted);
          return;
        }
      }

      setError("Gagal memuat opsi upgrade. Silakan coba lagi.");
    } catch (err) {
      logger.error("Error fetching options:", err);
      setError("Gagal memuat opsi upgrade. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (option: UpgradeOption) => {
    if (unmetRequirements.length > 0) {
      setShowRequirementsDialog(true);
      return;
    }

    setProcessing(option.level);
    setError(null);
    
    try {
      const token = getMembershipAuthToken();

      if (!token) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setProcessing(null);
        navigate("/login");
        return;
      }

      let orderId = `UPG-${Date.now().toString().slice(-6)}`;

      try {
        const response = await fetch(`${API_BASE}/membership/request-upgrade`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_level: option.level,
          }),
        });
        
        const data = await response.json();
        if (data.data?.id) {
          orderId = `UPG-#${data.data.id}`;
        }
      } catch (reqErr) {
        logger.warn("Request upgrade API notice:", reqErr);
      }

      const user: any = session?.user;
      const userName = user?.name || "Pasien";
      const userContact = user?.phone || user?.email || "-";
      const cleanPhone = clinicPhone.replace(/\D/g, "").replace(/^0/, "62");

      const waMessage = [
        "Halo Admin Aesthetic Pondok Indah,",
        "",
        "Saya ingin mengajukan *Upgrade Membership* akun saya:",
        `• *Nama*: ${userName}`,
        `• *Email / No. HP*: ${userContact}`,
        `• *Tier Saat Ini*: ${currentLabel || currentLevel.toUpperCase()}`,
        `• *Target Upgrade*: ${option.label} (${option.price_formatted})`,
        `• *Kode Referensi*: ${orderId}`,
        "",
        "Mohon petunjuk nomor rekening / QRIS pembayaran klinik untuk menyelesaikan upgrade membership. Terima kasih!",
      ].join("\n");

      const whatsappUrl = `https://wa.me/${cleanPhone || "6281990114949"}?text=${encodeURIComponent(waMessage)}`;

      setManualPayment({
        orderId,
        targetLevel: option.level,
        targetLabel: option.label,
        priceFormatted: option.price_formatted,
        whatsappUrl,
      });

    } catch (err) {
      logger.error("Upgrade error:", err);
      setError("Terjadi kendala saat mengajukan upgrade. Silakan coba lagi.");
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return "Rp " + (Number(amount) || 0).toLocaleString("id-ID");
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a24a]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full px-4 py-6 max-w-4xl mx-auto space-y-6">
        <Dialog open={showRequirementsDialog} onOpenChange={setShowRequirementsDialog}>
          <DialogContent className="max-w-md rounded-2xl p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#2C2416]">
                Ketentuan Upgrade Belum Terpenuhi
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272]">
                Harap lengkapi syarat berikut sebelum melakukan upgrade.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-xs text-gray-600 mt-2">
              {unmetRequirements.map((req, index) => (
                <div key={index} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{req.message}</span>
                </div>
              ))}
              <Button
                className="w-full bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold rounded-xl text-xs h-9 cursor-pointer"
                onClick={() => setShowRequirementsDialog(false)}
              >
                Mengerti
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={manualPayment !== null} onOpenChange={(open) => !open && setManualPayment(null)}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-2xl">
            <DialogHeader className="text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-black text-[#2C2416]">
                Permohonan Upgrade Tercatat!
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272] mt-0.5">
                Silakan hubungi Admin Klinik via WhatsApp untuk petunjuk transfer dan konfirmasi aktivasi tier Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 mt-2 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE5D6] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Nomor Permohonan:</span>
                  <span className="font-mono font-bold text-[#2C2416]">{manualPayment?.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Target Tier:</span>
                  <span className="font-bold text-[#8C6B1C]">{manualPayment?.targetLabel}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#EDE5D6] pt-2">
                  <span className="text-[#8C8272] font-semibold">Biaya Upgrade:</span>
                  <span className="font-black text-sm text-[#2C2416]">{manualPayment?.priceFormatted}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  Alur Pembayaran & Aktivasi:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
                  <li>Klik tombol WhatsApp di bawah untuk chat Admin.</li>
                  <li>Admin akan memberikan no. rekening / QRIS resmi klinik.</li>
                  <li>Kirim bukti transfer, dan Admin akan langsung menaikkan tier akun Anda.</li>
                </ol>
              </div>

              <div className="space-y-2 pt-2">
                {manualPayment?.whatsappUrl && (
                  <Button
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all touch-manipulation"
                    onClick={() => {
                      window.open(manualPayment.whatsappUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Lanjut ke WhatsApp Admin Klinik</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full h-9 rounded-xl border-[#E8DFC8] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
                  onClick={() => {
                    setManualPayment(null);
                    navigate("/membership");
                  }}
                >
                  Lihat Status di Halaman Membership
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-1 -ml-2 text-[#8C6B1C] hover:bg-[#FAF5EA] font-semibold text-xs h-7 px-2 cursor-pointer"
              onClick={() => navigate("/membership")}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali ke Membership
            </Button>
            <h1 className="text-xl sm:text-2xl font-black text-[#2C2416]">Upgrade Membership</h1>
            <p className="text-xs text-[#8C8272] mt-0.5">
              Pilih tier eksklusif untuk mendapatkan diskon tindakan medis, prioritas booking, dan kelipatan poin reward.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="bg-gradient-to-br from-white to-[#FAF8F5] border-[#E8DFC8] shadow-xs rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272]">Tier Anda Saat Ini</span>
                <p className="text-lg font-black text-[#2C2416] mt-0.5">{currentLabel || "Bronze Member"}</p>
                <p className="text-[11px] text-[#8C6B1C] font-semibold mt-0.5">
                  Upgrade untuk menikmati privilese diskon & pelayanan prioritas instan.
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl flex items-center justify-center text-[#8C6B1C] shrink-0">
                <Crown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {autoProgress && autoProgress.next_level && (
          <Card className="border-[#E8DFC8] bg-white rounded-2xl shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FAF5EA] border border-[#EADBBD] rounded-xl flex items-center justify-center text-[#8C6B1C] shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#2C2416] text-xs sm:text-sm">
                    Progress Akumulasi Perawatan ke {autoProgress.next_level.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-[#8C8272] mb-2">
                    Tier Anda juga dapat naik otomatis dari total transaksi perawatan klinik.
                  </p>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#4A3F35] mb-1">
                      <span>{formatCurrency(autoProgress.current_amount)}</span>
                      <span>{formatCurrency(autoProgress.required_amount)}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0E6D3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, autoProgress.percentage || 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[10px]">
                      <span className="font-semibold text-[#8C6B1C]">
                        {(autoProgress.percentage || 0).toFixed(0)}% tercapai
                      </span>
                      <span className="text-[#8C8272]">
                        {formatCurrency(autoProgress.remaining)} lagi menuju {autoProgress.next_level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="p-3.5 bg-[#FAF8F5] border border-[#EADBBD] rounded-2xl text-xs text-[#5C5546] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#8C6B1C] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Pembayaran upgrade membership dilakukan secara transfer manual dan diverifikasi langsung oleh Admin Klinik melalui WhatsApp resmi.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#2C2416]">
            Pilihan Paket Upgrade Membership
          </h2>

          {options.length === 0 ? (
            <Card className="rounded-2xl border-[#E8DFC8] bg-white">
              <CardContent className="p-8 text-center">
                <Zap className="w-10 h-10 text-[#C9A24A] mx-auto mb-2" />
                <p className="font-bold text-[#2C2416] text-sm">Anda telah berada di Tier Tertinggi!</p>
                <p className="text-xs text-[#8C8272] mt-0.5">Nikmati seluruh privilese istimewa klinik Aesthetic Pondok Indah.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option) => {
                const Icon = tierIcons[option.level] || Crown;
                const colors = tierColors[option.level] || tierColors.gold;
                const isCurrentTier = option.level === currentLevel;
                const isLowerTier = getLevelRank(option.level) < getLevelRank(currentLevel);
                
                return (
                  <Card
                    key={option.level}
                    className={`overflow-hidden border transition-all rounded-2xl flex flex-col justify-between bg-white ${
                      isCurrentTier
                        ? "border-[#C9A24A] ring-2 ring-[#C9A24A]/20"
                        : "border-[#E8DFC8] hover:border-[#C9A24A] hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className={`p-4 bg-gradient-to-r ${colors.gradient} flex items-center justify-between text-white`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold leading-tight">{option.label}</h3>
                            <p className="text-xs opacity-90 font-medium">{option.price_formatted} / tahun</p>
                          </div>
                        </div>
                        {isCurrentTier && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-[#8C6B1C] font-bold text-[10px] shadow-xs">
                            Tier Anda
                          </span>
                        )}
                      </div>
                      
                      <div className="p-4 sm:p-5 space-y-3">
                        <span className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider block">
                          Privilese & Keuntungan:
                        </span>
                        <ul className="space-y-2 text-xs text-[#4A3F35]">
                          {option.benefits.discount_percentage > 0 && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Diskon <strong>{option.benefits.discount_percentage}%</strong> seluruh perawatan</span>
                            </li>
                          )}
                          {option.benefits.point_multiplier > 0 && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Kelipatan <strong>{option.benefits.point_multiplier}x</strong> Poin Reward</span>
                            </li>
                          )}
                          {option.benefits.priority_booking && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Prioritas penentuan jadwal dokter</span>
                            </li>
                          )}
                          {option.benefits.free_scaling_per_year && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Gratis Scaling <strong>{option.benefits.free_scaling_per_year}x/tahun</strong></span>
                            </li>
                          )}
                          {option.benefits.dedicated_customer_care && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Layanan Customer Care Khusus</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0 border-t border-[#FAF5EA] mt-2">
                      <Button
                        className={
                          isCurrentTier
                            ? "w-full bg-[#FAF5EA] text-[#8C6B1C] font-bold border border-[#EADBBD] cursor-default h-10 rounded-xl text-xs"
                            : isLowerTier
                            ? "w-full bg-gray-100 text-gray-400 font-bold cursor-not-allowed h-10 rounded-xl text-xs"
                            : `w-full bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735614] text-white font-bold h-10 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-1.5`
                        }
                        onClick={() => handleUpgrade(option)}
                        disabled={processing === option.level || isCurrentTier || isLowerTier}
                      >
                        {isCurrentTier ? (
                          "Tier Saat Ini"
                        ) : isLowerTier ? (
                          "Sudah di Tier Lebih Tinggi"
                        ) : processing === option.level ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Memproses Permohonan...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Ajukan Upgrade via WhatsApp</span>
                          </>
                        )}
                      </Button>
                      
                      <p className="text-[10px] text-[#8C8272] text-center mt-2">
                        Pembayaran transfer manual ke rekening resmi klinik
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
