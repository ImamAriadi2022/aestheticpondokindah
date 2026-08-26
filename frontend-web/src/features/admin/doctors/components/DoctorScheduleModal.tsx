import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  X,
  Check,
  Info,
  CalendarDays,
  Loader2,
} from "lucide-react";

type ScheduleSlot = {
  id?: string | number;
  day: string;
  time: string;
  quota: number;
  location: string;
};

type DoctorScheduleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: any;
  onSaveSchedules: (doctorId: string, schedules: ScheduleSlot[]) => Promise<void>;
};

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const CLINIC_BRANCHES = [
  "Cabang Utama",
  "Aesthetic Pondok Indah - Cabang Utama",
  "Aesthetic Pondok Indah - Bintaro",
  "Aesthetic Pondok Indah - TB Simatupang",
];

export default function DoctorScheduleModal({ open, onOpenChange, doctor, onSaveSchedules }: DoctorScheduleModalProps) {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);

  const [newDay, setNewDay] = useState("Senin");
  const [newTimeStart, setNewTimeStart] = useState("09:00");
  const [newTimeEnd, setNewTimeEnd] = useState("14:00");
  const [newQuota, setNewQuota] = useState(10);
  const [newLocation, setNewLocation] = useState("Cabang Utama");

  const [saving, setSaving] = useState(false);

  // Sync state whenever modal opens or doctor changes
  useEffect(() => {
    if (open) {
      if (doctor?.schedules && Array.isArray(doctor.schedules) && doctor.schedules.length > 0) {
        setSchedules(doctor.schedules);
      } else {
        setSchedules([
          { day: "Senin", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
          { day: "Rabu", time: "14:00 - 18:00", quota: 10, location: "Cabang Utama" },
          { day: "Jumat", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
        ]);
      }
      setNewDay("Senin");
      setNewTimeStart("09:00");
      setNewTimeEnd("14:00");
      setNewQuota(10);
      setNewLocation("Cabang Utama");
    }
  }, [open, doctor]);

  const handleAddSlot = () => {
    if (!newTimeStart || !newTimeEnd) {
      toast.error("Jam mulai dan jam selesai wajib diisi");
      return;
    }
    const timeFormatted = `${newTimeStart} - ${newTimeEnd}`;
    const newSlot: ScheduleSlot = {
      day: newDay,
      time: timeFormatted,
      quota: newQuota || 10,
      location: newLocation || "Cabang Utama",
    };
    setSchedules([...schedules, newSlot]);
    toast.success(`Slot jadwal hari ${newDay} berhasil ditambahkan`);
  };

  const handleRemoveSlot = (index: number) => {
    const next = schedules.filter((_, i) => i !== index);
    setSchedules(next);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSaveData = async () => {
    if (!doctor?.id) {
      toast.error("Data dokter tidak valid");
      return;
    }
    setSaving(true);
    try {
      await onSaveSchedules(doctor.id, schedules);
      toast.success("Jadwal sesi praktik dokter berhasil disimpan");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan jadwal dokter");
    } finally {
      setSaving(false);
    }
  };

  // Helper colors for Day icon box matching reference
  const getDayTheme = (day: string) => {
    switch (day) {
      case "Senin":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", pillBg: "bg-[#FAF5EA]", pillText: "text-[#8C6B1C]" };
      case "Rabu":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", pillBg: "bg-emerald-50", pillText: "text-emerald-800" };
      case "Jumat":
        return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", pillBg: "bg-purple-50", pillText: "text-purple-800" };
      default:
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", pillBg: "bg-blue-50", pillText: "text-blue-800" };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[calc(100vw-32px)] max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] border border-[#E8DFC8] bg-white shadow-2xl"
      >
        {/* Top Header Card */}
        <div className="p-6 sm:p-7 pb-4 bg-white border-b border-[#F0E6D3] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] text-[#C9A24A] flex items-center justify-center border border-[#F0E6D3] shrink-0 shadow-2xs">
              <Calendar className="w-6 h-6 text-[#C9A24A]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Kelola Jadwal Sesi Praktik Dokter Spesialis
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 font-medium">
                <span>Dokter:</span>
                <strong className="text-stone-900 font-bold">{doctor?.name || "Dokter Spesialis"}</strong>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EA] text-[#8C6B1C] border border-[#F0E6D3] text-[11px] font-semibold">
                  {doctor?.specialization || doctor?.speciality || "Oral & Maxillofacial Surgery"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="w-10 h-10 rounded-full border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition cursor-pointer shrink-0 shadow-2xs"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 sm:p-7 pt-4 space-y-5 overflow-y-auto flex-1 bg-white min-h-0">
          {/* Card 1: TAMBAH SESI PRAKTIK BARU */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-[#FCFAF6] space-y-3.5 shadow-2xs">
            <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-[#8C6B1C] flex items-center justify-center text-xs font-black">+</span>
              <span>TAMBAH SESI PRAKTIK BARU</span>
            </h4>

            {/* Row 1: 5 Columns (Hari, Jam Mulai, Jam Selesai, Kuota, Button Aksi) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
              {/* Hari Praktik */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">Hari Praktik</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full pl-9 pr-7 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs cursor-pointer appearance-none"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jam Mulai */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">Jam Mulai</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                  />
                </div>
              </div>

              {/* Jam Selesai */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">Jam Selesai</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                  />
                </div>
              </div>

              {/* Kuota Pasien */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">Kuota Pasien</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newQuota}
                    onChange={(e) => setNewQuota(Number(e.target.value))}
                    className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                  />
                </div>
              </div>

              {/* Tombol Aksi Tambah */}
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[11px] font-semibold text-stone-600 block sm:invisible">Aksi</label>
                <Button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full h-10 bg-[#B8943F] hover:bg-[#A38032] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sesi</span>
                </Button>
              </div>
            </div>

            {/* Row 2: Lokasi / Cabang Praktik */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-stone-600 block">Lokasi / Cabang Praktik</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C6B1C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full pl-9 pr-8 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs cursor-pointer appearance-none"
                >
                  {CLINIC_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: DAFTAR JADWAL PRAKTIK TERDAFTAR */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#8C6B1C]" />
                <span>DAFTAR JADWAL PRAKTIK TERDAFTAR ({schedules.length} SESI)</span>
              </h4>
              <p className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <span>ⓘ Klik ikon hapus untuk membatalkan sesi praktik</span>
              </p>
            </div>

            {schedules.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#F0E6D3]">
                Belum ada jadwal praktik terdaftar untuk dokter ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-0.5">
                {schedules.map((slot, idx) => {
                  const theme = getDayTheme(slot.day);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#F0E6D3] shadow-2xs hover:border-[#C9A24A] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} ${theme.border} border flex items-center justify-center shrink-0 shadow-2xs`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-stone-900">{slot.day}</span>
                            <span className={`text-xs font-bold ${theme.pillText} ${theme.pillBg} px-2.5 py-0.5 rounded-full border border-[#F0E6D3]`}>
                              {slot.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-2 font-medium">
                            <span>📍 {slot.location}</span>
                            <span>•</span>
                            <span>👥 Kuota: {slot.quota} Pasien</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="w-8 h-8 rounded-xl border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center transition cursor-pointer shadow-2xs ml-2 shrink-0"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Informasi Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EA] via-[#F8F2E4] to-[#F3EAD4] border border-[#E8DFC8] flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B8943F] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 leading-tight">Informasi</p>
                <p className="text-xs text-stone-600 mt-0.5">
                  Pastikan jadwal tidak bentrok dengan sesi praktik lainnya.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer Bar */}
        <div className="p-4 sm:px-7 py-3.5 bg-white border-t border-[#F0E6D3] flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold px-5 py-2.5 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Batal</span>
          </Button>

          <Button
            type="button"
            onClick={handleSaveData}
            disabled={saving}
            className="bg-[#B8943F] hover:bg-[#A38032] text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{saving ? "Menyimpan..." : "Simpan Data"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
