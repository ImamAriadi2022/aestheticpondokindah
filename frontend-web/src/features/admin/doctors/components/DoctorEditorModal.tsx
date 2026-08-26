import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Stethoscope,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  X,
  Check,
  Shield,
  Loader2,
  Activity,
  CheckCircle2,
  PowerOff,
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
  "Oral & Maxillofacial Surgery",
  "Dokter Gigi Umum & Estetika",
];

export default function DoctorEditorModal({ open, onOpenChange, doctor, onSave }: DoctorEditorModalProps) {
  const isEdit = Boolean(doctor && doctor.id);

  // Password visibility toggles
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
    education: "Universitas Indonesia",
    experience_years: 5,
    consultation_fee: 250000,
    primary_branch: "Aesthetic Pondok Indah",
    is_active: true,
    bio: "",
    avatar_url: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (doctor) {
      const activeState =
        doctor.is_active !== undefined
          ? Boolean(doctor.is_active)
          : doctor.status !== "inactive";

      setForm({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || doctor.whatsapp || "",
        password: "",
        confirmPassword: "",
        specialization: doctor.specialization || doctor.speciality || SPECIALIZATION_OPTIONS[0],
        str: doctor.str || doctor.str_number || doctor.strNumber || "31.2.1.100.3.21.987654",
        sip: doctor.sip || doctor.sip_number || doctor.sipNumber || "503/449/SIP.DG/DKS/2024",
        education: doctor.education || "Universitas Indonesia",
        experience_years: doctor.experience_years ?? doctor.experienceYears ?? 5,
        consultation_fee: doctor.consultation_fee ?? doctor.consultationFee ?? 250000,
        primary_branch: doctor.primary_branch || doctor.primaryBranch || "Aesthetic Pondok Indah",
        is_active: activeState,
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
        education: "Universitas Indonesia",
        experience_years: 5,
        consultation_fee: 250000,
        primary_branch: "Aesthetic Pondok Indah",
        is_active: true,
        bio: "",
        avatar_url: "",
      });
    }
  }, [doctor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama lengkap dan gelar dokter wajib diisi");
      return;
    }
    if (!isEdit && !form.email.trim()) {
      toast.error("Email akun dokter wajib diisi untuk kredensial login");
      return;
    }
    if (!isEdit && !form.password) {
      toast.error("Password akun dokter wajib diisi");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...doctor,
        ...form,
        id: doctor?.id,
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
      toast.error(err.message || "Gagal menyimpan data dokter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[calc(100vw-32px)] max-w-4xl max-h-[92vh] flex flex-col rounded-[28px] border border-[#E8DFC8] bg-white shadow-2xl"
      >
        {/* Top Header Card */}
        <div className="p-6 sm:p-7 pb-4 bg-white border-b border-[#F0E6D3] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] text-[#C9A24A] flex items-center justify-center border border-[#F0E6D3] shrink-0 shadow-2xs">
              <Stethoscope className="w-6 h-6 text-[#C9A24A]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {isEdit ? "Edit Data & Kredensial Dokter Spesialis" : "Tambah Dokter Spesialis Baru"}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {isEdit
                  ? "Perbarui informasi profil kedokteran, kredensial login akun, dan status keaktifan berpraktik."
                  : "Daftarkan akun dokter baru beserta kredensial login (Email & Password) ke dalam database klinik."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition cursor-pointer shrink-0 shadow-2xs"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container with Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 pt-4 space-y-5 overflow-y-auto flex-1 bg-white min-h-0">
            {/* Seksi 1: KREDENSIAL LOGIN AKUN DOKTER */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-white space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#8C6B1C]" />
                <span>KREDENSIAL LOGIN AKUN DOKTER</span>
              </h4>

              {/* Row 1: Email & No WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Email Akun Login Dokter <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required={!isEdit}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="yudy.ardila@aestheticpondokindah.local"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+62887437525322"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Password & Konfirmasi Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    {isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Akun Dokter *"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!isEdit}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={isEdit ? "••••••••" : "Password minimal 8 karakter"}
                      className="w-full pl-9 pr-9 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                      title={showPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Ketik ulang password baru"
                      className="w-full pl-9 pr-9 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                      title={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Alert Banner */}
              <div className="p-3 rounded-xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#E6C67A]/30 text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#E6C67A]/40 shadow-2xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 leading-tight">Keamanan Akun</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Pastikan password baru minimal 8 karakter dengan kombinasi huruf, angka, dan simbol untuk keamanan akun Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Seksi 2: PROFIL & KREDENSIAL KEDOKTERAN SPESIALIS */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-white space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#8C6B1C]" />
                <span>PROFIL & KREDENSIAL KEDOKTERAN SPESIALIS</span>
              </h4>

              {/* Row 1: Nama Lengkap & Spesialisasi Utama */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="space-y-1 md:col-span-7">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Nama Lengkap & Gelar Dokter <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-5">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Spesialisasi Utama <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-3.5 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs cursor-pointer"
                  >
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Nomor STR, Nomor SIP, Pendidikan & Almamater */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Nomor STR (Surat Tanda Registrasi)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={form.str}
                      onChange={(e) => setForm({ ...form, str: e.target.value })}
                      placeholder="31.2.1.100.3.21.987654"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Nomor SIP (Surat Izin Praktik)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-[#8C6B1C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={form.sip}
                      onChange={(e) => setForm({ ...form, sip: e.target.value })}
                      placeholder="503/449/SIP.DG/DKS/2024"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Pendidikan & Alumni Almamater
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={form.education}
                      onChange={(e) => setForm({ ...form, education: e.target.value })}
                      placeholder="Universitas Indonesia"
                      className="w-full pl-9 pr-3 h-10 bg-white border border-[#E8DFC8] rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seksi 3: STATUS KEAKTIFAN BERPRAKTIK DOKTER */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-white space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#8C6B1C]" />
                <span>STATUS KEAKTIFAN BERPRAKTIK DOKTER</span>
              </h4>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5]">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                      form.is_active
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {form.is_active ? <CheckCircle2 className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900">
                        {form.is_active ? "Dokter Aktif Berpraktik" : "Dokter Nonaktif / Cuti"}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          form.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {form.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {form.is_active
                        ? "Dokter dapat menerima jadwal reservasi pasien dan tampil aktif di portal klinik."
                        : "Dokter dinonaktifkan sementara dan tidak dapat menerima reservasi baru dari pasien."}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer focus:outline-none shadow-inner ${
                      form.is_active ? "bg-emerald-600" : "bg-stone-300"
                    }`}
                    role="switch"
                    aria-checked={form.is_active}
                    title={form.is_active ? "Klik untuk menonaktifkan dokter" : "Klik untuk mengaktifkan dokter"}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        form.is_active ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-stone-700 min-w-[56px]">
                    {form.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 sm:px-7 py-3.5 bg-white border-t border-[#F0E6D3] flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold px-5 py-2.5 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal</span>
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-[#B8943F] hover:bg-[#A38032] text-white text-xs font-bold px-7 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
