import { Link } from "react-router";
import {
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  Stethoscope,
  Building2,
} from "lucide-react";
import Sparkline from "@/shared/ui/Sparkline";

export default function DesktopDoctorHome({
  session,
  schedules = [],
  reservations = [],
  completedCount = 0,
  onAddSchedule,
}: {
  session: any;
  schedules: any[];
  reservations: any[];
  completedCount: number;
  onAddSchedule?: () => void;
}) {
  const pendingCount = reservations.filter(
    (r) => r.status === "Baru" || r.status === "Menunggu" || r.status === "Dikonfirmasi"
  ).length;

  const stats = [
    {
      label: "Jadwal Praktik",
      value: schedules.length,
      unit: "Sesi",
      icon: Calendar,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: `${schedules.length} Sesi Aktif`,
      trendLabel: "Terdaftar",
      sparklineData: [8, 12, 10, 15, 13, 18, 16, 20, 18, 22, 20, 25],
    },
    {
      label: "Total Pasien",
      value: reservations.length,
      unit: "Pasien",
      icon: Users,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: `${reservations.length} Terdaftar`,
      trendLabel: "Database",
      sparklineData: [5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18],
    },
    {
      label: "Pasien Selesai",
      value: completedCount,
      unit: "Tindakan",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      trend: "up" as const,
      trendValue: "Selesai",
      trendLabel: "Riwayat Medis",
      sparklineData: [3, 5, 4, 7, 6, 8, 7, 10, 9, 11, 10, 13],
    },
    {
      label: "Pasien Menunggu",
      value: pendingCount,
      unit: "Antrean",
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      trend: "neutral" as const,
      trendValue: `${pendingCount} Menunggu`,
      trendLabel: "Perlu Tindakan",
      sparklineData: [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9],
    },
  ];

  const rawName = session?.name || "Dokter";
  const doctorDisplayName =
    rawName.toLowerCase().startsWith("drg.") || rawName.toLowerCase().startsWith("dr.")
      ? rawName
      : `drg. ${rawName}`;

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FDF6EC] via-[#F8ECD8] to-[#F2E0C4] p-6 sm:p-8 shadow-sm border border-[#E8D4A2]/40">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] text-xs font-semibold mb-2.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Aesthetic Pondok Indah</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35]">
              Hallo {doctorDisplayName}!
            </h2>
            <p className="text-sm text-[#8A7B6B] mt-1.5 leading-relaxed">
              Kelola jadwal praktik dan pantau rekam pemeriksaan serta tindakan medis pasien Anda secara tersinkronisasi.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                type="button"
                onClick={onAddSchedule}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-sm font-semibold hover:from-[#B8943F] hover:to-[#A67F3A] transition-all shadow-md shadow-[#C9A24A]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Jadwal Praktik
              </button>
              <Link
                to="/dashboard/doctor?tab=reservasi"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#8A6B2B] rounded-xl text-sm font-semibold border border-[#E8D4A2]/60 hover:bg-[#FDF8F0] transition-all shadow-sm"
              >
                <Users className="w-4 h-4" /> Daftar Pasien ({reservations.length})
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="hidden lg:flex items-center justify-center relative w-64 h-44 shrink-0">
            <img
              src="/dashboard/sapadokter.webp"
              alt="Sapa Dokter"
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#4A3F35]">Ringkasan Praktik Klinis</h3>
          <div className="flex items-center gap-1 text-xs text-[#8A7B6B]">
            <span>Real-time Database</span>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                {s.sparklineData.some((v) => v > 0) ? (
                  <Sparkline
                    data={s.sparklineData}
                    width={70}
                    height={28}
                    stroke="#C9A24A"
                  />
                ) : (
                  <div className="w-[70px] h-[28px]" />
                )}
              </div>
              <p className="text-2xl font-bold text-[#4A3F35]">
                {s.value} <span className="text-xs font-normal text-[#8A7B6B]">{s.unit}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-medium text-[#8A7B6B]">{s.label}</p>
                {s.trendValue !== "-" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#FAF5EA] text-[#8C6B1C]">
                    <TrendingUp className="w-3 h-3" />
                    {s.trendValue}
                  </span>
                ) : null}
              </div>
              <p className="text-[10px] text-[#B8A99A] mt-0.5">{s.trendLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Schedules & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#F0E6D3] pb-3">
              <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A24A]" />
                <span>Jadwal Praktik Mendatang</span>
              </h3>
              <Link
                to="/dashboard/doctor?tab=jadwal"
                className="text-xs font-semibold text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-10 text-[#B8A99A]">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Belum Ada Jadwal Praktik</p>
                <p className="text-xs mt-1">Buat sesi jadwal praktik baru untuk menerima reservasi pasien.</p>
                <button
                  type="button"
                  onClick={onAddSchedule}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#8C6B1C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#735716] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Jadwal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl hover:bg-[#F5ECE0] transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#B8943F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4A3F35] truncate">
                        {s.displayDate || s.date}
                      </p>
                      <p className="text-xs text-[#8A7B6B]">
                        {s.timeRange} &bull; {s.location || "Aesthetic Pondok Indah"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        s.isFull
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {s.bookedSlots}/{s.totalSlots} Slot
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients Queue */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#F0E6D3] pb-3">
              <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A24A]" />
                <span>Antrean & Pasien Terbaru</span>
              </h3>
              <Link
                to="/dashboard/doctor?tab=reservasi"
                className="text-xs font-semibold text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-10 text-[#B8A99A]">
                <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Belum Ada Antrean Pasien</p>
                <p className="text-xs mt-1">Pasien yang memilih jadwal dokter akan otomatis muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 4).map((r) => {
                  const isCompleted = r.status === "Selesai";
                  const isConfirmed = r.status === "Dikonfirmasi";
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl hover:bg-[#F5ECE0] transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[#B8943F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-bold text-[#4A3F35] truncate">
                            {r.patient_name || "Pasien"}
                          </p>
                          <span className="font-mono text-[10px] text-gray-400">
                            #{r.code || r.id}
                          </span>
                        </div>
                        <p className="text-xs text-[#8A7B6B] truncate">
                          {r.treatment_interest || r.complaint || "Pemeriksaan Gigi"} &bull; {r.date} ({r.preferred_time} WIB)
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isConfirmed
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {r.status || "Menunggu"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
