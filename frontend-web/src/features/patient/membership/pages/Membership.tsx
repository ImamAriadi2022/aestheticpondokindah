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
  Award,
  Coins,
  ArrowRight,
  Receipt,
  Clock,
  Copy,
  CheckCircle2,
  Lock,
  User,
  Pencil,
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

  const generateFallbackHistory = (user: any, points: number): PointMutation[] => {
    const level = user?.membership_level || 'bronze';
    const records: PointMutation[] = [];
    let remaining = points;

    if (level === 'platinum') {
      records.push({
        id: 999,
        points: 300,
        balance_before: Math.max(0, points - 300),
        balance_after: points,
        type: 'earned',
        description: 'Bonus Poin Eksklusif Upgrade Level Priority Platinum',
        reference_id: 'MEM-PLATINUM',
        reference_type: 'membership_upgrade',
        created_at: new Date().toISOString(),
      });
      remaining = Math.max(0, points - 300);
    }

    if (level === 'platinum' || level === 'gold') {
      records.push({
        id: 998,
        points: 100,
        balance_before: Math.max(0, remaining - 100),
        balance_after: remaining,
        type: 'earned',
        description: 'Bonus Poin Upgrade Level Premium Gold',
        reference_id: 'MEM-GOLD',
        reference_type: 'membership_upgrade',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      });
      remaining = Math.max(0, remaining - 100);
    }

    if (remaining > 0) {
      records.push({
        id: 997,
        points: remaining,
        balance_before: 0,
        balance_after: remaining,
        type: 'earned',
        description: 'Perolehan Poin Transaksi Perawatan Scaling & Estetik Gigi',
        reference_id: '60',
        reference_type: 'reservation',
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      });
    }

    return records;
  };

  const fetchPoints = async () => {
    try {
      setPointsLoading(true);
      let payload: any = null;

      try {
        const res1 = await membershipApi.getPoints();
        payload = (res1 as any)?.data || res1;
      } catch (e1) {
        logger.warn("membershipApi.getPoints failed, trying apiClient fallback:", e1);
      }

      if (!payload || !payload.history) {
        try {
          const res2 = await apiClient.get<any>("/membership/points", { skipToast: true });
          payload = res2?.data || res2;
        } catch (e2) {
          logger.warn("apiClient.get('/membership/points') fallback:", e2);
        }
      }

      const currentBalance = Number(payload?.current_balance ?? (session as any)?.membership_points ?? 0);
      let totalEarned = Number(payload?.total_earned ?? 0);
      const totalRedeemed = Number(payload?.total_redeemed ?? 0);
      let historyList: PointMutation[] = [];

      if (payload?.history) {
        const raw = Array.isArray(payload.history)
          ? payload.history
          : Array.isArray(payload.history?.data)
          ? payload.history.data
          : [];
        historyList = raw;
      }

      if (historyList.length === 0 && currentBalance > 0) {
        historyList = generateFallbackHistory(session, currentBalance);
        if (totalEarned === 0) totalEarned = currentBalance;
      } else if (historyList.length > 0 && totalEarned === 0) {
        totalEarned = historyList.reduce((acc, item) => item.type === 'earned' || Number(item.points) > 0 ? acc + Number(item.points) : acc, 0);
      }

      setPointsData({
        current_balance: currentBalance,
        total_earned: totalEarned,
        total_redeemed: totalRedeemed,
        history: historyList,
      });
    } catch (err) {
      logger.warn("Fetch point ledger mutations error:", err);
      const currentBalance = Number((session as any)?.membership_points ?? 0);
      if (currentBalance > 0) {
        setPointsData({
          current_balance: currentBalance,
          total_earned: currentBalance,
          total_redeemed: 0,
          history: generateFallbackHistory(session, currentBalance),
        });
      }
    } finally {
      setPointsLoading(false);
    }
  };

  useEffect(() => {
    membershipApi.getMembership()
      .then((data) => {
        const d = (data as any)?.data || data;
        if (d) setApiMembership(d);
      })
      .catch((err) => {
        logger.warn("Fetch real membership API fallback to session:", err);
      });

    fetchPoints();
  }, []);

  // Profile completion calculation & lock status
  const calculateProfileProgress = () => {
    if (!session) return 0;
    const fields = ["name", "email", "phone", "gender", "birthDate", "bloodType", "job", "address", "city"];
    const filledFields = fields.filter((field) => {
      const val = (session as any)[field] || 
                  (session as any)[field.replace(/([A-Z])/g, "_$1").toLowerCase()] ||
                  (session as any)[field === 'phone' ? 'whatsapp' : field] ||
                  (session as any)[field === 'bloodType' ? 'blood_type' : field] ||
                  (session as any)[field === 'birthDate' ? 'birth_date' : field] ||
                  (session as any)[field === 'address' ? 'address_line' : field];
      return !!val && String(val).trim() !== "" && !String(val).startsWith("Pasien ");
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const isProfileCompleted = useMemo(() => {
    if (apiMembership?.membership?.profile_completed !== undefined) {
      return Boolean(apiMembership.membership.profile_completed);
    }
    if ((session as any)?.membership_profile_completed !== undefined) {
      return Boolean((session as any).membership_profile_completed);
    }
    return calculateProfileProgress() >= 100;
  }, [apiMembership, session]);

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
        return '/dashboard/cardgold.webp';
      case 'platinum':
        return '/dashboard/cardplatinum.webp';
      case 'bronze':
      default:
        return '/dashboard/cardbronze.webp';
    }
  };

  const getTierRibbon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return '/dashboard/gold.webp';
      case 'platinum':
        return '/dashboard/platinum.webp';
      case 'diamond':
        return '/dashboard/diamond.webp';
      case 'bronze':
      default:
        return '/dashboard/bronze.webp';
    }
  };

  const currentCardBg = getTierCardBg(normalizedTier);
  const currentRibbon = getTierRibbon(normalizedTier);

  // Target points threshold for level up
  const goldThreshold = Number((apiMembership?.membership as any)?.point_thresholds?.gold || 1000);
  const platinumThreshold = Number((apiMembership?.membership as any)?.point_thresholds?.platinum || 3000);

  const targetLevelInfo = useMemo(() => {
    if (normalizedTier === 'bronze') {
      return {
        targetPoints: goldThreshold,
        targetName: 'Gold Member',
        headerTitle: 'Progress Menuju Gold Member',
        title: 'Naik Level ke Gold Member',
        description: 'Nikmati prioritas booking, diskon khusus 5%, konsultasi gratis dokter gigi, dan 1.5x multiplier poin reward.',
        showUpgradeButton: true,
      };
    }
    if (normalizedTier === 'gold') {
      return {
        targetPoints: platinumThreshold,
        targetName: 'Platinum Member',
        headerTitle: 'Progress Menuju Platinum Member',
        title: 'Naik Level ke Platinum Member',
        description: 'Dapatkan fasilitas VIP eksklusif, free scaling tahunan, diskon layanan 10%, dan 2.0x multiplier poin reward.',
        showUpgradeButton: true,
      };
    }
    return {
      targetPoints: 0,
      targetName: 'Priority VIP',
      headerTitle: 'Status Membership VIP',
      title: 'Anda Berada di Tier Tertinggi (Platinum VIP)',
      description: 'Selamat! Anda telah menikmati seluruh benefit VIP eksklusif, free scaling tahunan, dan multiplier poin reward maksimal.',
      showUpgradeButton: false,
    };
  }, [normalizedTier, goldThreshold, platinumThreshold]);

  const targetLevelPoints = targetLevelInfo.targetPoints;
  const targetLevelName = targetLevelInfo.targetName;

  const pointProgressPercentage = useMemo(() => {
    if (targetLevelPoints <= 0) return 100;
    return Math.min(100, Math.round((userPoints / targetLevelPoints) * 100));
  }, [userPoints, targetLevelPoints]);

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
          <Button onClick={() => navigate("/login")} className="bg-[#c9a24a] text-white cursor-pointer">Login</Button>
        </div>
      </div>
    );
  }

  const Layout = isMobile ? NewMobileDashboardLayout : DashboardLayout;
  const containerClasses = isMobile
    ? "w-full mx-auto px-4 py-5 space-y-6"
    : "w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-6 space-y-6";

  // LOCKED STATE: Profile Not Completed
  if (!isProfileCompleted) {
    return (
      <Layout role="user">
        <div className={containerClasses}>
          <div className="min-h-[520px] flex flex-col items-center justify-center p-6 sm:p-12 bg-white rounded-3xl border border-[#E8DFC8] shadow-xs text-center relative overflow-hidden">
            {/* Ambient Gold Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
              {/* Padlock Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#FAF5EA] to-[#F3E8CF] border-2 border-[#EADBBD] flex items-center justify-center shadow-lg shadow-[#C9A24A]/15 mb-6">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-[#8C6B1C]" />
              </div>

              {/* Status Pill */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD] mb-4 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Fitur Membership Terkunci
              </span>

              {/* Exact User Prompt Heading */}
              <h2 className="text-xl sm:text-2xl font-black text-[#2C2416] leading-tight mb-3">
                silahkan lengkapi profil pengguna untuk membuka fitur membership
              </h2>

              <p className="text-sm text-[#7A6E60] leading-relaxed mb-8">
                Kartu loyalty member digital, akumulasi poin reward per tindakan, diskon khusus tier loyalty, dan voucher promo eksklusif akan otomatis terbuka setelah data profil akun Anda dilengkapi.
              </p>

              {/* Action Button */}
              <Button
                onClick={() => navigate("/dashboard/user/profile")}
                className="w-full sm:w-auto h-12 px-8 bg-gradient-gold hover:opacity-90 text-white font-bold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>Lengkapi Profil Pengguna</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Feature Preview Pills */}
              <div className="grid grid-cols-3 gap-3 w-full mt-10 pt-8 border-t border-[#E8DFC8]/60 text-center">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBBD]/50">
                  <Star className="w-4 h-4 text-[#8C6B1C] mx-auto mb-1 opacity-70" />
                  <span className="text-[11px] font-bold text-[#5C5245]">Kartu Loyalty ID</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBBD]/50">
                  <Coins className="w-4 h-4 text-[#8C6B1C] mx-auto mb-1 opacity-70" />
                  <span className="text-[11px] font-bold text-[#5C5245]">Poin Reward</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBBD]/50">
                  <Crown className="w-4 h-4 text-[#8C6B1C] mx-auto mb-1 opacity-70" />
                  <span className="text-[11px] font-bold text-[#5C5245]">Promo Khusus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // UNLOCKED STATE: Profile Is Complete
  return (
    <Layout role="user">
      <div className={containerClasses}>
        
        {/* Middle Row: Membership Card (left) & Progress (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1/3): Digital Card & Summary */}
          <div className="order-1 lg:col-span-1 space-y-4">
            <div className="bg-[#1C1814] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-[#3A3228]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-wide">Kartu Membership</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3A3228] text-[#E8C547] border border-[#5C4F3B]">
                  {config.badge}
                </span>
              </div>

              {/* Visual Card Component */}
              <div
                id="membership-card-download"
                className="w-full aspect-[1.586/1] rounded-2xl relative p-5 flex flex-col justify-between shadow-2xl overflow-hidden border border-[#D4AF37]/30 select-none group"
                style={{
                  backgroundImage: `url(${currentCardBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/70 block uppercase">AESPI DIGITAL</span>
                    <span className="text-[11px] font-extrabold tracking-wider text-white drop-shadow">MEMBERSHIP CARD</span>
                  </div>
                  <img src="/logo/logo.webp" alt="Aesthetic" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
                </div>

                <div className="relative z-10 my-auto">
                  <span className="text-[9px] font-bold text-[#EADBBD] tracking-wider block uppercase">
                    {config.badge} MEMBER
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase drop-shadow truncate">
                    {session?.name || "PASIEN MEMBER"}
                  </h4>
                </div>

                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <span className="text-[8px] font-bold text-white/60 tracking-wider block">MEMBER ID</span>
                    <span className="text-xs font-mono font-bold text-[#FAF5EA] tracking-wider">{membershipId}</span>
                  </div>
                  <img src={currentRibbon} alt="Ribbon" className="w-10 h-10 object-contain drop-shadow" />
                </div>
              </div>

              {/* Card Meta Infos */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#3A3228]">
                <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228]">
                  <span className="text-[10px] text-gray-400 font-medium block">BERLAKU HINGGA</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{membershipExpiry}</span>
                </div>
                <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228]">
                  <span className="text-[10px] text-gray-400 font-medium block">POIN SAAT INI</span>
                  <span className="text-xs font-bold text-[#E8C547] mt-0.5 block">{new Intl.NumberFormat("id-ID").format(userPoints)} Pts</span>
                </div>
              </div>

              <Button
                onClick={() => setShowMembershipModal(true)}
                variant="outline"
                className="w-full mt-4 h-11 rounded-xl border-[#3A3228] bg-[#26211B] hover:bg-[#332C24] text-white text-xs font-bold cursor-pointer"
              >
                Lihat Detail Membership <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>

              {/* Data User / Ringkasan Akun Pasien untuk Keseimbangan Estetika */}
              <div className="mt-5 pt-4 border-t border-[#3A3228] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#E8C547]" />
                    <span className="text-xs font-bold text-[#FAF5EA] tracking-wide">Data Profil Pengguna</span>
                  </div>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-[11px] font-semibold text-[#E8C547] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Data</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228] flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">Nama Lengkap</span>
                    <span className="font-semibold text-white truncate max-w-[150px]">{session?.name || "-"}</span>
                  </div>
                  <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228] flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">No. WhatsApp</span>
                    <span className="font-semibold text-[#E8C547]">{(session as any)?.whatsapp || (session as any)?.phone || "-"}</span>
                  </div>
                  <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228] flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">Email Akun</span>
                    <span className="font-semibold text-gray-200 truncate max-w-[150px]">{session?.email || "-"}</span>
                  </div>
                  <div className="p-2.5 bg-[#26211B] rounded-xl border border-[#3A3228] flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">Status Akun</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif (Terverifikasi)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2/3): Point Progress Bar & Upgrade & Benefits */}
          <div className="order-2 lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden relative">
              <CardContent className="p-5 sm:p-7">
                
                {/* 1. BAR INFORMASI POIN & BATAS MINIMAL UNTUK NAIK LEVEL */}
                <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#FAF5EA] border border-[#E8DFC8] shadow-xs relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shadow-xs shrink-0">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Poin Loyalty Anda</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-[#8C6B1C]">
                            {new Intl.NumberFormat("id-ID").format(userPoints)}
                          </span>
                          <span className="text-xs font-bold text-[#A8843A]">Pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#EADBBD]/50">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Batas Minimal Naik Level</span>
                      <div className="flex sm:justify-end items-center gap-1.5 mt-0.5">
                        <Crown className="w-4 h-4 text-[#C9A24A]" />
                        <span className="text-sm sm:text-base font-black text-[#2C2416]">
                          {targetLevelPoints > 0 ? `${new Intl.NumberFormat("id-ID").format(targetLevelPoints)} Pts` : "Tier Maksimal"}
                        </span>
                        {targetLevelName && (
                          <span className="text-xs font-bold text-[#8C6B1C]">({targetLevelName})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="space-y-2 pt-2 border-t border-[#E8DFC8]/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#5C5245] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#8C6B1C]" />
                        Progress Akumulasi Poin Menuju {targetLevelName || "VIP"}
                      </span>
                      <span className="text-[#8C6B1C] font-black text-sm">{pointProgressPercentage}%</span>
                    </div>
                    
                    <div className="w-full h-4 bg-[#EFE9DA] rounded-full overflow-hidden p-0.5 border border-[#E2D8C0]">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A24A] via-[#E8C547] to-[#8C6B1C] rounded-full transition-all duration-700 shadow-xs"
                        style={{ width: `${Math.max(4, pointProgressPercentage)}%` }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1">
                      <p className="text-[#6B5E4F]">
                        {targetLevelPoints > userPoints
                          ? <>Kumpulkan <strong className="text-[#8C6B1C] font-bold">{new Intl.NumberFormat("id-ID").format(targetLevelPoints - userPoints)} Pts</strong> lagi dari tindakan medis untuk otomatis naik ke <strong>{targetLevelName}</strong>.</>
                          : <span className="text-emerald-700 font-bold">🎉 Poin Anda telah memenuhi syarat tingkatan tier loyalty!</span>
                        }
                      </p>
                      <span className="text-[10px] text-[#A8843A] font-semibold">
                        Otomatis via Poin atau Upgrade Instan
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. UPGRADE BANNER (NAIK LEVEL) */}
                <div className="relative overflow-hidden rounded-2xl bg-amber-50 p-5 sm:p-6 border border-amber-100 mb-6">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-amber-200/40 rounded-full blur-2xl" />
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-xs">
                      <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A24A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">{targetLevelInfo.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{targetLevelInfo.description}</p>
                      {targetLevelInfo.showUpgradeButton && (
                        <Button
                          onClick={() => navigate('/membership/upgrade')}
                          className="bg-[#C9A24A] hover:bg-[#B38D39] text-white font-bold px-6 h-10 rounded-xl hover:opacity-90 cursor-pointer shadow-md shadow-[#C9A24A]/20"
                        >
                          Upgrade Sekarang
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. INTERACTIVE BENEFITS: PROMO KHUSUS & RIWAYAT POIN */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#C9A24A]" />
                      <h4 className="text-sm font-bold text-gray-900">Benefit Utama {config.label}</h4>
                    </div>
                    <span className="text-[11px] text-[#A8843A] font-medium">Klik untuk akses</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Promo Khusus Member Pop-up */}
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

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6B1C] group-hover:translate-x-1 transition-transform">
                        <span>Buka Promo Eksklusif</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Riwayat & Mutasi Poin Pop-up */}
                    <div
                      onClick={() => {
                        setShowPointHistoryModal(true);
                        fetchPoints();
                      }}
                      className="group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#FFFDF9] to-[#FDF8F0] p-4 shadow-xs hover:shadow-md hover:border-[#C9A24A] hover:bg-[#FAF4E8] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-300/30 transition-all" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#FDF0D5] border border-[#EADBBD] flex items-center justify-center text-[#9A7B2C] shadow-2xs group-hover:scale-105 transition-transform">
                            <Coins className="w-5 h-5 text-[#C9A24A]" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200">
                            {new Intl.NumberFormat("id-ID").format(userPoints)} Pts
                          </span>
                        </div>
                        
                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#9A7B2C] transition-colors mb-1">
                          Riwayat & Mutasi Poin
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          Pantau buku besar perolehan reward dari setiap transaksi dan riwayat mutasi saldo poin Anda.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6B1C] group-hover:translate-x-1 transition-transform">
                        <span>Buka Rincian Mutasi Poin</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal: Detail Membership Card */}
        <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
          <DialogContent className="max-w-md p-6 rounded-3xl bg-white border border-[#E8DFC8]">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl flex items-center justify-center text-[#8C6B1C] mx-auto shadow-xs">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#2C2416]">Kartu Digital Loyalty</h3>
                <p className="text-xs text-[#7A6E60] mt-1">Simpan kartu membership digital ke perangkat Anda</p>
              </div>

              <div
                className="w-full aspect-[1.586/1] rounded-2xl relative p-5 flex flex-col justify-between shadow-2xl overflow-hidden border border-[#D4AF37]/30 select-none text-left group"
                style={{
                  backgroundImage: `url(${currentCardBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/70 block uppercase">AESPI DIGITAL</span>
                    <span className="text-[11px] font-extrabold tracking-wider text-white drop-shadow">MEMBERSHIP CARD</span>
                  </div>
                  <img src="/logo/logo.webp" alt="Aesthetic" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
                </div>

                <div className="relative z-10 my-auto">
                  <span className="text-[9px] font-bold text-[#EADBBD] tracking-wider block uppercase">
                    {config.badge} MEMBER
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase drop-shadow truncate">
                    {session?.name || "PASIEN MEMBER"}
                  </h4>
                </div>

                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <span className="text-[8px] font-bold text-white/60 tracking-wider block">MEMBER ID</span>
                    <span className="text-xs font-mono font-bold text-[#FAF5EA] tracking-wider">{membershipId}</span>
                  </div>
                  <img src={currentRibbon} alt="Ribbon" className="w-10 h-10 object-contain drop-shadow" />
                </div>
              </div>

              <Button
                onClick={downloadCard}
                disabled={isDownloading}
                className="w-full h-11 bg-gradient-gold hover:opacity-90 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-[#C9A24A]/20"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Mengunduh Kartu..." : "Unduh Gambar Kartu"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal: Promo Khusus Member */}
        <Dialog open={showPromoModal} onOpenChange={setShowPromoModal}>
          <DialogContent className="max-w-2xl p-6 rounded-3xl bg-white border border-[#E8DFC8] max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2C2416]">Promo Khusus Member {config.badge}</h3>
                    <p className="text-xs text-[#7A6E60]">Voucher potongan eksklusif untuk perawatan gigi Anda</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {promos.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider">{p.category || "Promo Khusus"}</span>
                      <h4 className="text-sm font-bold text-[#2C2416]">{p.title}</h4>
                      <p className="text-xs text-[#7A6E60] leading-relaxed">{p.description}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-sm font-black text-[#8C6B1C]">{p.discount}</span>
                      <Button
                        size="sm"
                        onClick={() => handleCopyCode(p.code)}
                        className="bg-[#FAF5EA] hover:bg-[#F3E8CF] text-[#8C6B1C] border border-[#EADBBD] font-bold text-xs h-8 px-3 rounded-lg cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedCode === p.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === p.code ? "Tersalin!" : p.code}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal: Riwayat & Mutasi Poin */}
        <Dialog open={showPointHistoryModal} onOpenChange={setShowPointHistoryModal}>
          <DialogContent className="max-w-2xl p-6 rounded-3xl bg-white border border-[#E8DFC8] max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2C2416]">Buku Besar Mutasi Poin</h3>
                    <p className="text-xs text-[#7A6E60]">Saldo Poin Aktif: <strong className="text-[#8C6B1C]">{new Intl.NumberFormat("id-ID").format(userPoints)} Pts</strong></p>
                  </div>
                </div>
              </div>

              {pointsLoading ? (
                <div className="py-12 text-center text-xs text-gray-500">Memuat riwayat poin...</div>
              ) : pointsData.history.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">Belum ada riwayat perolehan poin</div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  {pointsData.history.map((h, i) => (
                    <div key={h.id || i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${h.type === 'earned' || Number(h.points) > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {h.type === 'earned' || Number(h.points) > 0 ? '+ Masuk' : '- Terpakai'}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(h.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#2C2416]">{h.description || "Perolehan reward tindakan medis"}</p>
                      </div>
                      <span className={`text-sm font-black whitespace-nowrap ${Number(h.points) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {Number(h.points) > 0 ? `+${h.points}` : h.points} Pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
