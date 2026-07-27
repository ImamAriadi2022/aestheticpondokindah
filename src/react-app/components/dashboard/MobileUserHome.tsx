import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  MessageSquare,
  Crown,
  Sparkles,
  Calendar,
  Stethoscope,
  User,
  MessageCircle,
  Edit3,
  MapPin,
  ChevronDown,
  Bell,
  Percent,
} from "lucide-react";

export default function MobileUserHome({
  session,
  consultations,
  complaints,
  isMembership,
  progress,
}: {
  session: any;
  consultations: any[];
  complaints: any[];
  isMembership: boolean;
  progress: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const userName = session?.name || "Pengguna";
  const firstName = userName.split(" ")[0] || userName;
  const initials = (session?.name || "U").charAt(0).toUpperCase();

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="space-y-5 pt-2 pb-6">
      {/* Top Header */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3 text-[#C9A24A]" />
          <span className="font-medium text-gray-700">Aesthetic Pondok Indah Dental</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4">
        <p className="text-sm text-gray-500">Selamat datang,</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
          {firstName} Saifuddin <span className="inline-block">👋</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="px-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokter, layanan, atau konsultasi..."
              className="w-full pl-9 pr-4 py-3 bg-gray-100 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
            />
          </div>
          <button
            type="button"
            className="w-11 h-11 bg-[#C9A24A] rounded-2xl flex items-center justify-center text-white shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Welcome Hero Card */}
      <div className="px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FDF8F0] via-[#F5E9D8]/60 to-[#FDF8F0] rounded-3xl p-4 border border-[#C9A24A]/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A24A]/5 rounded-full blur-2xl -translate-y-1/3 translate-x-1/4" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#5C4A32] mb-1">
                Semoga harimu menyenangkan! <Sparkles className="w-3.5 h-3.5 inline text-[#C9A24A]" />
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B7355]">Hari Ini</p>
                    <p className="text-xs font-semibold text-[#5C4A32]">{todayStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-[#C9A24A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B7355]">Status</p>
                    <p className="text-xs font-semibold text-[#5C4A32]">Siap Konsultasi</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-28 h-28 relative shrink-0 -mr-2 -my-2">
              <img
                src="/dashboard/sapadokter.png"
                alt="Dokter"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3d2e1e] via-[#2a1f12] to-[#3d2e1e] rounded-3xl p-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A24A]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Crown className="w-3.5 h-3.5 text-[#E8C547]" />
                <p className="text-xs font-bold text-[#E8C547]">Promo Spesial Untuk Anda</p>
              </div>
              <p className="text-[10px] text-[#D4C5B0] mb-0.5">Dapatkan diskon hingga</p>
              <p className="text-3xl font-bold text-[#C9A24A] leading-tight">25%</p>
              <p className="text-[10px] text-[#D4C5B0]">untuk semua perawatan</p>
            </div>
            <div className="relative w-28 h-24 shrink-0">
              <img
                src="/dashboard/gigi.png"
                alt="Promo"
                className="w-full h-full object-contain drop-shadow-xl"
              />
              <div className="absolute top-0 right-0 w-7 h-7 bg-[#C9A24A] rounded-full flex items-center justify-center shadow-lg">
                <Percent className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <Link
          to="/dashboard/user?tab=konsultasi&view=quick"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 text-[#C9A24A]" />
          </div>
          <h4 className="font-bold text-[#5C4A32] text-sm mb-0.5">Konsultasi Cepat</h4>
          <p className="text-[10px] text-[#8B7355] mb-3 leading-relaxed">Chat langsung dengan dokter gigi</p>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-[10px] font-semibold rounded-full">
            <span>Mulai Chat</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          to="/dashboard/user?tab=konsultasi&view=schedule"
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-[#C9A24A]" />
          </div>
          <h4 className="font-bold text-[#5C4A32] text-sm mb-0.5">Booking Jadwal</h4>
          <p className="text-[10px] text-[#8B7355] mb-3 leading-relaxed">Atur janji dengan dokter pilihan</p>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-[10px] font-semibold rounded-full">
            <span>Atur Jadwal</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Quick Access */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/dashboard/user?tab=reservasi"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs font-medium text-gray-700">Reservasi</span>
          </Link>
          <Link
            to="/services"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs font-medium text-gray-700">Layanan</span>
          </Link>
          <Link
            to="/doctors"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
              <User className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-xs font-medium text-gray-700">Dokter</span>
          </Link>
        </div>
      </div>

      {/* Membership Profile Card */}
      <div className="px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1612] via-[#221b15] to-[#1a1612] rounded-3xl p-4 border border-[#C9A24A]/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#C9A24A]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{userName}</p>
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-[#E8C547]" />
                    <span className="text-[10px] text-[#C9A24A]">Bronze Member</span>
                  </div>
                </div>
              </div>
              <Crown className="w-5 h-5 text-[#E8C547]" />
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[#D4C5B0]">Progress Kelengkapan Profil</span>
                <span className="text-[10px] font-bold text-[#C9A24A]">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A24A] to-[#E8C547] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Link
              to="/settings?tab=profile"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-[#1a1612] text-xs font-semibold rounded-xl active:scale-[0.98] transition-transform"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Membership Tier Card */}
      {isMembership ? (
        <div className="px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#C9A24A] via-[#B8943F] to-[#8a6b2b] rounded-3xl p-4 shadow-lg">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-1">Status Membership</p>
                <h3 className="text-lg font-bold text-white mb-3">BRONZE MEMBER</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/80">Diskon perawatan</span>
                    <span className="text-[10px] font-bold text-white">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/80">Prioritas booking</span>
                    <span className="text-[10px] font-bold text-white">Standar</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/60 mt-3">Berlaku hingga 31 Des 2025</p>
              </div>
              <div className="w-14 h-14 relative shrink-0">
                <img
                  src="/dashboard/bronze.png"
                  alt="Bronze"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1612] via-[#221b15] to-[#1a1612] rounded-2xl p-4 border border-[#C9A24A]/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#C9A24A]/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h3 className="text-base font-bold text-white mb-1">
                Upgrade ke <span className="text-[#E8C547]">Membership</span>
              </h3>
              <p className="text-xs text-[#A89F91] mb-3">
                Nikmati konsultasi prioritas, diskon 25%, dan akses ke dokter spesialis.
              </p>
              <Link
                to="/membership"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-[#1a1612] text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
              >
                <span>Lihat Keuntungan</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/dashboard/user?tab=konsultasi"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-lg font-bold text-gray-900">{consultations.length}</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">Konsultasi</span>
          </Link>
          <Link
            to="/dashboard/user?tab=konsultasi"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              {consultations.filter((c) => c.status !== "Selesai").length}
            </span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">Aktif</span>
          </Link>
          <Link
            to="/dashboard/user?tab=pengaduan"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-lg font-bold text-gray-900">{complaints.length}</span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">Pengaduan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

