import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/demoAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { logger } from "@/lib/logger";
import { API_BASE } from "@/lib/apiConfig";
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  Loader2,
  CreditCard,
  ArrowLeft,
  Info,
  TrendingUp
} from "lucide-react";

// Type declaration for Midtrans Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const tierIcons = {
  gold: Crown,
  platinum: Sparkles,
  diamond: Zap,
};

const tierColors = {
  gold: {
    gradient: "from-[#c9a24a] to-[#a8843a]",
    text: "text-[#a8843a]",
    bg: "bg-[#c9a24a]",
  },
  platinum: {
    gradient: "from-[#8B9DAF] to-[#6B7D8F]",
    text: "text-[#6B7D8F]",
    bg: "bg-[#8B9DAF]",
  },
  diamond: {
    gradient: "from-[#B9F2FF] to-[#7DD3E8]",
    text: "text-[#5EB5D1]",
    bg: "bg-[#7DD3E8]",
  },
};

interface UpgradeOption {
  level: 'gold' | 'platinum' | 'diamond';
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

export default function MembershipUpgradePage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<UpgradeOption[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("bronze");
  const [currentLabel, setCurrentLabel] = useState<string>("Basic Member");
  const [autoProgress, setAutoProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  void currentLevel;
  const session = getSession();
  void session;

  useEffect(() => {
    fetchUpgradeOptions();
  }, []);

  const fetchUpgradeOptions = async () => {
    try {
      const storedUser = localStorage.getItem("apident:user");
      const token = storedUser ? JSON.parse(storedUser)?.token : null;
      
      const response = await fetch(`${API_BASE}/membership/payment/options`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOptions(data.data.upgrade_options);
          setCurrentLevel(data.data.current_level);
          setCurrentLabel(data.data.current_label);
          setAutoProgress(data.data.auto_upgrade_progress);
          return;
        }
      }

      // Fallback to public membership tiers
      const tiersRes = await fetch(`${API_BASE}/public/membership/tiers`);
      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        if (tiersData.success && tiersData.data) {
          const formatted: UpgradeOption[] = Object.entries(tiersData.data)
            .filter(([level]) => level !== 'bronze')
            .map(([level, info]: [string, any]) => ({
              level: level as 'gold' | 'platinum' | 'diamond',
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
    } catch (error) {
      logger.error("Error fetching options:", error);
      setError("Gagal memuat opsi upgrade. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Load Midtrans Snap JS (Optional)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleUpgrade = async (level: string, _price: number) => {
    void _price;
    setProcessing(level);
    setError(null);
    
    try {
      const storedUser = localStorage.getItem("apident:user");
      const token = storedUser ? JSON.parse(storedUser)?.token : null;
      
      // 1. Create payment transaction di backend
      const response = await fetch(`${API_BASE}/membership/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_level: level,
          payment_method: "qris",
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || "Gagal membuat pembayaran");
        setProcessing(null);
        return;
      }

      const { snap_token, transaction_id, payment_url } = data.data;
      
      // 2. Jika Snap sudah siap, buka popup Midtrans.
      // Token dari backend adalah sumber kebenaran; client key hanya diperlukan
      // untuk memuat script Snap, bukan untuk memutuskan apakah token valid.
      if (window.snap && snap_token) {
        window.snap.pay(snap_token, {
          onSuccess: function() {
            checkPaymentStatus(transaction_id, level);
          },
          onPending: function() {
            alert("Pembayaran sedang diproses. Silakan cek status di halaman membership.");
            navigate("/membership");
          },
          onError: function() {
            setError("Pembayaran gagal. Silakan coba lagi.");
            setProcessing(null);
          },
          onClose: function() {
            setProcessing(null);
          }
        });
      } else if (false) {
        // 3. Development fallback saat gateway belum dikonfigurasi di backend.
        console.log("[Simulasi Pembayaran] Menjalankan simulasi transaksi sukses instant...");
        const simRes = await fetch(`${API_BASE}/membership/payment/simulate/${transaction_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ status: "success" }),
        });
        
        const simData = await simRes.json();
        if (simData.success) {
          alert(`✨ Upgrade ke ${level.toUpperCase()} Berhasil!\n\n${simData.message}`);
          navigate("/membership");
        } else {
          setError(simData.message || "Gagal memproses simulasi pembayaran");
          setProcessing(null);
        }
      } else if (payment_url) {
        // Script Snap gagal dimuat (mis. diblokir browser), tetapi transaksi
        // tetap dapat dilanjutkan melalui halaman pembayaran Midtrans.
        window.location.assign(payment_url);
      } else {
        setError("Pembayaran tidak dapat dibuka. Silakan coba lagi.");
        setProcessing(null);
      }
    } catch (error) {
      logger.error("Error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setProcessing(null);
    }
  };

  const checkPaymentStatus = async (transactionId: number, level: string) => {
    try {
      const storedUser = localStorage.getItem("apident:user");
      const token = storedUser ? JSON.parse(storedUser)?.token : null;
      
      const response = await fetch(`${API_BASE}/membership/payment/status/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.is_paid) {
        alert(`Upgrade ke ${level} berhasil! Selamat datang di tier baru.`);
        navigate("/membership");
      } else {
        setTimeout(() => checkPaymentStatus(transactionId, level), 3000);
      }
    } catch (error) {
      logger.error("Error checking status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return "Rp " + amount.toLocaleString("id-ID");
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a24a]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-gray-600"
            onClick={() => navigate("/membership")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Upgrade Membership</h1>
          <p className="text-sm text-gray-500">
            Pilih tier yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Current Tier */}
        <Card className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tier Saat Ini</p>
                <p className="text-lg font-bold text-gray-900">{currentLabel}</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Upgrade Progress */}
        {autoProgress && autoProgress.next_level && (
          <Card className="mb-6 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Progress Auto-Upgrade ke {autoProgress.next_level}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Transaksi perawatan juga bisa mengupgrade Anda otomatis
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">
                        {formatCurrency(autoProgress.current_amount)}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(autoProgress.required_amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, autoProgress.percentage)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {autoProgress.percentage.toFixed(0)}% menuju {autoProgress.next_level}
                      </span>
                      {autoProgress.percentage >= 100 ? (
                        <span className="text-xs text-green-600 font-medium">
                          Siap auto-upgrade!
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {formatCurrency(autoProgress.remaining)} lagi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="mb-4 flex items-start gap-2 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 text-amber-500" />
          <p>
            Upgrade langsung memberikan akses segera ke tier yang dipilih tanpa 
            menunggu transaksi perawatan.
          </p>
        </div>

        {/* Upgrade Options */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Pilih Tier Upgrade
          </h2>

          {options.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Anda sudah di tier tertinggi!</p>
              </CardContent>
            </Card>
          ) : (
            options.map((option) => {
              const Icon = tierIcons[option.level] || Crown;
              const colors = tierColors[option.level];
              
              return (
                <Card
                  key={option.level}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`h-20 bg-gradient-to-r ${colors.gradient} flex items-center px-6`}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      <h3 className="text-lg font-bold">{option.label}</h3>
                      <p className="text-sm opacity-90">
                        {option.price_formatted}/tahun
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    {/* Benefits */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Keuntungan:
                      </h4>
                      <ul className="space-y-2">
                        {option.benefits.discount_percentage > 0 && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            Diskon {option.benefits.discount_percentage}% untuk perawatan
                          </li>
                        )}
                        {option.benefits.priority_booking && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            Prioritas booking
                          </li>
                        )}
                        {option.benefits.point_multiplier > 0 && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            {option.benefits.point_multiplier}x poin reward
                          </li>
                        )}
                        {option.benefits.free_scaling_per_year && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            Free scaling {option.benefits.free_scaling_per_year}x/tahun
                          </li>
                        )}
                        {option.benefits.dedicated_customer_care && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            Customer care khusus
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Button
                      className={`w-full bg-gradient-to-r ${colors.gradient} text-white font-bold hover:opacity-90`}
                      onClick={() => handleUpgrade(option.level, option.price)}
                      disabled={processing === option.level}
                    >
                      {processing === option.level ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Upgrade Sekarang
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Langsung upgrade tanpa minimal transaksi
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
