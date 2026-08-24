import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Stethoscope,
  ShieldCheck,
  Briefcase,
  MapPin,
  DollarSign,
  Activity,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

type DoctorEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: any;
  onSave: (doctorData: any) => Promise<void>;
};

const SPECIALIZATION_OPTIONS = [
  "Spesialis Kedokteran Gigi Anak (Sp.KGA)",
  "Spesialis Ortodonti (Sp.Ort)",
  "Spesialis Bedah Mulut & Maksilofasial (Sp.BM)",
  "Spesialis Konservasi Gigi (Sp.KG)",
  "Spesialis Periodonsia (Sp.Perio)",
  "Spesialis Prostodonsia (Sp.Pros)",
  "Spesialis Penyakit Mulut (Sp.PM)",
  "Dokter Gigi Umum & Estetika",
];

export default function DoctorEditorModal({ open, onOpenChange, doctor, onSave }: DoctorEditorModalProps) {
  const isEdit = Boolean(doctor && doctor.id);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: SPECIALIZATION_OPTIONS[0],
    str: "",
    sip: "",
    education: "FKG Universitas Indonesia (UI)",
    experience_years: 5,
    consultation_fee: 250000,
    primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
    is_active: true,
    bio: "",
    avatar_url: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (doctor) {
      setForm({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || doctor.whatsapp || "",
        password: "",
        confirmPassword: "",
        specialization: doctor.specialization || doctor.speciality || SPECIALIZATION_OPTIONS[0],
        str: doctor.str || doctor.str_number || doctor.strNumber || "",
        sip: doctor.sip || doctor.sip_number || doctor.sipNumber || "",
        education: doctor.education || "FKG Universitas Indonesia (UI)",
        experience_years: doctor.experience_years ?? doctor.experienceYears ?? 5,
        consultation_fee: doctor.consultation_fee ?? doctor.consultationFee ?? 250000,
        primary_branch: doctor.primary_branch || doctor.primaryBranch || "Aesthetic Pondok Indah - Cabang Utama",
        is_active: doctor.is_active !== false && doctor.status !== "inactive",
        bio: doctor.bio || "",
        avatar_url: doctor.avatar_url || doctor.avatar || doctor.photo || doctor.photo_url || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        specialization: SPECIALIZATION_OPTIONS[0],
        str: "",
        sip: "",
        education: "FKG Universitas Indonesia (UI)",
        experience_years: 5,
        consultation_fee: 250000,
        primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
        is_active: true,
        bio: "",
        avatar_url: "",
      });
    }
  }, [doctor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Gagal", message: "Nama dokter wajib diisi", variant: "error" });
      return;
    }
    if (!isEdit && !form.email.trim()) {
      toast({ title: "Gagal", message: "Email akun dokter wajib diisi untuk kredensial login", variant: "error" });
      return;
    }
    if (!isEdit && !form.password) {
      toast({ title: "Gagal", message: "Password akun dokter wajib diisi", variant: "error" });
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      toast({ title: "Gagal", message: "Password dan konfirmasi password tidak cocok", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...doctor,
        ...form,
        id: doctor?.id,
        // Harmonize both camelCase and snake_case keys
        str_number: form.str,
        strNumber: form.str,
        sip_number: form.sip,
        sipNumber: form.sip,
        experience_years: form.experience_years,
        experienceYears: form.experience_years,
        primary_branch: form.primary_branch,
        primaryBranch: form.primary_branch,
        consultation_fee: form.consultation_fee,
        consultationFee: form.consultation_fee,
        whatsapp: form.phone,
        phone: form.phone,
        avatar: form.avatar_url,
        avatar_url: form.avatar_url,
        status: form.is_active ? "active" : "inactive",
        is_active: form.is_active,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Gagal", message: err.message || "Gagal menyimpan data dokter", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-5xl sm:max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#F0E6D3]">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-[#4A3F35] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
              <Stethoscope className="w-5 h-5" />
            </div>
            {isEdit ? "Edit Data & Kredensial Dokter Spesialis" : "Tambah Dokter Spesialis Baru"}
          </DialogTitle>
          <p className="text-xs text-[#8A7B6B] mt-1">
            {isEdit
              ? "Perbarui informasi profil kedokteran, kredensial login akun, dan status keaktifan berpraktik."
              : "Daftarkan akun dokter baru beserta kredensial login (Email & Password) ke dalam database klinik."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Seksi 1: Kredensial Login Akun */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#F0E6D3] space-y-4">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C9A24A]" />
              Kredensial Login Akun Dokter
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Email Akun Login Dokter *</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    type="email"
                    required={!isEdit}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="dokter@aestheticpondokindah.id"
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Nomor WhatsApp / Telepon *</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+62 812-3456-7890"
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Password Baru with Eye Toggle */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">
                  {isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Akun Dokter *"}
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required={!isEdit}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEdit ? "••••••••" : "Password minimal 6 karakter"}
                    className="pl-10 pr-10 h-10 rounded-xl border-gray-200 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#C9A24A] transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password with Eye Toggle */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Ketik ulang password baru"
                    className="pl-10 pr-10 h-10 rounded-xl border-gray-200 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#C9A24A] transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
                    title={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seksi 2: Profil & Kredensial Kedokteran */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#C9A24A]" />
              Profil & Kredensial Kedokteran Spesialis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5 lg:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Nama Lengkap & Gelar Dokter *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: drg. Amanda Putri, Sp.KGA"
                  className="h-10 rounded-xl border-gray-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Spesialisasi Utama *</Label>
                <select
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
                >
                  {SPECIALIZATION_OPTIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Nomor STR (Surat Tanda Registrasi)</Label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                  <Input
                    value={form.str}
                    onChange={(e) => setForm({ ...form, str: e.target.value })}
                    placeholder="31.2.1.100.3.21.987654"
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Nomor SIP (Surat Izin Praktik)</Label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24A] absolute left-3.5 top-3" />
                  <Input
                    value={form.sip}
                    onChange={(e) => setForm({ ...form, sip: e.target.value })}
                    placeholder="503/449/SIP.DG/DKS/2024"
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Pendidikan & Alumni Almamater</Label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  placeholder="FKG Universitas Indonesia (UI)"
                  className="h-10 rounded-xl border-gray-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Pengalaman Praktik (Tahun)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
                  className="h-10 rounded-xl border-gray-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Tarif Baseline Konsultasi (Rp)</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    value={form.consultation_fee}
                    onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Cabang Utama Berpraktik</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <Input
                    value={form.primary_branch}
                    onChange={(e) => setForm({ ...form, primary_branch: e.target.value })}
                    placeholder="Aesthetic Pondok Indah - Cabang Utama"
                    className="pl-10 h-10 rounded-xl border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label className="text-xs font-semibold text-gray-700">Status Keaktifan Berpraktik</Label>
                <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#F0E6D3]">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      form.is_active ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div>
                    <p className={`text-xs font-bold ${form.is_active ? "text-emerald-700" : "text-gray-600"}`}>
                      {form.is_active ? "Aktif Berpraktik" : "Non-aktif (Cuti / Libur)"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {form.is_active
                        ? "Dokter dapat menerima reservasi konsultasi & perawatan pasien."
                        : "Dokter sementara waktu tidak muncul di reservasi pasien."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label className="text-xs font-semibold text-gray-700">Biografi & Deskripsi Praktik Dokter</Label>
                <textarea
                  className="w-full h-24 p-3.5 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-[#C9A24A]/30 resize-none"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Ringkasan biografi, profil profesional, bidang keahlian, dan pendekatan pelayanan dokter kepada pasien..."
                />
              </div>
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
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-semibold rounded-xl h-11 px-8 text-xs shadow-md shadow-[#C9A24A]/20"
            >
              {saving ? "Memproses..." : isEdit ? "Simpan Perubahan Dokter" : "Daftarkan Dokter Spesialis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
