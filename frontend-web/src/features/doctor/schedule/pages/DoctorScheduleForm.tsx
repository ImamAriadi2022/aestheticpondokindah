import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import {
  createDoctorSchedule,
  getDoctorSchedule,
  updateDoctorSchedule,
} from "@/features/doctor/schedule/services/doctorScheduleApi";
import { apiClient } from "@/core/api/apiClient";

interface BranchItem {
  id: number;
  name: string;
  code?: string;
  address?: string;
}

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function DoctorScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [totalSlots, setTotalSlots] = useState("5");

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Fetch active branches from database
  useEffect(() => {
    setLoadingBranches(true);
    apiClient
      .get<BranchItem[]>("/branches")
      .then((data) => {
        const activeBranches = Array.isArray(data) ? data : [];
        setBranches(activeBranches);
        if (activeBranches.length > 0 && !location) {
          setLocation(activeBranches[0].name);
        }
      })
      .catch(() => {
        setBranches([
          { id: 1, name: "Aesthetic Pondok Indah Main Branch", address: "Jakarta Selatan" },
          { id: 2, name: "Aesthetic Clinic Senayan Branch", address: "Jakarta Pusat" },
        ]);
        if (!location) setLocation("Aesthetic Pondok Indah Main Branch");
      })
      .finally(() => setLoadingBranches(false));
  }, []);

  // Fetch schedule details if edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    getDoctorSchedule(id)
      .then((schedule) => {
        setDate(schedule.date);
        setLocation(schedule.location);
        setTotalSlots(String(schedule.totalSlots));

        // Parse existing time range e.g. "09:00 - 12:00" or "09.00-11.00"
        if (schedule.timeRange) {
          const parts = schedule.timeRange.replace(/\./g, ":").split(/[-–]/);
          if (parts.length >= 2) {
            setStartTime(parts[0].trim().substring(0, 5));
            setEndTime(parts[1].trim().substring(0, 5));
          }
        }
      })
      .catch((err) => {
        toast({ title: "Gagal", message: err.message || "Gagal memuat jadwal", variant: "error" });
        navigate("/dashboard/doctor?tab=jadwal");
      })
      .finally(() => setFetching(false));
  }, [isEdit, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formattedTimeRange = `${startTime} - ${endTime}`;

    const payload = {
      date: date,
      timeRange: formattedTimeRange,
      location: location.trim(),
      totalSlots: Number(totalSlots),
    };

    if (!payload.date || !payload.location || payload.totalSlots < 1) {
      const newErrors: Record<string, string> = {};
      if (!payload.date) newErrors.date = "Tanggal wajib diisi";
      if (!payload.location) newErrors.location = "Lokasi cabang wajib dipilih";
      if (payload.totalSlots < 1) newErrors.totalSlots = "Jumlah slot minimal 1";
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await updateDoctorSchedule(id, payload);
        toast({ title: "Berhasil", message: "Jadwal berhasil diperbarui", variant: "success" });
      } else {
        await createDoctorSchedule(payload);
        toast({ title: "Berhasil", message: "Jadwal berhasil ditambahkan", variant: "success" });
      }
      navigate("/dashboard/doctor?tab=jadwal");
    } catch (err: any) {
      if (err?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([key, value]) => {
          const msg = Array.isArray(value) ? value[0] : String(value);
          backendErrors[key] = msg;
        });
        setErrors(backendErrors);
        toast({ title: "Gagal", message: "Validasi gagal. Periksa kembali form.", variant: "error" });
      } else {
        toast({ title: "Gagal", message: err?.message || "Terjadi kesalahan", variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a24a]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/doctor?tab=jadwal")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>

        <Card className="rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <CardHeader className="pb-4 bg-gradient-to-r from-[#fdf8f0] to-white border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Jadwal Praktik Dokter" : "Tambah Jadwal Praktik Baru"}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Pilih tanggal, jam praktik, dan cabang klinik dari sistem.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Field */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#a8843a]" />
                    Tanggal Praktik
                  </div>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
                  required
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Time UX Selectors (Jam Mulai & Jam Selesai) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#a8843a]" />
                    Jam Praktik Dokter (Otomatis Diformat)
                  </div>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Jam Mulai</span>
                    <select
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-medium focus:border-[#c9a24a] focus:ring-[#c9a24a] bg-white"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={`start_${t}`} value={t}>
                          {t} WIB
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Jam Selesai</span>
                    <select
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-medium focus:border-[#c9a24a] focus:ring-[#c9a24a] bg-white"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={`end_${t}`} value={t}>
                          {t} WIB
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-[#a8843a] mt-1 font-medium">
                  Format tersimpan otomatis: <span className="font-bold">{startTime} - {endTime}</span>
                </p>
              </div>

              {/* Location Branch Select Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#a8843a]" />
                    Cabang / Lokasi Praktik Klinik (Database)
                  </div>
                </Label>
                {loadingBranches ? (
                  <div className="flex items-center gap-2 p-2.5 text-xs text-gray-500 bg-gray-50 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-[#c9a24a]" /> Memuat daftar cabang...
                  </div>
                ) : (
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-medium focus:border-[#c9a24a] focus:ring-[#c9a24a] bg-white"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} {b.address ? `(${b.address})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>

              {/* Slots Field */}
              <div className="space-y-2">
                <Label htmlFor="totalSlots" className="text-sm font-semibold text-gray-700">
                  Kapasitas Pasien (Jumlah Slot)
                </Label>
                <Input
                  id="totalSlots"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Contoh: 5"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="rounded-lg border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
                  required
                />
                {errors.totalSlots && <p className="text-xs text-red-500 mt-1">{errors.totalSlots}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/doctor?tab=jadwal")}
                  className="flex-1 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-bold rounded-lg shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isEdit ? "Simpan Perubahan" : "Tambah Jadwal Praktik"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
