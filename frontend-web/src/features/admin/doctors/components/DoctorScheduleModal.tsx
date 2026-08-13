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

  // Sync schedules when doctor prop changes
  useState(() => {
    if (doctor?.schedules) {
      setSchedules(doctor.schedules);
    }
  });

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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C9A24A]" />
            Kelola Jadwal Praktik Spesialis
          </DialogTitle>
          <p className="text-xs text-[#8A7B6B]">
            Dokter: <strong className="text-[#4A3F35]">{doctor?.name || "Dokter Spesialis"}</strong> ({doctor?.specialization || "Spesialis"})
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Form Tambah Slot Jadwal Baru */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6D3] space-y-3">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#C9A24A]" />
              Tambah Sesi Jadwal Praktik Baru
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-gray-700">Hari Praktik</Label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-[#C9A24A]"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-gray-700">Jam Mulai</Label>
                <Input
                  type="time"
                  value={newTimeStart}
                  onChange={(e) => setNewTimeStart(e.target.value)}
                  className="h-9 text-xs rounded-lg border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-gray-700">Jam Selesai</Label>
                <Input
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="h-9 text-xs rounded-lg border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-gray-700">Kuota Pasien</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={newQuota}
                  onChange={(e) => setNewQuota(Number(e.target.value))}
                  className="h-9 text-xs rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex-1 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-700">Lokasi / Cabang Praktik</Label>
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Cabang Utama / Cabang Selatan"
                  className="h-9 text-xs rounded-lg border-gray-200"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddSlot}
                className="mt-5 h-9 bg-[#C9A24A] hover:bg-[#A8843A] text-white text-xs font-semibold rounded-lg px-4"
              >
                + Tambah Slot
              </Button>
            </div>
          </div>

          {/* Daftar Slot Jadwal Terdaftar */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Daftar Jadwal Praktik Terdaftar ({schedules.length} Sesi)</h4>
            
            {schedules.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Belum ada jadwal praktik terdaftar untuk dokter ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {schedules.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-xs hover:border-[#C9A24A]/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{slot.day}</span>
                          <span className="text-xs font-semibold text-[#C9A24A] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#F0E6D3]">
                            {slot.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
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
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-200"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-semibold rounded-xl"
          >
            {saving ? "Memproses..." : "Simpan Jadwal Praktik"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
