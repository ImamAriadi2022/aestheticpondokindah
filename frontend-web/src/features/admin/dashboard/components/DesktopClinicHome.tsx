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
  Settings,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Eye,
  Award,
} from "lucide-react";
import Sparkline from "@/shared/ui/Sparkline";
import TrafficUtmAnalyticsSection from "@/features/admin/dashboard/components/TrafficUtmAnalyticsSection";

export default function DesktopClinicHome({
  session,
  stats,
  users,
  doctorSchedules,
  consultations,
  complaints,
  reservations,
  analyticsData,
}: {
  session: any;
  stats?: any[];
  users?: any[];
  doctorSchedules?: any[];
  consultations?: any[];
  complaints?: any[];
  reservations?: any[];
  analyticsData?: any;
}) {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeDoctorSchedules = Array.isArray(doctorSchedules) ? doctorSchedules : [];
  const safeConsultations = Array.isArray(consultations) ? consultations : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];

  // Hitungan metrik reservasi hari ini
  const totalReservationsCount = safeReservations.length > 0 ? safeReservations.length : (safeStats[2]?.value ?? 10);
  const pendingReservationsCount = safeReservations.filter(
    (r) => r && (r.status === "Menunggu" || r.status === "pending" || r.status === "submitted" || r.status === "Menunggu Konfirmasi")
  ).length || 7;
  const confirmedReservationsCount = safeReservations.filter(
    (r) => r && (r.status === "Dikonfirmasi" || r.status === "confirmed" || r.status === "approved" || r.status === "Selesai")
  ).length || 2;

  const pendingConsultations = safeConsultations.filter(
    (c) => c && (c.status === "Menunggu" || c.status === "Dijadwalkan" || c.status === "pending" || c.status === "scheduled")
  );

  const safeUsersCount = safeUsers.length;
  const safePostsCount = safeStats[1]?.value ?? 0;
  const safeSchedulesCount = safeDoctorSchedules.length;
  const safeVisitorsCount = safeStats[3]?.value ?? (analyticsData?.totals?.visitors ?? 0);

  // Dynamic sparklines from analytics daily data if available, else smooth data series
  const visitorSparkline =
    Array.isArray(analyticsData?.daily?.visitors) && analyticsData!.daily.visitors.length > 0
      ? analyticsData!.daily.visitors.slice(-12)
      : [10, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, Math.max(safeVisitorsCount, 1)];

  const statItems = [
    {
      label: "Total Pengguna",
      value: safeUsersCount,
      icon: Users,
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "12%",
      trendLabel: "Bulan ini",
      sparklineData: [10, 25, 20, 35, 30, 45, 40, 55, 50, 65, 60, Math.max(safeUsersCount, 1)],
    },
    {
      label: "Artikel",
      value: safePostsCount,
      icon: FileText,
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "8%",
      trendLabel: "Tersedia",
      sparklineData: [15, 20, 18, 28, 25, 32, 30, 38, 35, 42, 40, Math.max(safePostsCount, 1)],
    },
    {
      label: "Jadwal Dokter",
      value: safeSchedulesCount,
      icon: Calendar,
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "5%",
      trendLabel: "Update harian",
      sparklineData: [5, 10, 8, 15, 12, 18, 15, 22, 20, 25, 22, Math.max(safeSchedulesCount, 1)],
    },
    {
      label: "Pengunjung",
      value: safeVisitorsCount,
      icon: BarChart3,
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue:
        typeof analyticsData?.previous_period?.growth_percentage === "number"
          ? `${analyticsData.previous_period.growth_percentage >= 0 ? "+" : ""}${analyticsData.previous_period.growth_percentage}%`
          : "Live",
      trendLabel: "Trafik website",
      sparklineData: visitorSparkline,
    },
  ];

  const quickButtons = [
    {
      label: "Kelola Dokter",
      to: "/dashboard/clinic?tab=doctors",
      icon: Stethoscope,
    },
    {
      label: "Lihat Reservasi",
      to: "/dashboard/clinic?tab=reservasi",
      icon: Calendar,
    },
    {
      label: "Admin & Staff",
      to: "/dashboard/clinic?tab=users",
      icon: ShieldCheck,
    },
    {
      label: "Konsultasi Pasien",
      to: "/dashboard/clinic?tab=konsultasi",
      icon: MessageSquare,
    },
    {
      label: "Kelola Artikel",
      to: "/dashboard/clinic?tab=blog",
      icon: FileText,
    },
    {
      label: "Statistik Trafik",
      to: "/dashboard/clinic?tab=analytics",
      icon: BarChart3,
    },
  ];

  void complaints;

  return (
    <div className="space-y-6">
      {/* Top Section: 2 Columns (Left: Welcome Banner, Right: Quick Action Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Welcome Banner */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FBF7F0] via-[#F7EFE1] to-[#EFE3CF] p-7 sm:p-8 shadow-sm border border-[#EADBBD]">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D332A] tracking-tight leading-tight">
              Selamat datang,
              <br />
              <span className="text-[#A67F3A]">
                {typeof session?.name === "string" && session.name !== "Admin" ? session.name : "Admin Klinik"}
              </span>
            </h2>

            {/* 3 Titik Laporan Hari Ini (Lebih kecil, rapat, warna seragam & hairline divider) */}
            <div className="mt-4 max-w-[210px] divide-y divide-[#EADBBD]/70">
              {/* Item 1: Total Reservasi */}
              <div className="flex items-center gap-2.5 pb-2">
                <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#EADBBF"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#B8943F"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset="26"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#3D332A]">
                    {String(totalReservationsCount).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35] tracking-tight">
                  Total Reservasi
                </span>
              </div>

              {/* Item 2: Perlu Konfirmasi */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#EADBBF"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#B8943F"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset="44"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#3D332A]">
                    {String(pendingReservationsCount).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35] tracking-tight">
                  Perlu Konfirmasi
                </span>
              </div>

              {/* Item 3: Dikonfirmasi */}
              <div className="flex items-center gap-2.5 pt-2">
                <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                  <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#EADBBF"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#B8943F"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset="18"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#3D332A]">
                    {String(confirmedReservationsCount).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35] tracking-tight">
                  Dikonfirmasi
                </span>
              </div>
            </div>
          </div>

          {/* Dokter Illustration & Ambient Glow */}
          <div className="hidden sm:flex items-end justify-end absolute right-2 bottom-0 w-44 sm:w-52 h-44 sm:h-48 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#C9A24A]/20 via-[#E8C547]/10 to-transparent blur-xl" />
            </div>
            <img
              src="/dashboard/sapadokter.webp"
              alt="Dokter Klinik"
              className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Kolom Kanan: Quick Buttons Card (Pure Clean Icon Style) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-[#F0E6D3] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 h-full">
            {quickButtons.map((btn) => (
              <Link
                key={btn.label}
                to={btn.to}
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl hover:bg-[#FAF6EE] border border-transparent hover:border-[#EADBBD] transition-all duration-200 text-center active:scale-[0.98]"
              >
                <btn.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#B8943F] group-hover:text-[#977324] transition-transform duration-200 group-hover:scale-110 mb-2.5" />
                <span className="text-xs font-semibold text-[#4A3F35] group-hover:text-[#8A6B2B] leading-tight">
                  {btn.label}
                </span>
              </Link>
            ))}
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
              className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                <Sparkline
                  data={s.sparklineData}
                  width={70}
                  height={28}
                  stroke="#C9A24A"
                />
              </div>
              <p className="text-2xl font-bold text-[#4A3F35] mt-1">{s.value}</p>
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

      {/* Traffic & UTM Acquisition Overview */}
      <TrafficUtmAnalyticsSection />

      {/* Two Column Layout (Pengguna Terbaru & Aktivitas) */}
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
          {safeUsers.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99A]">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#B8943F]" />
              <p className="text-sm">Belum ada pengguna</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl hover:bg-[#F5ECE0] transition-colors"
                >
                  <User className="w-6 h-6 text-[#B8943F] shrink-0" />
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
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#B8943F]" />
                <p className="text-xs">Tidak ada konsultasi menunggu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingConsultations.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl"
                  >
                    <Stethoscope className="w-6 h-6 text-[#B8943F] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4A3F35] truncate">
                        {c.user?.name || c.userName || c.guest_name || "Pasien"}
                      </p>
                      <p className="text-xs text-[#8A7B6B]">{c.topic || c.chiefComplaint || c.chief_complaint || c.treatment_interest || "Konsultasi Gigi"}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      c.status === "Dijadwalkan" || c.status === "scheduled"
                        ? "bg-[#F5E6C8] text-[#8A6B2B]"
                        : c.status === "Menunggu" || c.status === "pending"
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
            {safeDoctorSchedules.length === 0 ? (
              <div className="text-center py-6 text-[#B8A99A]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#B8943F]" />
                <p className="text-xs">Belum ada jadwal dokter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeDoctorSchedules.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl"
                  >
                    <Clock className="w-6 h-6 text-[#B8943F] shrink-0" />
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
