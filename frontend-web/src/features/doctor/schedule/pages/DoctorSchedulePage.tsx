import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Plus, Calendar, Clock, CheckCircle2 } from "lucide-react";
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
  const [loading, setLoading] = useState(!propSchedules);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await getDoctorSchedules();
      setSchedules(data);
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: "Gagal", message: "Tidak bisa memuat jadwal praktik", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propSchedules) {
      fetchSchedules();
    } else {
      setSchedules(propSchedules);
    }
  }, [propSchedules]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;
    setDeletingScheduleId(id);
    try {
      await deleteDoctorSchedule(id);
      setSchedules((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Berhasil", message: "Jadwal berhasil dihapus", variant: "success" });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: "Gagal", message: "Tidak bisa menghapus jadwal", variant: "error" });
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const totalSlots = schedules.reduce((acc, s) => acc + (s.totalSlots || 0), 0);
  const totalBooked = schedules.reduce((acc, s) => acc + (s.bookedSlots || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C9A24A]" />
            Daftar Jadwal Praktik Dokter
          </h2>
          <p className="text-sm text-[#8A7B6B] mt-1">
            Kelola sesi waktu, kuota pasien, dan lokasi cabang tempat praktik Anda.
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/doctor/schedule/new")}
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8923F] hover:to-[#A67F3A] text-white font-semibold rounded-xl text-sm h-11 px-5 shadow-md shadow-[#C9A24A]/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Sesi Jadwal</p>
            <p className="text-lg font-bold text-[#4A3F35]">{schedules.length} Sesi</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-semibold">Total Kapasitas Slot</p>
            <p className="text-lg font-bold text-emerald-900">{totalSlots} Pasien</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#C9A24A]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-800 font-semibold">Slot Terisi Pasien</p>
            <p className="text-lg font-bold text-[#4A3F35]">{totalBooked} Terisi</p>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <DoctorScheduleTable
        schedules={schedules}
        loading={loading}
        deletingId={deletingScheduleId}
        onEdit={(id) => navigate(`/dashboard/doctor/schedule/edit/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
