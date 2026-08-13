import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";
import { User, Mail, Phone, Lock, Stethoscope, ShieldCheck, Briefcase, MapPin, DollarSign, Activity, FileText, Camera } from "lucide-react";

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

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: SPECIALIZATION_OPTIONS[0],
    str: "",
    sip: "",
    education: "",
    experience_years: 5,
    consultation_fee: 250000,
    primary_branch: "Aesthetic Pondok Indah - Cabang Utama",
    is_active: true,
    bio: "",
    avatar_url: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || doctor.whatsapp || "",
        password: "",
        confirmPassword: "",
        specialization: doctor.specialization || doctor.speciality || SPECIALIZATION_OPTIONS[0],
        str: doctor.str || doctor.str_number || "",
        sip: doctor.sip || doctor.sip_number || "",
        education: doctor.education || "FKG Universitas Indonesia (UI)",
        experience_years: doctor.experience_years ?? 5,
        consultation_fee: doctor.consultation_fee ?? 250000,
        primary_branch: doctor.primary_branch || "Aesthetic Pondok Indah - Cabang Utama",
        is_active: doctor.is_active !== false,
        bio: doctor.bio || "",
        avatar_url: doctor.avatar_url || doctor.photo_url || "",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
            {isEdit ? "Edit Data & Kredensial Dokter" : "Tambah Dokter Spesialis Baru"}
          </DialogTitle>
          <p className="text-xs text-[#8A7B6B]">
            {isEdit
              ? "Perbarui informasi profil, spesialisasi, dan status keaktifan dokter."
              : "Daftarkan dokter baru beserta akun dan kredensial login ke sistem klinik."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Seksi 1: Akun & Kredensial Login */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6D3] space-y-4">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C9A24A]" />
              Kredensial Login Akun Dokter
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Email Akun Login *</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="email"
                    required={!isEdit}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="dokter@aestheticpondokindah.id"
                    className="pl-9 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Nomor WhatsApp / Telepon *</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+62812..."
                    className="pl-9 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                  {isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Akun *"}
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    required={!isEdit}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEdit ? "••••••••" : "Password minimal 6 karakter"}
                    className="pl-9 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Ketik ulang password"
                    className="pl-9 rounded-xl border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seksi 2: Profil & Spesialisasi Dokter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#C9A24A]" />
              Profil & Kredensial Kedokteran
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Nama Lengkap & Gelar *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: drg. Amanda Putri, Sp.KGA"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Spesialisasi Dokter *</Label>
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
                <Label className="text-xs font-semibold text-gray-700">Cabang Utama Praktik</Label>
                <Input
                  value={form.primary_branch}
                  onChange={(e) => setForm({ ...form, primary_branch: e.target.value })}
                  placeholder="Aesthetic Pondok Indah - Cabang Utama"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Nomor STR (Registrasi)</Label>
                <Input
                  value={form.str}
                  onChange={(e) => setForm({ ...form, str: e.target.value })}
                  placeholder="31.2.1.100.3.21.987654"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Nomor SIP (Izin Praktik)</Label>
                <Input
                  value={form.sip}
                  onChange={(e) => setForm({ ...form, sip: e.target.value })}
                  placeholder="503/449/SIP.DG/DKS/2024"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Pendidikan & Alumni</Label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  placeholder="FKG Universitas Indonesia (UI)"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Pengalaman Praktik (Tahun)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Tarif Baseline Konsultasi (Rp)</Label>
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  value={form.consultation_fee}
                  onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Status Keaktifan Praktik</Label>
                <div className="flex items-center gap-3 h-10">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.is_active ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${form.is_active ? "text-emerald-700" : "text-gray-500"}`}>
                    {form.is_active ? "Aktif Berpraktik" : "Non-aktif (Cuti / Libur)"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Biografi & Deskripsi Praktik Dokter</Label>
                <textarea
                  className="w-full h-20 p-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-[#C9A24A]/30 resize-none"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Ringkasan biografi, bidang keahlian, dan pendekatan pelayanan pasien..."
                />
              </div>
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
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-semibold rounded-xl"
            >
              {saving ? "Memproses..." : isEdit ? "Simpan Perubahan" : "Daftarkan Dokter Baru"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
