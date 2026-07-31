import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Loader2, Trash2 } from "lucide-react";
import { API_BASE } from "@/lib/apiConfig";

export default function ClinicDoctorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const token = localStorage.getItem("apident:token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    domicile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchDoctor(id);
    }
  }, [isEdit, id]);

  const fetchDoctor = async (doctorId: string) => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/admin/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Gagal memuat data dokter");
      }
      const data = await res.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.whatsapp || "",
        domicile: data.city || "",
        password: "",
        confirmPassword: "",
      });
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Gagal memuat data dokter", variant: "error" });
    } finally {
      setFetching(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    if (!isEdit) {
      if (!formData.password) newErrors.password = "Password wajib diisi";
      else if (formData.password.length < 6) newErrors.password = "Password minimal 6 karakter";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        whatsapp: formData.phone.trim(),
        city: formData.domicile.trim(),
      };

      if (!isEdit || formData.password) {
        payload.password = formData.password;
      }

      const url = isEdit
        ? `${API_BASE}/admin/doctors/${id}`
        : `${API_BASE}/admin/doctors`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.errors) {
          const backendErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            const message = Array.isArray(value) ? value[0] : String(value);

            const mappedKey =
              key === "whatsapp"
                ? "phone"
                : key === "city"
                  ? "domicile"
                  : key;

            backendErrors[mappedKey] = message;
          });
          setErrors(backendErrors);
          throw new Error("Validasi gagal. Periksa kembali form.");
        }
        throw new Error(data?.message || "Gagal menyimpan data dokter");
      }

      toast({
        title: "Berhasil",
        message: isEdit ? "Data dokter berhasil diperbarui" : "Akun dokter berhasil dibuat",
        variant: "success",
      });
      navigate("/dashboard/clinic?tab=doctors");
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Terjadi kesalahan", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus dokter ini? Tindakan ini tidak dapat dibatalkan.");
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Gagal menghapus dokter");
      toast({ title: "Berhasil", message: "Dokter berhasil dihapus", variant: "success" });
      navigate("/dashboard/clinic?tab=doctors");
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Terjadi kesalahan", variant: "error" });
    } finally {
      setDeleting(false);
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
      <DashboardLayout role="clinic">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a24a]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="clinic">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/clinic?tab=doctors")}
          className="mb-4 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>

        <Card className="rounded-sm border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Dokter" : "Tambah Dokter Baru"}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Perbarui data akun dokter."
                : "Buat akun dokter baru untuk mengakses dashboard dokter."}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#a8843a]" />
                    Nama Lengkap
                  </div>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: drg. Andi Saputra"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#a8843a]" />
                    Email
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contoh: doctor@demo.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#a8843a]" />
                    Nomor Telepon
                  </div>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Contoh: +62 812-0000-0002"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading || isEdit}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                {isEdit && (
                  <p className="text-xs text-gray-400">Nomor telepon tidak dapat diubah.</p>
                )}
              </div>

              {/* Domicile Field */}
              <div className="space-y-2">
                <Label htmlFor="domicile" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#a8843a]" />
                    Domisili
                  </div>
                </Label>
                <Input
                  id="domicile"
                  type="text"
                  placeholder="Contoh: DKI Jakarta"
                  value={formData.domicile}
                  onChange={(e) => updateField("domicile", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.domicile ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading}
                />
                {errors.domicile && <p className="text-xs text-red-600">{errors.domicile}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#a8843a]" />
                    {isEdit ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                  </div>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isEdit ? "Masukkan password baru jika ingin mengubah" : "Masukkan password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading}
                />
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#a8843a]" />
                    Konfirmasi Password
                  </div>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={`rounded-sm border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a] ${errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/clinic?tab=doctors")}
                  className="flex-1 rounded-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={loading || deleting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || deleting}
                  className="flex-1 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isEdit ? "Simpan Perubahan" : "Buat Akun Dokter"}
                </Button>
              </div>

              {isEdit && (
                <div className="pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="w-full rounded-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Hapus Dokter
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
