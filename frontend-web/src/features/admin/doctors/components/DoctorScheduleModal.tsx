import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";
import { Calendar, Clock, MapPin, Users, Plus, Trash2, CheckCircle2 } from "lucide-react";

type ScheduleSlot = {
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

export default function DoctorScheduleModal({ open, onOpenChange, doctor, onSaveSchedules }: DoctorScheduleModalProps) {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(doctor?.schedules || [
    { day: "Senin", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
    { day: "Rabu", time: "14:00 - 18:00", quota: 10, location: "Cabang Utama" },
    { day: "Jumat", time: "09:00 - 13:00", quota: 10, location: "Cabang Utama" },
  ]);

  const [newDay, setNewDay] = useState("Senin");
  const [newTimeStart, setNewTimeStart] = useState("09:00");
  const [newTimeEnd, setNewTimeEnd] = useState("14:00");
  const [newQuota, setNewQuota] = useState(10);
  const [newLocation, setNewLocation] = useState("Cabang Utama");

  const [saving, setSaving] = useState(false);

  const handleAddSlot = () => {
    if (!newTimeStart || !newTimeEnd) {
      toast({ title: "Gagal", message: "Jam mulai dan jam selesai wajib diisi", variant: "error" });
      return;
    }
    const timeFormatted = `${newTimeStart} - ${newTimeEnd}`;
    const newSlot: ScheduleSlot = {
      day: newDay,
      time: timeFormatted,
      quota: newQuota,
      location: newLocation,
    };
    setSchedules([...schedules, newSlot]);
    toast({ title: "Berhasil", message: `Slot jadwal hari ${newDay} ditambahkan`, variant: "success" });
  };

  const handleRemoveSlot = (index: number) => {
    const next = schedules.filter((_, i) => i !== index);
    setSchedules(next);
  };

  const handleSave = async () => {
    if (!doctor?.id) return;
    setSaving(true);
    try {
      await onSaveSchedules(doctor.id, schedules);
      toast({ title: "Berhasil", message: "Jadwal praktik dokter berhasil diperbarui", variant: "success" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Gagal", message: err.message || "Gagal menyimpan jadwal", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl sm:max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#F0E6D3]">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-[#4A3F35] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
              <Calendar className="w-5 h-5" />
            </div>
            Kelola Jadwal Sesi Praktik Dokter Spesialis
          </DialogTitle>
          <p className="text-xs text-[#8A7B6B] mt-1">
            Dokter: <strong className="text-[#4A3F35] font-bold">{doctor?.name || "Dokter Spesialis"}</strong> ({doctor?.specialization || "Spesialis"})
          </p>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Form Tambah Slot Jadwal Baru */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#F0E6D3] space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C9A24A]" />
              Tambah Sesi Sesi Praktik Baru
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Hari Praktik</Label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Jam Mulai</Label>
                <Input
                  type="time"
                  value={newTimeStart}
                  onChange={(e) => setNewTimeStart(e.target.value)}
                  className="h-10 text-xs rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Jam Selesai</Label>
                <Input
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="h-10 text-xs rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Kuota Pasien</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={newQuota}
                  onChange={(e) => setNewQuota(Number(e.target.value))}
                  className="h-10 text-xs rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label className="text-xs font-semibold text-gray-700">Aksi</Label>
                <Button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full h-10 bg-[#C9A24A] hover:bg-[#A8843A] text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  + Tambah Sesi
                </Button>
              </div>

              <div className="space-y-1.5 col-span-2 md:col-span-5">
                <Label className="text-xs font-semibold text-gray-700">Lokasi / Cabang Praktik</Label>
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Contoh: Aesthetic Pondok Indah - Cabang Utama"
                  className="h-10 text-xs rounded-xl border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Daftar Slot Jadwal Terdaftar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Daftar Jadwal Praktik Terdaftar ({schedules.length} Sesi)</span>
            </h4>
            
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Belum ada jadwal praktik terdaftar untuk dokter ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {schedules.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-[#C9A24A]/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{slot.day}</span>
                          <span className="text-xs font-semibold text-[#C9A24A] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#F0E6D3]">
                            {slot.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                          <span>📍 {slot.location}</span>
                          <span>•</span>
                          <span>👥 Kuota: {slot.quota} Pasien</span>
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSlot(idx)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-200 h-11 px-6 text-xs font-semibold"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-semibold rounded-xl h-11 px-8 text-xs shadow-md shadow-[#C9A24A]/20"
          >
            {saving ? "Memproses..." : "Simpan Jadwal Praktik Dokter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
