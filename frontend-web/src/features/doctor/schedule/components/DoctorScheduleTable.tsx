import { Button } from "@/shared/ui/button";
import { Calendar, Pencil, Trash2, Loader2 } from "lucide-react";
import type { DoctorScheduleItem } from "../services/doctorScheduleApi";

interface DoctorScheduleTableProps {
  schedules: DoctorScheduleItem[];
  loading: boolean;
  deletingId: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DoctorScheduleTable({
  schedules,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: DoctorScheduleTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-[#C9A24A] animate-pulse" />
            </div>
            <p className="text-[#4A3F35] font-medium">Memuat jadwal...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-[#B8A99A]" />
            </div>
            <p className="text-[#4A3F35] font-medium">Belum ada jadwal</p>
            <p className="text-sm text-[#B8A99A] mt-1">Jadwal praktik Anda akan muncul di sini</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0E6D3] bg-[#FAF8F5]">
                <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Jam Praktik</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Lokasi / Cabang</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Slot Terisi</th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#4A3F35]">{s.displayDate || s.date}</td>
                  <td className="py-4 px-5 text-[#4A3F35] font-medium">{s.timeRange}</td>
                  <td className="py-4 px-5 text-[#8A7B6B]">{s.location}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.isFull
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {s.bookedSlots}/{s.totalSlots} Terisi
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(s.id)}
                        className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8]"
                        title="Edit Jadwal"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === s.id}
                        onClick={() => onDelete(s.id)}
                        className="w-8 h-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Hapus Jadwal"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
