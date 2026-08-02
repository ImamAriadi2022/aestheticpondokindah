import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import NewMobileDashboardLayout from "@/core/layouts/NewMobileDashboardLayout";
import { getSession } from "@/core/auth/services/session";
import { Button } from "@/shared/ui/button";
import { PullToRefresh } from "@/shared/ui/PullToRefresh";
import { mobileSyncManager } from "@/features/patient/mobile/services/mobileSyncManager";
import { 
  CalendarDays, 
  MessageSquareText, 
  Crown, 
  Gift, 
  FileText, 
  MapPin, 
  Phone, 
  Stethoscope,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
  Heart,
  Zap,
  Shield
} from "lucide-react";

const services = [
  { icon: CalendarDays, label: "Booking", color: "from-[#c9a24a] to-[#a8843a]", href: "/dashboard/user?tab=booking", desc: "Reservasi" },
  { icon: MessageSquareText, label: "Konsultasi", color: "from-blue-500 to-blue-600", href: "/dashboard/user?tab=konsultasi", desc: "Chat" },
  { icon: Crown, label: "Membership", color: "from-purple-500 to-purple-600", href: "/membership", desc: "Benefit" },
  { icon: Gift, label: "Promo", color: "from-pink-500 to-rose-500", href: "/promo", desc: "Diskon" },
  { icon: FileText, label: "Riwayat", color: "from-emerald-500 to-teal-500", href: "/dashboard/user?tab=riwayat", desc: "Medis" },
  { icon: MapPin, label: "Cabang", color: "from-orange-500 to-amber-500", href: "/branches", desc: "Lokasi" },
  { icon: Phone, label: "Darurat", color: "from-red-500 to-rose-600", href: "tel:+6281990114949", desc: "24 Jam" },
  { icon: Sparkles, label: "Lainnya", color: "from-gray-500 to-gray-600", href: "/services", desc: "Layanan" },
];

const featuredServices = [
  { label: "Konsultasi Gigi", icon: Stethoscope, price: "Rp 150K", time: "30 min", gradient: "from-blue-500 to-blue-600" },
  { label: "Scaling Gigi", icon: Sparkles, price: "Rp 300K", time: "45 min", gradient: "from-emerald-500 to-teal-500" },
  { label: "Pemutihan Gigi", icon: Zap, price: "Rp 2.5jt", time: "60 min", gradient: "from-purple-500 to-pink-500" },
  { label: "Behel Premium", icon: Crown, price: "Rp 15jt", time: "Konsultasi", gradient: "from-[#c9a24a] to-[#a8843a]" },
];

export default function MobileHomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const loadUserSession = () => {
    setSession(getSession());
  };

  useEffect(() => {
    loadUserSession();
    const unsubscribe = mobileSyncManager.subscribe(() => {
      loadUserSession();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Semua pengguna terdaftar adalah member. Tier menentukan label.
  const isPaidMember = session?.membership_level === "gold" || session?.membership_level === "platinum";
  const userName = session?.name?.split(" ")[0] || "Pengguna";
  // Determine current membership tier for assets (default bronze)
  const currentTier = (session as any)?.membership_level || "bronze";
  const tierImageSrc = `/dashboard/${currentTier}.png`;

  return (
    <NewMobileDashboardLayout role="user">
      <PullToRefresh onRefresh={async () => { mobileSyncManager.syncAll(true); }}>
      {/* LUXURY HEADER SECTION */}
      <div className="relative bg-gradient-to-br from-white via-white to-[#c9a24a]/10 px-4 pt-6 pb-5 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a24a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-20 left-0 w-20 h-20 bg-[#c9a24a]/5 rounded-full blur-2xl -translate-x-1/2" />
        
        <div className="relative">
          {/* Premium Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#c9a24a]/10 to-[#a8843a]/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a24a]" />
              <span className="text-xs font-semibold text-[#c9a24a] tracking-wide">PREMIUM EXPERIENCE</span>
            </div>
          </div>
          
          {/* Main Greeting */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            Halo, <span className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-light">
            Mari jaga kesehatan gigi Anda dengan pelayanan terbaik
          </p>
        </div>
      </div>

      {/* PREMIUM SEARCH BAR */}
      <div className="px-4 -mt-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari layanan, dokter, atau cabang..."
            className="w-full pl-12 pr-14 py-4 bg-white rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30 shadow-lg shadow-gray-100"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] rounded-xl flex items-center justify-center text-white shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="space-y-5 pb-8 pt-4">
        
        {/* LUXURY MEMBERSHIP CARD */}
        <div className="px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-5 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c9a24a]/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c9a24a]/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4" />
            
            {/* Gold shine line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a24a]/10 to-transparent -translate-x-full animate-shimmer" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] px-3 py-1.5 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{currentTier === 'gold' ? 'Gold Member' : currentTier === 'platinum' ? 'Platinum Member' : 'Bronze Member'}</span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{isPaidMember ? 'Member Eksklusif' : 'Bronze Member Gratis'}</h3>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  {isPaidMember ? 'Nikmati diskon 25% untuk semua perawatan gigi premium' : 'Dapatkan benefit eksklusif dengan upgrade ke Gold'}
                </p>
                <button
                  onClick={() => navigate('/membership')}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  {isPaidMember ? 'Lihat Benefit' : 'Upgrade Sekarang'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg shadow-[#c9a24a]/30 relative overflow-hidden">
                <img src={tierImageSrc} alt={`${currentTier} membership`} className="w-full h-full object-contain" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0f172a]">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PREMIUM SERVICES GRID */}
        <div className="px-4">
          <div className="grid grid-cols-4 gap-4">
            {services.map((service) => (
              <Link
                key={service.label}
                to={service.href}
                className="group flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-all duration-300`}>
                  <service.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">
                  {service.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* FEATURED SERVICES CAROUSEL */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#c9a24a] to-[#a8843a] rounded-full" />
              <h2 className="text-base font-bold text-gray-900">Layanan Unggulan</h2>
            </div>
            <Link to="/services" className="text-xs font-semibold text-[#c9a24a] flex items-center gap-1">
              Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {featuredServices.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate("/dashboard/user?tab=booking")}
                className="flex-shrink-0 w-36 bg-white rounded-2xl p-4 shadow-md border border-gray-100 active:scale-95 transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{service.label}</h3>
                <p className="text-xs text-gray-400 mb-2">{service.time}</p>
                <p className="text-sm font-bold text-[#c9a24a]">{service.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING APPOINTMENT - PREMIUM CARD */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#c9a24a] to-[#a8843a] rounded-full" />
              <h2 className="text-base font-bold text-gray-900">Jadwal Berikutnya</h2>
            </div>
            <Link to="/dashboard/user?tab=riwayat" className="text-xs font-semibold text-[#c9a24a] flex items-center gap-1">
              Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-xl shadow-gray-100 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#c9a24a]/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">drg. Jenny Wilson</h3>
                    <p className="text-xs text-gray-500 font-medium">Dokter Gigi Spesialis</p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Konfirmasi
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <CalendarDays className="w-3.5 h-3.5 text-[#c9a24a]" />
                      <span className="font-medium">Senin, 5 Mei 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#c9a24a]" />
                      <span className="font-medium">10:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
              <Button 
                size="sm"
                className="flex-1 h-11 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#c9a24a]/20"
              >
                Lihat Detail
              </Button>
              <button className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* PROMO SLIDER - PREMIUM */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#c9a24a] to-[#a8843a] rounded-full" />
              <h2 className="text-base font-bold text-gray-900">Promo Eksklusif</h2>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === i ? 'w-4 bg-[#c9a24a]' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {[
                { title: "Diskon 30%", subtitle: "Pemutihan Gigi Premium", color: "from-[#c9a24a] to-[#a8843a]" },
                { title: "Gratis Scaling", subtitle: "Untuk Member Gold", color: "from-purple-500 to-pink-500" },
                { title: "Diskon 50%", subtitle: "Konsultasi Pertama", color: "from-blue-500 to-cyan-500" },
              ].map((promo, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div 
                    onClick={() => navigate("/promo")}
                    className={`bg-gradient-to-r ${promo.color} p-6 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full mb-2 uppercase tracking-wide">
                          Limited Time
                        </span>
                        <h3 className="text-white font-bold text-2xl">{promo.title}</h3>
                        <p className="text-white/80 text-sm">{promo.subtitle}</p>
                      </div>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Gift className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK BOOKING BUTTON */}
        <div className="px-4">
          <button
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="w-full h-16 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-base shadow-xl shadow-[#c9a24a]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <CalendarDays className="w-6 h-6" />
            Booking Sekarang
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* HEALTH TIPS - PREMIUM CARD */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#c9a24a] to-[#a8843a] rounded-full" />
              <h2 className="text-base font-bold text-gray-900">Tips Kesehatan</h2>
            </div>
            <Link to="/blog" className="text-xs font-semibold text-[#c9a24a] flex items-center gap-1">
              Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Tips Senyum Sehat
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Sikat gigi 2x sehari dengan teknik yang benar, gunakan benang gigi, dan rutin kontrol ke dokter gigi setiap 6 bulan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NEAREST BRANCH - PREMIUM */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#c9a24a] to-[#a8843a] rounded-full" />
              <h2 className="text-base font-bold text-gray-900">Cabang Terdekat</h2>
            </div>
            <Link to="/branches" className="text-xs font-semibold text-[#c9a24a] flex items-center gap-1">
              Lihat Peta
              <MapPin className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-100 border border-gray-100">
            <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzNjYTI0YSIgb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] opacity-20" />
              <div className="text-center">
                <MapPin className="w-10 h-10 text-[#c9a24a] mx-auto mb-2" />
                <span className="text-white/60 text-xs">Aesthetic Pondok Indah</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">Aesthetic Pondok Indah</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    Jl. Pondok Indah Raya No. 12, Kebayoran Lama, Jakarta Selatan
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-700">4.9</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium text-green-600">Buka</span>
                    </span>
                  </div>
                </div>
                <button className="w-12 h-12 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#c9a24a]/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

      </PullToRefresh>
    </NewMobileDashboardLayout>
  );
}
