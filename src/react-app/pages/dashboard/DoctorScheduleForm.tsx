import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import DashboardLayout from "@/react-app/components/dashboard/DashboardLayout";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { toast } from "@/react-app/components/ui/toast";
import { Loader2 } from "lucide-react";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import {
  createDoctorSchedule,
  getDoctorSchedule,
  updateDoctorSchedule,
} from "@/react-app/lib/doctorScheduleApi";

export default function DoctorScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    date: "",
    timeRange: "",
    location: "",
    totalSlots: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    getDoctorSchedule(id)
      .then((schedule) => {
        setFormData({
          date: schedule.date,
          timeRange: schedule.timeRange,
          location: schedule.location,
          totalSlots: String(schedule.totalSlots),
        });
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

    const payload = {
      date: formData.date,
      timeRange: formData.timeRange.trim(),
      location: formData.location.trim(),
      totalSlots: Number(formData.totalSlots),
    };

    if (!payload.date || !payload.timeRange || !payload.location || payload.totalSlots < 1) {
      const newErrors: Record<string, string> = {};
      if (!payload.date) newErrors.date = "Tanggal wajib diisi";
      if (!payload.timeRange) newErrors.timeRange = "Waktu wajib diisi";
      if (!payload.location) newErrors.location = "Lokasi wajib diisi";
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

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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

        <Card className="rounded-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Perbarui informasi jadwal praktik Anda."
                : "Tambahkan jadwal praktik baru untuk pasien."}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Date Field */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#a8843a]" />
                    Tanggal
                  </div>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
                  required
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Time Field */}
              <div className="space-y-2">
                <Label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#a8843a]" />
                    Waktu
                  </div>
                </Label>
                <Input
                  id="timeRange"
                  type="text"
                  placeholder="Contoh: 10:00 - 12:00"
                  value={formData.timeRange}
                  onChange={(e) => updateField("timeRange", e.target.value)}
                  className="rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
                  required
                />
                {errors.timeRange && <p className="text-xs text-red-500 mt-1">{errors.timeRange}</p>}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#a8843a]" />
                    Lokasi
                  </div>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Contoh: Pondok Indah"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
                  required
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>

              {/* Slots Field */}
              <div className="space-y-2">
                <Label htmlFor="totalSlots" className="text-sm font-medium text-gray-700">
                  Jumlah Slot
                </Label>
                <Input
                  id="totalSlots"
                  type="number"
                  min="1"
                  placeholder="Contoh: 5"
                  value={formData.totalSlots}
                  onChange={(e) => updateField("totalSlots", e.target.value)}
                  className="rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]"
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
                  className="flex-1 rounded-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isEdit ? "Simpan Perubahan" : "Tambah Jadwal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
