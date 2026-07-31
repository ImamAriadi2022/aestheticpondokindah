import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/demoAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { logger } from "@/lib/logger";
import {
  Star,
  X,
  Download,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  Percent,
  Bell,
  Heart,
  FolderOpen,
  ChevronRight,
  Calendar,
  Award,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import * as htmlToImage from 'html-to-image';
import { membershipApi, MembershipData } from "@/lib/membershipApi";

export default function MembershipPage() {
  // Detect mobile to decide which layout (ensure new bottom bar on mobile)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // Ambil session dari demo atau backend asli
  let session = getSession();
  if (!session) {
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Map role backend ke role yang diharapkan frontend
        const role = user.role === "patient" ? "user" : user.role;
        session = { ...user, role };
      } catch (e) {
        logger.error("Gagal parse user session", e);
      }
    }
  }

  const navigate = useNavigate();

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [apiMembership, setApiMembership] = useState<MembershipData | null>(null);

  useEffect(() => {
    membershipApi.getMembership()
      .then((data) => {
        if (data) setApiMembership(data);
      })
      .catch((err) => {
        logger.warn("Fetch real membership API fallback to session:", err);
      });
  }, []);

  // Unified Gold Theme Membership Configuration
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
    diamond: {
      label: 'VIP Member',
      badge: 'DIAMOND',
      icon: Zap,
      gradient: 'from-[#FFF8E7] to-[#F5E6C8]',
      lightGradient: 'from-[#FFF8E7]/20 to-[#F5E6C8]/20',
      textColor: 'text-[#F5E6C8]',
      bgColor: 'bg-[#FFF8E7]',
    },
  };

  const upgradeThresholds = {
    bronze: { to: 'gold', amount: 5000000, label: 'Gold' },
    gold: { to: 'platinum', amount: 15000000, label: 'Platinum' },
    platinum: { to: 'diamond', amount: 30000000, label: 'Diamond' },
    diamond: null,
  };

  // Ambil tier dari API backend (atau fallback ke session)
  const currentTier = apiMembership?.membership?.level || (session as any)?.membership_level || 'bronze';
  const config = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig.bronze;
  const userPoints = apiMembership?.membership?.points ?? (session as any)?.membership_points ?? 0;
  const membershipExpiry = apiMembership?.membership?.expires_at 
    ? new Date(apiMembership.membership.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "Seumur Hidup";
  const generateMemberId = (userId: string | number) => {
    const id = String(userId).toUpperCase();
    if (id.startsWith("AESPI_")) return `MEM-${id}`;
    return `MEM-AESPI_${String(userId).padStart(2, "0")}`;
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

  const calculateProgress = () => {
    if (!session) return 0;
    const fields = [
      "name",
      "email",
      "phone",
      "gender",
      "birthDate",
      "bloodType",
      "job",
      "address",
      "province",
      "city",
      "sourceInfo",
    ];
    
    const filledFields = fields.filter((field) => {
      // Handle both backend style (snake_case) and frontend style (camelCase)
      const s = session as any;
      const value = s[field] ||
                    s[field.replace(/([A-Z])/g, "_$1").toLowerCase()] ||
                    s[field === 'phone' ? 'whatsapp' : field] ||
                    s[field === 'bloodType' ? 'blood_type' : field] ||
                    s[field === 'address' ? 'address_line' : field];
      return !!value;
    });

    const interests = (session as any).interests || [];
    const interestScore = interests.length > 0 ? 1 : 0;
    const dentalComplaintsScore = Array.isArray((session as any).dentalComplaints) && (session as any).dentalComplaints.length > 0 ? 1 : 0;
    const desiredServicesScore = Array.isArray((session as any).desiredServices) && (session as any).desiredServices.length > 0 ? 1 : 0;

    const totalFields = fields.length + 3;
    const totalFilled = filledFields.length + interestScore + dentalComplaintsScore + desiredServicesScore;
    
    return Math.round((totalFilled / totalFields) * 100);
  };

  const progress = calculateProgress();
  const isProfileComplete = progress >= 100;

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
    ? "w-full mx-auto px-4 py-5 space-y-5"
    : "w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-6 space-y-6";

  return (
    <Layout role="user">
      <div className={containerClasses}>
        
        {/* Top Stats Row removed as per request */}

        {/* Middle Row: Membership Card (left) & Progress (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Menuju Gold (Right - 2/3) */}
          <Card className="order-2 lg:col-span-2 lg:order-2 rounded-2xl border-0 shadow-sm bg-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#C9A24A]" />
                  <h3 className="font-bold text-gray-900">Progress Menuju Gold</h3>
                </div>
              </div>

              <div className="relative mb-8">
                {/* Upgrade Banner replacing totals & chart */}
                <div className="relative overflow-hidden rounded-2xl bg-amber-50 p-5 sm:p-6 border border-amber-100">
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-amber-200/40 rounded-full blur-2xl" />
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow">
                      <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A24A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">Naik Level ke Gold Member</h3>
                      <p className="text-sm text-gray-600 mb-4">Nikmati prioritas booking, benefit eksklusif, dan poin reward lebih banyak dengan upgrade ke Gold Member.</p>
                      {/* mini-benefits list removed as requested */}
                      <Button onClick={() => navigate('/membership/upgrade')} className="bg-[#C9A24A] text-white font-bold px-5 h-10 hover:opacity-90">Upgrade Sekarang</Button>
                    </div>
                  </div>
                </div>

                {/* Compact Benefit Bronze Member - placed under banner */}
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-[#C9A24A]" />
                    <h4 className="text-sm font-semibold text-gray-900">Benefit Bronze Member</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Percent, title: "Promo Khusus", desc: "Promo eksklusif member" },
                      { icon: Bell, title: "Reminder Kontrol", desc: "Pengingat berkala" },
                      { icon: Heart, title: "Rekomendasi Perawatan", desc: "Sesuai kebutuhan" },
                      { icon: FolderOpen, title: "Riwayat Tersimpan", desc: "Data aman" },
                    ].map((benefit, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center">
                            <benefit.icon className="w-4 h-4 text-[#C9A24A]" />
                          </div>
                          <span className="text-[12px] font-semibold text-gray-900 truncate">{benefit.title}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-snug">{benefit.desc}</p>
                      </div>
                    ))}
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
                
                {/* Digital Card Preview */}
                <div className="relative aspect-[1.58/1] w-full bg-gradient-to-br from-[#1a1612] to-[#2a2319] rounded-2xl p-5 overflow-hidden border border-[#C9A24A]/20 shadow-2xl mb-6">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A24A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E8C547]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                  
                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[7px] text-white/40 uppercase tracking-[0.2em] mb-0.5">AESPI DIGITAL</p>
                        <p className="text-[7px] text-white/40 uppercase tracking-[0.2em]">MEMBERSHIP CARD</p>
                      </div>
                      <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-0.5 h-0.5 bg-[#C9A24A]/30 rounded-full" />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[8px] text-[#C9A24A] font-bold tracking-widest mb-1 uppercase">{config.badge} MEMBER</p>
                      <h4 className="text-base font-black text-white tracking-wider uppercase truncate">
                        {(session as any)?.name || 'ROBIN SYAIFUDDIN'}
                      </h4>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[7px] text-white/40 uppercase tracking-[0.2em] mb-1">MEMBER ID</p>
                        <p className="text-[10px] font-mono text-[#D4C5B0] tracking-wider uppercase">{membershipId}</p>
                      </div>
                      <div className="w-12 h-12 relative">
                        <img
                          src={`/dashboard/${currentTier}.png`}
                          alt={currentTier}
                          className="w-full h-full object-contain drop-shadow-lg"
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
                        <p className="text-xs font-bold text-white leading-tight">Gold Member</p>
                      </div>
                    </div>
                    <button className="text-[10px] text-[#C9A24A] font-bold hover:underline">
                      Upgrade
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowMembershipModal(true)}
                  className="w-full py-3 rounded-xl border border-[#C9A24A]/30 text-[#C9A24A] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#C9A24A] hover:text-[#1a1612] transition-all"
                >
                  Lihat Detail Membership <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Old Benefit Section removed; benefits shown compactly under progress */}

        {/* Bottom upgrade banner removed as requested */}

        <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 !bg-transparent !border-0 !shadow-none">
            <div className="flex flex-col items-center">
              <div id="membership-card-modal" className="w-full aspect-[1.58/1] rounded-[1.5rem] relative overflow-hidden shadow-2xl">
                {/* Background Image - cardbronze.png */}
                <img
                  src="/dashboard/cardbronze.png"
                  alt="Card Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    {/* Left - Brand Name */}
                    <div className="flex flex-col">
                      <h3 className="text-[#F5E6C8] text-3xl sm:text-4xl font-extralight tracking-[0.1em] leading-none">aesthetic</h3>
                      <p className="text-[#D4A84B] text-xs sm:text-sm tracking-[0.3em] lowercase mt-1">pondok indah</p>
                      <p className="text-[#B8943F] text-[9px] sm:text-[10px] tracking-[0.4em] mt-2 font-medium uppercase">{config.badge} MEMBERSHIP</p>
                    </div>
                    {/* Right - Logo & Membership */}
                    <div className="flex flex-col items-end gap-0.5">
                      {/* Clinic Logo */}
                      <img
                        src="/logo/logo.png"
                        alt="Aesthetic Pondok Indah"
                        className="h-10 sm:h-12 w-auto object-contain brightness-0 invert sepia-[.3] hue-rotate-[-10deg] saturate-[3]"
                      />
                    </div>
                  </div>

                  {/* Middle Section - Card Details */}
                  <div className="mt-auto mb-1">
                    <p className="text-[#C9A24A]/70 text-[9px] sm:text-[10px] tracking-[0.3em] mb-1.5 font-medium uppercase">Nama Pemilik</p>
                    <h4 className="text-[#F5E6C8] text-xl sm:text-2xl font-bold tracking-[0.15em] truncate uppercase">
                      {(session as any)?.name?.toUpperCase() || 'ROBIN SYAIFUDDIN'}
                    </h4>
                    {/* Card Number - 4 blocks format */}
                    <p className="text-[#E8D5B5] text-lg sm:text-xl font-mono tracking-[0.2em] mt-2 uppercase" style={{fontFamily: "'Courier New', Courier, monospace"}}>
                      0145  2000  1234  5678
                    </p>
                  </div>

                  {/* Bottom Section - Valid Thru */}
                  <div className="flex items-center gap-3">
                    <p className="text-[#C9A24A]/70 text-[8px] sm:text-[9px] tracking-[0.2em] font-medium uppercase">Valid Thru</p>
                    <p className="text-[#F5E6C8] text-sm sm:text-base font-bold tracking-wide" style={{fontFamily: "'Courier New', Courier, monospace"}}>04/26</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={downloadCard} disabled={isDownloading} className="bg-[#c9a24a] text-white px-6 py-4 h-auto font-bold rounded-xl shadow-xl flex items-center gap-2 transition-all active:scale-95 text-sm">
                  {isDownloading ? "Mengunduh..." : <><Download className="w-4 h-4" /> Download PNG</>}
                </Button>
                <Button onClick={() => setShowMembershipModal(false)} className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
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

