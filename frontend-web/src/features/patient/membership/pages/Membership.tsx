import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { getSession } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import NewMobileDashboardLayout from "@/core/layouts/NewMobileDashboardLayout";
import { apiClient } from "@/core/api/apiClient";
import { logger } from "@/core/utils/logger";
import {
  Star,
  X,
  Download,
  Crown,
  Sparkles,
  TrendingUp,
  Percent,
  Bell,
  Heart,
  FolderOpen,
  ChevronRight,
  Calendar,
  Award,
  Coins,
  ArrowRight,
  Receipt,
  Clock,
  Copy,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import * as htmlToImage from "html-to-image";
import { membershipApi, MembershipData } from "@/features/patient/membership/services/membershipApi";

type PointMutation = {
  id: number;
  points: number;
  balance_before: number;
  balance_after: number;
  type: "earned" | "redeemed" | "expired" | "adjusted" | string;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
};

const defaultMemberPromos = [
  {
    id: 1,
    title: "Diskon 25% Scaling & Pemutihan Gigi (Bleaching)",
    description: "Nikmati senyum bersih cemerlang dengan potongan harga spesial 25% khusus member.",
    discount: "25% OFF",
    code: "MEMBER25",
    category: "Estetika & Scaling",
  },
  {
    id: 2,
    title: "Voucher Potongan Rp 500.000 Pemasangan Behel",
    description: "Potongan langsung untuk pemasangan kawat gigi / aligner ortodonti.",
    discount: "Rp 500.000",
    code: "BEHELMEMBER",
    category: "Ortodonti",
  },
  {
    id: 3,
    title: "Diskon Tambahan 15% Veneer Gigi Estetik",
    description: "Perbaiki warna dan bentuk gigi impian dengan diskon eksklusif tier loyalty.",
    discount: "15% OFF",
    code: "VENEERVIP",
    category: "Veneer Estetik",
  },
];

export default function MembershipPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const session = getSession();
  const navigate = useNavigate();

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showPointHistoryModal, setShowPointHistoryModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promos, setPromos] = useState<any[]>(defaultMemberPromos);
  const [promosLoading, setPromosLoading] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [apiMembership, setApiMembership] = useState<MembershipData | null>(null);

  const fetchPromos = async () => {
    try {
      setPromosLoading(true);
      const res = await apiClient.get<any>("/promos", { skipToast: true });
      const raw = Array.isArray(res) ? res : res?.data || [];
      if (raw.length > 0) {
        setPromos(raw);
      } else {
        setPromos(defaultMemberPromos);
      }
    } catch {
      setPromos(defaultMemberPromos);
    } finally {
      setPromosLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Kode Promo Disalin!",
      message: `Kode ${code} siap digunakan pada saat reservasi.`,
      variant: "success",
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // User Point History Ledger State
  const [pointsData, setPointsData] = useState<{
    current_balance: number;
    total_earned: number;
    total_redeemed: number;
    history: PointMutation[];
  }>({
    current_balance: 0,
    total_earned: 0,
    total_redeemed: 0,
    history: [],
  });
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    membershipApi.getMembership()
      .then((data) => {
        if (data) setApiMembership(data);
      })
      .catch((err) => {
        logger.warn("Fetch real membership API fallback to session:", err);
      });

    // Fetch live point ledger mutations
    apiClient.get<{ data: any }>("/patient/membership/points", { skipToast: true })
      .then((res) => {
        const payload = res?.data || {};
        const historyList = Array.isArray(payload.history)
          ? payload.history
          : payload.history?.data || [];

        setPointsData({
          current_balance: Number(payload.current_balance || 0),
          total_earned: Number(payload.total_earned || 0),
          total_redeemed: Number(payload.total_redeemed || 0),
          history: historyList,
        });
      })
      .catch(() => {})
      .finally(() => setPointsLoading(false));
  }, []);

  const tierConfig = {
    bronze: {
      label: 'Basic Member',
      badge: 'BRONZE',
      icon: Star,
      gradient: 'from-[#C9A24A] to-[#B8943F]',
      lightGradient: 'from-[#C9A24A]/20 to-[#B8943F]/20',
      textColor: 'text-[#C9A24A]',
      bgColor: 'bg-[#C9A24A]',
    },
    gold: {
      label: 'Premium Member',
      badge: 'GOLD',
      icon: Crown,
      gradient: 'from-[#E8C547] to-[#C9A24A]',
      lightGradient: 'from-[#E8C547]/20 to-[#C9A24A]/20',
      textColor: 'text-[#E8C547]',
      bgColor: 'bg-[#E8C547]',
    },
    platinum: {
      label: 'Priority Member',
      badge: 'PLATINUM',
      icon: Sparkles,
      gradient: 'from-[#F5E6C8] to-[#E8C547]',
      lightGradient: 'from-[#F5E6C8]/20 to-[#E8C547]/20',
      textColor: 'text-[#E8C547]',
      bgColor: 'bg-[#F5E6C8]',
    },
  };

  const currentTier = apiMembership?.membership?.level || (session as any)?.membership_level || 'bronze';
  const normalizedTier = (currentTier || 'bronze').toLowerCase();
  const config = tierConfig[normalizedTier as keyof typeof tierConfig] || tierConfig.bronze;
  const userPoints = pointsData.current_balance || apiMembership?.membership?.points || (session as any)?.membership_points || 0;
  const membershipExpiry = apiMembership?.membership?.expires_at 
    ? new Date(apiMembership.membership.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "Seumur Hidup";

  const getTierCardBg = (tier: string) => {
    switch (tier) {
      case 'gold':
        return '/dashboard/cardgold.png';
      case 'platinum':
        return '/dashboard/cardplatinum.png';
      case 'bronze':
      default:
        return '/dashboard/cardbronze.png';
    }
  };

  const getTierRibbon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return '/dashboard/gold.png';
      case 'platinum':
        return '/dashboard/platinum.png';
      case 'diamond':
        return '/dashboard/diamond.png';
      case 'bronze':
      default:
        return '/dashboard/bronze.png';
    }
  };

  const currentCardBg = getTierCardBg(normalizedTier);
  const currentRibbon = getTierRibbon(normalizedTier);

  const nextTierInfo = useMemo(() => {
    if (normalizedTier === 'bronze') {
      return {
        targetLevel: 'Gold Member',
        headerTitle: 'Progress Menuju Gold',
        title: 'Naik Level ke Gold Member',
        description: 'Nikmati prioritas booking, benefit eksklusif, dan poin reward lebih banyak dengan upgrade ke Gold Member.',
        showUpgradeButton: true,
      };
    }
    if (normalizedTier === 'gold') {
      return {
        targetLevel: 'Platinum Member',
        headerTitle: 'Progress Menuju Platinum',
        title: 'Naik Level ke Platinum Member',
        description: 'Dapatkan fasilitas VIP eksklusif, free scaling tahunan, dan prioritas layanan tertinggi sebagai Platinum Member.',
        showUpgradeButton: true,
      };
    }
    return {
      targetLevel: 'Priority VIP (Tier Tertinggi)',
      headerTitle: 'Status Membership VIP',
      title: 'Anda Berada di Tier Tertinggi',
      description: 'Selamat! Anda telah menikmati seluruh benefit VIP eksklusif, prioritas booking utama, dan poin reward maksimal.',
      showUpgradeButton: false,
    };
  }, [normalizedTier]);

  const generateMemberId = (userId: string | number) => {
    const id = String(userId).toUpperCase();
    if (id.startsWith("AESPI_")) return "MEM-" + id;
    return "MEM-AESPI_" + String(userId).padStart(2, "0");
  };
  const membershipId = generateMemberId(session?.id || "00");

  const downloadCard = async () => {
    const node = document.getElementById('membership-card-download');
    if (!node) return;
    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#000000',
      });
      const link = document.createElement('a');
      link.download = `Membership-AestheticPondokIndah-${session?.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      logger.error('Gagal download membership card', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4 text-sm">Silakan login terlebih dahulu</p>
          <Button onClick={() => navigate("/login")} className="bg-[#c9a24a] text-white">Login</Button>
        </div>
      </div>
    );
  }

  const Layout = isMobile ? NewMobileDashboardLayout : DashboardLayout;
  const containerClasses = isMobile
    ? "w-full mx-auto px-4 py-5 space-y-6"
    : "w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-6 space-y-6";

  return (
    <Layout role="user">
      <div className={containerClasses}>
        
        {/* Middle Row: Membership Card (left) & Progress (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress / Upgrade Banner (Right - 2/3) */}
          <Card className="order-2 lg:col-span-2 lg:order-2 rounded-2xl border-0 shadow-sm bg-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#C9A24A]" />
                  <h3 className="font-bold text-gray-900">{nextTierInfo.headerTitle}</h3>
                </div>
              </div>

              <div className="relative mb-8">
                {/* Upgrade Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-amber-50 p-5 sm:p-6 border border-amber-100">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-amber-200/40 rounded-full blur-2xl" />
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow">
                      <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A24A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">{nextTierInfo.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{nextTierInfo.description}</p>
                      {nextTierInfo.showUpgradeButton && (
                        <Button onClick={() => navigate('/membership/upgrade')} className="bg-[#C9A24A] text-white font-bold px-5 h-10 hover:opacity-90 cursor-pointer">Upgrade Sekarang</Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Benefits: Promo Khusus & Riwayat Poin */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#C9A24A]" />
                      <h4 className="text-sm font-bold text-gray-900">Benefit Utama {config.label}</h4>
                    </div>
                    <span className="text-[11px] text-[#A8843A] font-medium">Klik untuk akses</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Promo Khusus Member Pop-up */}
                    <div
                      onClick={() => {
                        setShowPromoModal(true);
                        if (promos.length <= 3) fetchPromos();
                      }}
                      className="group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#FFFDF9] to-[#FDF8F0] p-4 shadow-xs hover:shadow-md hover:border-[#C9A24A] hover:bg-[#FAF4E8] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-300/30 transition-all" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#FDF0D5] border border-[#EADBBD] flex items-center justify-center text-[#9A7B2C] shadow-2xs group-hover:scale-105 transition-transform">
                            <Percent className="w-5 h-5 text-[#C9A24A]" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200">
                            Eksklusif
                          </span>
                        </div>
                        
                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#9A7B2C] transition-colors mb-1">
                          Promo Khusus Member
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          Klaim voucher dan potongan harga spesial perawatan gigi eksklusif untuk tier {config.badge}.
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#C9A24A] group-hover:text-[#A8843A] transition-colors">
                        <span>Buka Promo Eksklusif</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* 2. Riwayat & Mutasi Poin Pop-up */}
                    <div
                      onClick={() => setShowPointHistoryModal(true)}
                      className="group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#FFFDF9] to-[#FDF8F0] p-4 shadow-xs hover:shadow-md hover:border-[#C9A24A] hover:bg-[#FAF4E8] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-300/30 transition-all" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#FDF0D5] border border-[#EADBBD] flex items-center justify-center text-[#9A7B2C] shadow-2xs group-hover:scale-105 transition-transform">
                            <Coins className="w-5 h-5 text-[#C9A24A]" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200">
                            {userPoints} Pts
                          </span>
                        </div>
                        
                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#9A7B2C] transition-colors mb-1">
                          Riwayat & Mutasi Poin
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          Pantau buku besar perolehan reward dari setiap transaksi dan riwayat mutasi saldo poin Anda.
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#C9A24A] group-hover:text-[#A8843A] transition-colors">
                        <span>Buka Rincian Mutasi Poin</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Card */}
          <Card className="order-1 lg:col-span-1 lg:order-1 rounded-2xl border-0 shadow-sm bg-[#1a1612] overflow-hidden group">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-6">
                {!isMobile && (
                  <h3 className="text-lg font-bold text-white mb-6">Kartu Membership</h3>
                )}
                
                {/* Digital Card Preview with Dynamic Background & Ribbon */}
                <div className="relative aspect-[1.58/1] w-full rounded-2xl p-5 overflow-hidden border border-[#C9A24A]/25 shadow-2xl mb-6 bg-[#1a1612]">
                  <img
                    src={currentCardBg}
                    alt={`${config.badge} Card Background`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/dashboard/cardbronze.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  
                  <div className="relative h-full flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[7px] text-[#F5E6C8]/80 uppercase tracking-[0.2em] mb-0.5 font-medium">AESPI DIGITAL</p>
                        <p className="text-[7px] text-[#F5E6C8]/80 uppercase tracking-[0.2em] font-medium">MEMBERSHIP CARD</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <img
                          src="/logo/logo.png"
                          alt="Aesthetic Pondok Indah"
                          className="h-6 sm:h-7 w-auto object-contain brightness-0 invert sepia-[.3] hue-rotate-[-10deg] saturate-[3]"
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-[8px] text-[#C9A24A] font-bold tracking-widest mb-0.5 uppercase">{config.badge} MEMBER</p>
                      <h4 className="text-base sm:text-lg font-black text-[#F5E6C8] tracking-wider uppercase truncate">
                        {(session as any)?.name || 'PASIEN KLINIK'}
                      </h4>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[7px] text-[#F5E6C8]/80 uppercase tracking-[0.2em] mb-0.5 font-medium">MEMBER ID</p>
                        <p className="text-[10px] font-mono text-[#D4C5B0] tracking-wider uppercase">{membershipId}</p>
                      </div>
                      <div className="w-12 h-12 relative shrink-0">
                        <img
                          src={currentRibbon}
                          alt={`${config.badge} Ribbon`}
                          className="w-full h-full object-contain drop-shadow-xl"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/dashboard/bronze.png";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Berlaku hingga</p>
                    </div>
                    <p className="text-xs font-bold text-white">{membershipExpiry}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-3.5 h-3.5 text-[#C9A24A]" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Poin Saat Ini</p>
                    </div>
                    <p className="text-xs font-bold text-white">{userPoints} Pts</p>
                  </div>
                  <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-[#C9A24A]" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Level Berikutnya</p>
                        <p className="text-xs font-bold text-white leading-tight">{nextTierInfo.targetLevel}</p>
                      </div>
                    </div>
                    {nextTierInfo.showUpgradeButton && (
                      <button onClick={() => navigate('/membership/upgrade')} className="text-[10px] text-[#C9A24A] font-bold hover:underline cursor-pointer">
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setShowMembershipModal(true)}
                  className="w-full py-3 rounded-xl border border-[#C9A24A]/30 text-[#C9A24A] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#C9A24A] hover:text-[#1a1612] transition-all cursor-pointer"
                >
                  Lihat Detail Membership <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MODAL 1: PROMO KHUSUS MEMBER POP-UP */}
        <Dialog open={showPromoModal} onOpenChange={setShowPromoModal}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D3] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF0D5] border border-[#EADBBD] flex items-center justify-center text-[#9A7B2C] shadow-2xs">
                  <Percent className="w-5 h-5 text-[#C9A24A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Promo Khusus {config.label}</h3>
                  <p className="text-xs text-gray-500">Voucher & potongan harga spesial untuk akun tier {config.badge}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              {promosLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock className="w-6 h-6 animate-spin mx-auto text-[#C9A24A] mb-2" />
                  <p className="text-xs font-medium">Memuat promo eksklusif...</p>
                </div>
              ) : (
                promos.map((promo, idx) => (
                  <div
                    key={promo.id || idx}
                    className="p-4 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 hover:border-[#C9A24A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#C9A24A]/15 text-[#8C6B1C] text-[10px] font-bold uppercase tracking-wider">
                          {promo.discount || promo.discount_text || "Promo Member"}
                        </span>
                        {promo.category && (
                          <span className="text-[10px] text-gray-400 font-medium">{promo.category}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 truncate">{promo.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{promo.description || promo.excerpt || "Gunakan saat reservasi untuk menikmati potongan harga eksklusif."}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyCode(promo.code || "AESPIVIP")}
                        className="px-3.5 py-2 rounded-xl border border-[#C9A24A]/40 bg-white hover:bg-[#FAF4E8] text-[#8C6B1C] text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Salin Kode Promo"
                      >
                        {copiedCode === (promo.code || "AESPIVIP") ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#C9A24A]" />
                            <span>{promo.code || "AESPIVIP"}</span>
                          </>
                        )}
                      </button>
                      <Button
                        onClick={() => {
                          setShowPromoModal(false);
                          navigate("/dashboard/user?tab=reservasi");
                        }}
                        className="bg-[#C9A24A] text-white text-xs font-bold px-3.5 py-2 h-auto rounded-xl hover:opacity-90 cursor-pointer"
                      >
                        Pakai
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <Button
                onClick={() => setShowPromoModal(false)}
                variant="outline"
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: RIWAYAT & MUTASI POIN MEMBER POP-UP */}
        <Dialog open={showPointHistoryModal} onOpenChange={setShowPointHistoryModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#E8DFC8] shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D3] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF0D5] border border-[#EADBBD] flex items-center justify-center text-[#9A7B2C] shadow-2xs">
                  <Coins className="w-5 h-5 text-[#C9A24A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Buku Besar & Riwayat Mutasi Poin</h3>
                  <p className="text-xs text-gray-500">Catatan perolehan poin dari transaksi perawatan dan reward loyalty Anda</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] text-xs font-bold text-[#8C6B1C] flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#C9A24A]" />
                  <span>Saldo: {userPoints} Poin</span>
                </div>
              </div>
            </div>

            {/* Point Summary Bar */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Saldo Poin</p>
                <p className="text-base font-black text-[#8C6B1C]">{userPoints} Pts</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Didapat</p>
                <p className="text-base font-black text-emerald-700">+{pointsData.total_earned} Pts</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Digunakan</p>
                <p className="text-base font-black text-rose-700">-{pointsData.total_redeemed} Pts</p>
              </div>
            </div>

            {/* Table of Point Mutations */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8DFC8] text-[10px] uppercase font-bold text-[#8C8272] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Sumber Perawatan / Tindakan</th>
                    <th className="px-4 py-3">Tipe Mutasi</th>
                    <th className="px-4 py-3">Perolehan Poin</th>
                    <th className="px-4 py-3">Saldo Berjalan</th>
                    <th className="px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE6]">
                  {pointsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#8C8272]">
                        <Clock className="w-5 h-5 animate-spin mx-auto text-[#C9A24A] mb-1" />
                        Memuat riwayat mutasi poin...
                      </td>
                    </tr>
                  ) : pointsData.history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[#8C8272]">
                        <Receipt className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2" />
                        <p className="font-bold text-[#2C2416]">Belum Ada Mutasi Poin</p>
                        <p className="text-[11px] mt-0.5">
                          Lakukan reservasi janji temu dan selesaikan perawatan gigi Anda untuk mulai mengumpulkan poin reward!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pointsData.history.map((item) => {
                      const isPositive = Number(item.points) > 0 || item.type === "earned";
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-[#8C8272] font-mono text-[11px]">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#2C2416]">
                            {item.reference_type === "reservation" ? (
                              <span className="text-[#8C6B1C] font-mono font-bold">
                                Reservasi #{item.reference_id}
                              </span>
                            ) : (
                              <span>{item.reference_type || "Sistem Reward"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 font-bold text-[9px] uppercase border ${
                                item.type === "earned"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : item.type === "adjusted"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 font-black text-xs ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPositive ? `+${item.points}` : item.points} Pts
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px]">
                            {item.balance_before !== undefined && item.balance_after !== undefined ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2 py-0.5 rounded-lg border border-[#EADBBD]">
                                <span>{item.balance_before}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                                <span className="text-[#2C2416]">{item.balance_after}</span>
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#5C5546] max-w-xs text-[11px] truncate" title={item.description || ""}>
                            {item.description || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <Button
                onClick={() => setShowPointHistoryModal(false)}
                variant="outline"
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Digital Membership Modal */}
        <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 !bg-transparent !border-0 !shadow-none">
            <div className="flex flex-col items-center">
              <div id="membership-card-modal" className="w-full aspect-[1.58/1] rounded-[1.5rem] relative overflow-hidden shadow-2xl bg-[#1a1612]">
                <img
                  src={currentCardBg}
                  alt={`${config.badge} Card Background`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/dashboard/cardbronze.png";
                  }}
                />

                <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-[#F5E6C8] text-3xl sm:text-4xl font-extralight tracking-[0.1em] leading-none">aesthetic</h3>
                      <p className="text-[#D4A84B] text-xs sm:text-sm tracking-[0.3em] lowercase mt-1">pondok indah</p>
                      <p className="text-[#B8943F] text-[9px] sm:text-[10px] tracking-[0.4em] mt-2 font-medium uppercase">{config.badge} MEMBERSHIP</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <img
                        src="/logo/logo.png"
                        alt="Aesthetic Pondok Indah"
                        className="h-10 sm:h-12 w-auto object-contain brightness-0 invert sepia-[.3] hue-rotate-[-10deg] saturate-[3]"
                      />
                    </div>
                  </div>

                  <div className="mt-auto mb-1">
                    <p className="text-[#C9A24A]/80 text-[9px] sm:text-[10px] tracking-[0.3em] mb-1.5 font-medium uppercase">Nama Pemilik</p>
                    <h4 className="text-[#F5E6C8] text-xl sm:text-2xl font-bold tracking-[0.15em] truncate uppercase">
                      {(session as any)?.name?.toUpperCase() || 'PASIEN KLINIK'}
                    </h4>
                    <p className="text-[#E8D5B5] text-lg sm:text-xl font-mono tracking-[0.2em] mt-2 uppercase" style={{fontFamily: "'Courier New', Courier, monospace"}}>
                      {membershipId}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <p className="text-[#C9A24A]/80 text-[8px] sm:text-[9px] tracking-[0.2em] font-medium uppercase">Valid Thru</p>
                      <p className="text-[#F5E6C8] text-sm sm:text-base font-bold tracking-wide" style={{fontFamily: "'Courier New', Courier, monospace"}}>
                        {membershipExpiry}
                      </p>
                    </div>
                    <div className="w-12 sm:w-14 h-12 sm:h-14 relative shrink-0">
                      <img
                        src={currentRibbon}
                        alt={`${config.badge} Ribbon`}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/dashboard/bronze.png";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={downloadCard} disabled={isDownloading} className="bg-[#c9a24a] text-white px-6 py-4 h-auto font-bold rounded-xl shadow-xl flex items-center gap-2 transition-all active:scale-95 text-sm cursor-pointer">
                  {isDownloading ? "Mengunduh..." : <><Download className="w-4 h-4" /> Download PNG</>}
                </Button>
                <Button onClick={() => setShowMembershipModal(false)} className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
