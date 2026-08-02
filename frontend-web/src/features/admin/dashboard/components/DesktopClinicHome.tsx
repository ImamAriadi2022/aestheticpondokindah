import { Link } from "react-router";
import {
  Users,
  FileText,
  Calendar,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import Sparkline from "@/shared/ui/Sparkline";

export default function DesktopClinicHome({
  session,
  stats,
  users,
  doctorSchedules,
  consultations,
  complaints,
}: {
  session: any;
  stats: any[];
  users: any[];
  doctorSchedules: any[];
  consultations: any[];
  complaints: any[];
}) {
  const statItems = [
    {
      label: "Total Pengguna",
      value: stats[0]?.value || 0,
      icon: Users,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "12%",
      trendLabel: "Bulan ini",
      sparklineData: [10, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, 75],
    },
    {
      label: "Artikel",
      value: stats[1]?.value || 0,
      icon: FileText,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "8%",
      trendLabel: "Tersedia",
      sparklineData: [15, 20, 18, 28, 25, 32, 30, 38, 35, 42, 40, 48],
    },
    {
      label: "Jadwal Dokter",
      value: doctorSchedules.length,
      icon: Calendar,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "5%",
      trendLabel: "Update harian",
      sparklineData: [5, 10, 8, 15, 12, 18, 15, 22, 20, 25, 22, 28],
    },
    {
      label: "Pengunjung",
      value: stats[3]?.value || 0,
      icon: BarChart3,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "15%",
      trendLabel: "Minggu ini",
      sparklineData: [20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80],
    },
  ];

  const pendingConsultations = consultations.filter(
    (c) => c.status === "Menunggu" || c.status === "Dijadwalkan"
  );
  void complaints;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FDF6EC] via-[#F8ECD8] to-[#F2E0C4] p-6 sm:p-8 shadow-sm border border-[#E8D4A2]/40">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35]">
              Selamat datang, {session?.name?.split(" ")[0] || "Admin"}!
            </h2>
            <p className="text-sm text-[#8A7B6B] mt-2 leading-relaxed">
              Kelola pengguna, konten, dan jadwal dokter dari dashboard ini.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                to="/dashboard/clinic?tab=doctors"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-sm font-semibold hover:from-[#B8943F] hover:to-[#A67F3A] transition-all shadow-md shadow-[#C9A24A]/20"
              >
                <Stethoscope className="w-4 h-4" /> Kelola Dokter
              </Link>
              <Link
                to="/dashboard/clinic?tab=reservasi"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#8A6B2B] rounded-xl text-sm font-semibold border border-[#E8D4A2]/60 hover:bg-[#FDF8F0] transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4" /> Lihat Reservasi
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="hidden lg:flex items-center justify-center relative w-64 h-40 shrink-0">
            {/* Dashboard monitor */}
            <div className="relative w-48 h-32 bg-white rounded-2xl shadow-lg border border-[#E8D4A2]/30 flex flex-col p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#C9A24A]/40" />
                <div className="w-2 h-2 rounded-full bg-[#C9A24A]/40" />
                <div className="w-2 h-2 rounded-full bg-[#C9A24A]/40" />
              </div>
              <div className="flex-1 flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-2 bg-[#F5E6C8] rounded-full w-3/4" />
                  <div className="h-2 bg-[#F5E6C8] rounded-full w-1/2" />
                  <div className="mt-auto h-14 bg-[#FDF6EC] rounded-xl border border-[#E8D4A2]/20 relative overflow-hidden">
                    <svg className="absolute bottom-0 left-0 w-full h-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0,35 Q15,20 30,25 T60,15 T90,20 T100,10" fill="none" stroke="#C9A24A" strokeWidth="1.5" />
                      <circle cx="100" cy="10" r="2" fill="#C9A24A" />
                    </svg>
                  </div>
                </div>
                <div className="w-14 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-4 border-[#C9A24A] border-t-transparent" />
                  <div className="w-8 h-8 rounded-full bg-[#F5E6C8] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#C9A24A]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Calendar */}
            <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white rounded-xl shadow-md border border-[#E8D4A2]/30 flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold text-[#C9A24A] uppercase tracking-wide">Okt</span>
              <span className="text-lg font-bold text-[#4A3F35]">24</span>
            </div>
            {/* Tooth */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-xl shadow-md border border-[#E8D4A2]/30 flex items-center justify-center">
              <img src="/dashboard/gigi.png" alt="Tooth" className="w-8 h-8 object-contain" />
            </div>
            {/* Sparkle */}
            <Sparkles className="absolute top-4 right-16 w-4 h-4 text-[#C9A24A]/60" />
            <Sparkles className="absolute bottom-6 right-8 w-3 h-3 text-[#C9A24A]/40" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#4A3F35]">Laporan</h3>
          <div className="flex items-center gap-1 text-xs text-[#8A7B6B]">
            <span>Bulan ini</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <Sparkline
                  data={s.sparklineData}
                  width={70}
                  height={28}
                  stroke="#C9A24A"
                />
              </div>
              <p className="text-2xl font-bold text-[#4A3F35]">{s.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-[#8A7B6B]">{s.label}</p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  {s.trendValue}
                </span>
              </div>
              <p className="text-[10px] text-[#B8A99A] mt-0.5">{s.trendLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#4A3F35]">Pengguna Terbaru</h3>
            <Link
              to="/dashboard/clinic?tab=users"
              className="text-xs font-medium text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99A]">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada pengguna</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl hover:bg-[#F5ECE0] transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#4A3F35] truncate">{u.name}</p>
                    <p className="text-xs text-[#8A7B6B]">{u.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F5E6C8] text-[#8A6B2B]">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Activities */}
        <div className="space-y-6">
          {/* Pending Consultations */}
          <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#4A3F35]">
                Konsultasi Menunggu ({pendingConsultations.length})
              </h3>
              <Link
                to="/dashboard/clinic?tab=konsultasi"
                className="text-xs font-medium text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {pendingConsultations.length === 0 ? (
              <div className="text-center py-6 text-[#B8A99A]">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Tidak ada konsultasi menunggu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingConsultations.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4A3F35] truncate">
                        {c.user?.name || "Pasien"}
                      </p>
                      <p className="text-xs text-[#8A7B6B]">{c.topic || "Konsultasi"}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      c.status === "Dijadwalkan"
                        ? "bg-[#F5E6C8] text-[#8A6B2B]"
                        : c.status === "Menunggu"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-[#F5E6C8] text-[#8A6B2B]"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Schedules */}
          <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#4A3F35]">Jadwal Dokter</h3>
              <Link
                to="/dashboard/clinic?tab=doctors"
                className="text-xs font-medium text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {doctorSchedules.length === 0 ? (
              <div className="text-center py-6 text-[#B8A99A]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Belum ada jadwal dokter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctorSchedules.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4A3F35] truncate">
                        {s.doctorName || "Dokter"}
                      </p>
                      <p className="text-xs text-[#8A7B6B]">
                        {s.date} &bull; {s.timeRange}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        s.isFull
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {s.bookedSlots}/{s.totalSlots}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
