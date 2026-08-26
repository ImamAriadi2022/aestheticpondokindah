import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Plus, Calendar, Clock, CheckCircle2, Search, X, ArrowDownUp } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import DoctorScheduleTable from "../components/DoctorScheduleTable";
import {
  getDoctorSchedules,
  deleteDoctorSchedule,
  type DoctorScheduleItem,
} from "../services/doctorScheduleApi";

interface DoctorSchedulePageProps {
  schedules?: DoctorScheduleItem[];
  onRefresh?: () => void;
}

export default function DoctorSchedulePage({
  schedules: propSchedules,
  onRefresh,
}: DoctorSchedulePageProps) {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>(propSchedules || []);
  const [loading, setLoading] = useState(!propSchedules || propSchedules.length === 0);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSchedules = async () => {
    try {
      const data = await getDoctorSchedules();
      if (Array.isArray(data) && data.length > 0) {
        setSchedules(data);
      }
      if (onRefresh) onRefresh();
    } catch {
      // Pertahankan data yang sudah ada
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propSchedules && propSchedules.length > 0) {
      setSchedules(propSchedules);
      setLoading(false);
    } else {
      fetchSchedules();
    }
  }, [propSchedules]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;
    setDeletingScheduleId(id);
    try {
      await deleteDoctorSchedule(id);
      toast({ title: "Berhasil", message: "Jadwal berhasil dihapus", variant: "success" });
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: "Gagal", message: "Tidak bisa menghapus jadwal", variant: "error" });
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const totalSlots = schedules.reduce((sum, s) => sum + s.totalSlots, 0);
  const bookedSlots = schedules.reduce((sum, s) => sum + s.bookedSlots, 0);

  const filteredAndSortedSchedules = useMemo(() => {
    let list = [...schedules];

    // Urutkan dari yang terbaru ke terlama (Date Descending, Time Descending)
    list.sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;
      return (b.timeRange || "").localeCompare(a.timeRange || "");
    });

    // Filter pencarian
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const matchDate = (s.displayDate || "").toLowerCase().includes(q) || (s.date || "").toLowerCase().includes(q);
        const matchTime = (s.timeRange || "").toLowerCase().includes(q);
        const matchLoc = (s.location || "").toLowerCase().includes(q);
        const matchSlots = `${s.bookedSlots}/${s.totalSlots}`.includes(q) || (s.isFull ? "penuh" : "tersedia").includes(q);
        return matchDate || matchTime || matchLoc || matchSlots;
      });
    }

    return list;
  }, [schedules, searchQuery]);

  return (
    <div className="space-y-6 text-left">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C9A24A]" />
            Daftar Jadwal Praktik Dokter
          </h2>
          <p className="text-xs text-[#8A7B6B] mt-0.5">
            Kelola sesi waktu, kuota pasien, dan lokasi cabang tempat praktik Anda.
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/doctor/schedule/new")}
          className="bg-gradient-to-r from-[#8C6B1C] to-[#C9A24A] hover:from-[#735614] hover:to-[#B08A38] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#8A7B6B] font-medium">Total Sesi Jadwal</p>
            <p className="text-lg font-bold text-[#4A3F35]">{schedules.length} Sesi</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#8A7B6B] font-medium">Total Kapasitas Slot</p>
            <p className="text-lg font-bold text-cyan-800">{totalSlots} Pasien</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#8A7B6B] font-medium">Slot Terisi Pasien</p>
            <p className="text-lg font-bold text-amber-800">{bookedSlots} Terisi</p>
          </div>
        </div>
      </div>

      {/* Search & Sorting Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C6B1C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tanggal, jam praktik, atau lokasi cabang..."
            className="pl-10 pr-9 h-10 rounded-xl border-[#EADBBD] focus:border-[#C9A24A] focus:ring-[#C9A24A]/20 bg-[#FAF8F5] text-xs font-medium text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-[#8A7B6B] flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#EADBBD]">
            <ArrowDownUp className="w-3.5 h-3.5 text-[#8C6B1C]" />
            Urutan: <strong className="text-[#4A3F35]">Terbaru ke Terlama</strong>
          </span>
          {searchQuery && (
            <span className="text-[11px] font-bold text-[#8C6B1C] px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-200">
              {filteredAndSortedSchedules.length} Ditemukan
            </span>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      <DoctorScheduleTable
        schedules={filteredAndSortedSchedules}
        loading={loading}
        deletingId={deletingScheduleId}
        searchQuery={searchQuery}
        onResetSearch={() => setSearchQuery("")}
        onEdit={(id) => navigate(`/dashboard/doctor/schedule/${id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
