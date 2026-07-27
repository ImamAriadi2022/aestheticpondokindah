import { Link } from "react-router";
import {
  ChevronRight,
  CalendarDays,
  Clock,
  TrendingUp, 
  CreditCard, 
  Edit3,
  Award,
  MessageCircle,
  Stethoscope,
  User,
  Star,
  ArrowRight,
} from "lucide-react";

interface RightPanelProps {
  session: any;
  navbarLabel: string;
  role: "user" | "clinic" | "doctor";
  recentActivity?: { title: string; subtitle: string; time: string; icon?: React.ElementType }[];
  consultationsCount?: number;
  activeTreatmentsCount?: number;
  availableDoctorsCount?: number;
}

export default function DashboardRightPanel({
  session,
  navbarLabel,
  role,
  recentActivity = [],
  consultationsCount = 0,
  activeTreatmentsCount = 0,
  availableDoctorsCount = 0,
}: RightPanelProps) {
  const userName = session?.name || "User";
  const initial = (userName[0] || "U").toUpperCase();
  // Use these variables to avoid unused warnings
  void navbarLabel;
  void consultationsCount;
  void activeTreatmentsCount;
  void availableDoctorsCount;

  const getRoleTitle = () => {
    if (role === "doctor") return "Dokter";
    if (role === "clinic") return "Admin";
    return "Member";
  };

  // Light theme for user role - Matching reference image
  if (role === "user") {
    return (
      <aside className="w-[320px] min-w-[320px] bg-white p-4 pl-3 hidden lg:flex flex-col gap-5 overflow-y-auto">
        {/* Top Quick Stats Icons */}
        <div className="flex items-center justify-center gap-4 pb-4 border-b border-gray-100">
          <Link to="/dashboard/user?tab=reservasi" className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer">
              <CalendarDays className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs text-[#5C4A32] font-medium">Reservasi</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer">
              <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs text-[#5C4A32] font-medium">Layanan</span>
          </Link>
          <Link to="/doctors" className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center border border-[#C9A24A]/20 hover:bg-[#F5E9D8] transition-colors cursor-pointer">
              <User className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs text-[#5C4A32] font-medium">Dokter</span>
          </Link>
        </div>

        {/* Edit Profil Card - Styled like image 3 reference */}
        <div className="bg-gradient-to-br from-[#3D3428] to-[#2A241C] rounded-2xl p-5 text-white shadow-lg">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {userName[0]?.toUpperCase() || "R"}
            </div>
            <div>
              <h3 className="font-bold text-white">{userName}</h3>
              <span className="text-xs text-[#C9A24A]">Bronze Member</span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Progress Kelengkapan Profil</span>
              <span>85%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-[#E8C547] to-[#C9A24A] rounded-full" />
            </div>
          </div>
          
          {/* Edit Profil Button */}
          <Link to="/settings">
            <button className="w-full py-3 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] rounded-xl font-medium text-sm text-white transition-all flex items-center justify-center gap-2 group">
              <Edit3 className="w-4 h-4" />
              Edit Profil
            </button>
          </Link>
        </div>

        {/* Membership Card */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#5C4A32] font-bold flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-[#C9A24A]" />
              Membership
            </h4>
            <Link to="/membership" className="text-xs text-[#8B7355] hover:text-[#C9A24A] flex items-center gap-1 transition-colors">
              Detail
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-[#C9A24A] to-[#B8943F] rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/80 mb-1">Level Membership</p>
                <p className="text-lg font-bold text-white tracking-wide">BRONZE MEMBER</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Diskon perawatan</span>
                <span className="font-semibold text-white">10%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Prioritas booking</span>
                <span className="font-semibold text-white">Standar</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <span className="text-xs text-white/70">Berlaku hingga</span>
              <span className="text-xs font-semibold text-white">31 Des 2024</span>
            </div>
          </div>
        </div>

      </aside>
    );
  }

  return (
    <aside className="w-[280px] min-w-[280px] bg-white border-l border-gray-100 p-5 hidden lg:flex flex-col gap-6 overflow-y-auto">
      {/* Profile - Uses initial variable */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#E8C547] to-[#C9A24A] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#C9A24A]/30 mb-3" title={`Profile: ${navbarLabel}`}>
          {initial}
        </div>
        <h3 className="text-sm font-bold text-gray-900">{userName}</h3>
        <p className="text-xs text-gray-500">{navbarLabel}</p>
        <Link
          to="/settings"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#C9A24A] hover:underline"
        >
          Edit Profil <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Mini Stats */}
      <div className="bg-gradient-to-br from-[#E8C547]/10 to-[#C9A24A]/10 rounded-2xl p-4">
        <p className="text-xs text-gray-500 mb-1">Status Akun</p>
        <p className="text-sm font-bold text-gray-900">{getRoleTitle()}</p>
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#C9A24A]" />
          <span className="text-xs text-[#B8943F] font-medium">Aktif</span>
        </div>
      </div>

      {/* Membership Card */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#C9A24A] to-[#B8943F] text-white shadow-lg p-6 space-y-4">
        <div>
          <p className="text-sm opacity-80">Membership</p>
          <p className="text-2xl font-bold">PRO</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Masa aktif</p>
            <p className="text-sm font-semibold">12/2026</p>
          </div>
          <CreditCard className="w-10 h-10 opacity-70" />
        </div>
        <button className="w-full py-2 bg-white/20 rounded-full text-xs font-semibold hover:bg-white/30 transition">Upgrade</button>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900">Aktivitas Terbaru</h4>
            <Link to="#" className="text-[10px] font-medium text-[#C9A24A]">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.slice(0, 4).map((item, i) => {
              const Icon = item.icon || CalendarDays;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8C547]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#C9A24A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-500">{item.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Contact */}
      <div className="mt-auto bg-gray-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-900 mb-1">Butuh Bantuan?</p>
        <p className="text-[10px] text-gray-500 mb-2">Hubungi admin klinik kapan saja.</p>
        <a
          href="https://wa.me/6281990114949"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 bg-[#3b82f6] text-white text-xs font-semibold rounded-xl text-center hover:bg-[#2563eb] transition-colors"
        >
          Chat Admin
        </a>
      </div>
    </aside>
  );
}
