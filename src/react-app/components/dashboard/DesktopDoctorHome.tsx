import { Link } from "react-router";
import {
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
  FileText,
  Eye,
} from "lucide-react";
import Sparkline from "./Sparkline";

export default function DesktopDoctorHome({
  session,
  schedules,
  clients,
  completedCount,
  onAddSchedule,
}: {
  session: any;
  schedules: any[];
  clients: any[];
  completedCount: number;
  onAddSchedule?: () => void;
}) {
  const stats = [
    {
      label: "Jadwal Saya",
      value: schedules.length,
      icon: Calendar,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "10%",
      trendLabel: "Bulan ini",
      sparklineData: [8, 12, 10, 15, 13, 18, 16, 20, 18, 22, 20, 25],
    },
    {
      label: "Klien",
      value: clients.length,
      icon: Users,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "5%",
      trendLabel: "Menunggu",
      sparklineData: [5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18],
    },
    {
      label: "Selesai",
      value: completedCount,
      icon: FileText,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "up" as const,
      trendValue: "8%",
      trendLabel: "Selama ini",
      sparklineData: [3, 5, 4, 7, 6, 8, 7, 10, 9, 11, 10, 13],
    },
    {
      label: "Hasil",
      value: 0,
      icon: Eye,
      iconBg: "bg-[#F5E6C8]",
      iconColor: "text-[#B8943F]",
      trend: "neutral" as const,
      trendValue: "-",
      trendLabel: "Dari klien",
      sparklineData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FDF6EC] via-[#F8ECD8] to-[#F2E0C4] p-6 sm:p-8 shadow-sm border border-[#E8D4A2]/40">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35]">
              Hallo {session?.gender === "Perempuan" ? "Ibu" : session?.gender === "Laki-laki" ? "Bapak" : "Bpk/Ibu"}, {session?.name || "Dokter"}!
            </h2>
            <p className="text-sm text-[#8A7B6B] mt-2 leading-relaxed">
              Kelola jadwal praktek dan pantau klien konsultasi Anda.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={onAddSchedule}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-sm font-semibold hover:from-[#B8943F] hover:to-[#A67F3A] transition-all shadow-md shadow-[#C9A24A]/20"
              >
                <Plus className="w-4 h-4" /> Tambah Jadwal
              </button>
              <Link
                to="/dashboard/doctor?tab=klien"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#8A6B2B] rounded-xl text-sm font-semibold border border-[#E8D4A2]/60 hover:bg-[#FDF8F0] transition-all shadow-sm"
              >
                <Users className="w-4 h-4" /> Lihat Klien
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="hidden lg:flex items-center justify-center relative w-64 h-44 shrink-0">
            <img
              src="/dashboard/sapadokter.png"
              alt="Sapa Dokter"
              className="w-full h-full object-contain drop-shadow-md"
            />
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
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-sm hover:shadow-md transition-shadow"
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
              <p className="text-2xl font-bold text-[#4A3F35]">{s.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-[#8A7B6B]">{s.label}</p>
                {s.trendValue !== "-" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#4A3F35]">Jadwal Mendatang</h3>
            <Link
              to="/dashboard/doctor?tab=jadwal"
              className="text-xs font-medium text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99A]">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada jadwal</p>
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
                      {s.timeRange} &bull; {s.location}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
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

        {/* Recent Clients */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#4A3F35]">Klien Terbaru</h3>
            <Link
              to="/dashboard/doctor?tab=klien"
              className="text-xs font-medium text-[#B8943F] flex items-center gap-0.5 hover:text-[#8A6B2B] transition-colors"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-[#B8A99A]">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada klien</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 bg-[#FDF8F0] rounded-xl hover:bg-[#F5ECE0] transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#B8943F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#4A3F35] truncate">
                      {c.user?.name || "Klien"}
                    </p>
                    <p className="text-xs text-[#8A7B6B]">{c.topic}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      c.status === "Selesai"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-[#F5E6C8] text-[#8A6B2B]"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
