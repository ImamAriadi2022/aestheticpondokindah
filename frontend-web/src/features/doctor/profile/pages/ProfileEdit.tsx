import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { getSession, updateSessionProfile } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";
import { toast } from "@/shared/ui/toast";
import { updateDoctorProfile } from "../services/doctorProfileService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  ArrowLeft,
  X,
  Camera,
  Save,
  Activity,
  Stethoscope,
} from "lucide-react";

const SPECIALIZATION_OPTIONS = [
  "Dokter Gigi Umum",
  "Dokter Gigi Spesialis Ortodonti (Sp.Ort)",
  "Dokter Gigi Spesialis Konservasi Gigi (Sp.KG)",
  "Dokter Gigi Spesialis Kedokteran Gigi Anak (Sp.KGA)",
  "Dokter Gigi Spesialis Bedah Mulut (Sp.BM)",
  "Dokter Gigi Spesialis Periodonsia (Sp.Perio)",
  "Dokter Gigi Spesialis Prostodonsia (Sp.Pros)",
  "Dokter Gigi Spesialis Radiologi Kedokteran Gigi (Sp.RKG)",
];

export default function DoctorProfileEditPage() {
  const session = getSession();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<any>({
    name: session?.name || "Pengguna",
    email: session?.email || "doctor@aestheticpondokindah.local",
    phone: (session as any)?.whatsapp || session?.phone || "+62887437525305",
    avatar: (session as any)?.avatar || "",
    specialization: (session as any)?.specialization || "Dokter Gigi Spesialis Ortodonti (Sp.Ort)",
    strNumber: (session as any)?.strNumber || (session as any)?.str_number || "31.2.1.100.3.21.123456",
    sipNumber: (session as any)?.sipNumber || (session as any)?.sip_number || "503/449/SIP.DG/DKS/2024",
    education: (session as any)?.education || "FKG Universitas Indonesia (UI)",
    experienceYears: (session as any)?.experienceYears || (session as any)?.experience_years || "8 Tahun Praktik",
    primaryBranch: (session as any)?.primaryBranch || (session as any)?.primary_branch || "Aesthetic Pondok Indah - Cabang Utama",
    consultationFee: (session as any)?.consultationFee || (session as any)?.consultation_fee || 250000,
    bio: (session as any)?.bio || "Praktisi kedokteran gigi profesional yang berdedikasi memberikan perawatan kesehatan gigi dan mulut terbaik untuk pasien.",
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        message: "Ukuran foto profil maksimal 2MB.",
        variant: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev: any) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSessionProfile(profile);

      const token = localStorage.getItem("apident:token");
      if (token) {
        await updateDoctorProfile(profile);
      }

      toast({
        title: "Berhasil",
        message: "Profil dokter telah berhasil diperbarui",
        variant: "info",
      });

      navigate("/profile");
    } catch (err) {
      logger.error("Failed to update doctor profile:", err);
      toast({
        title: "Gagal",
        message: "Terjadi kesalahan saat menyimpan profil",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="doctor">
      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profil Dokter</h1>
              <p className="text-sm text-gray-500">Ubah data profesional, kredensial, dan deskripsi praktik Anda</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="rounded-xl px-4 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl px-6 h-11 shadow-md shadow-[#c9a24a]/20 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Memproses..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Professional & Credentials */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Profil Profesional Dokter Gigi</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Foto Avatar Upload */}
              <div className="flex items-center gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60">
                <div className="relative shrink-0">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Foto Profil Dokter"
                      className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#c9a24a]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#c9a24a] flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "D"}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50">
                    <Camera className="w-3.5 h-3.5 text-[#c9a24a]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Foto Profil Dokter</h4>
                  <p className="text-xs text-gray-500">Klik ikon kamera untuk unggah foto pas dokter (maks 2MB)</p>
                </div>
              </div>

              {/* Nama Lengkap & Gelar */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nama Lengkap & Gelar</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Contoh: drg. Amanda Putri, Sp.KGA"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900 font-semibold"
                />
              </div>

              {/* Spesialisasi Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Spesialisasi Kedokteran Gigi</label>
                <Select
                  value={profile.specialization || "Dokter Gigi Umum"}
                  onValueChange={(val) => setProfile((prev: any) => ({ ...prev, specialization: val }))}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Spesialisasi" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {SPECIALIZATION_OPTIONS.map((sp) => (
                      <SelectItem key={sp} value={sp} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* No. STR */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nomor STR (Surat Tanda Registrasi)</label>
                <Input
                  value={profile.strNumber}
                  onChange={(e) => setProfile({ ...profile, strNumber: e.target.value })}
                  placeholder="Contoh: 31.2.1.100.3.21.123456"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* No. SIP */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nomor SIP (Surat Izin Praktik)</label>
                <Input
                  value={profile.sipNumber}
                  onChange={(e) => setProfile({ ...profile, sipNumber: e.target.value })}
                  placeholder="Contoh: 503/449/SIP.DG/DKS/2024"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Pendidikan / Universitas */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Pendidikan / Universitas Alumni</label>
                <Input
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  placeholder="Contoh: FKG Universitas Indonesia (UI)"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Pengalaman Kerja */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Pengalaman Praktik</label>
                <Input
                  value={profile.experienceYears}
                  onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                  placeholder="Contoh: 8 Tahun Praktik"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Operations & Bio */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Operasional & Deskripsi Praktik</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Email Dokter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Email Operasional</label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="doctor@aestheticpondokindah.local"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* WhatsApp Dokter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nomor WhatsApp Dokter</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+628..."
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Cabang Praktik Utama */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Cabang Praktik Utama</label>
                <Input
                  value={profile.primaryBranch}
                  onChange={(e) => setProfile({ ...profile, primaryBranch: e.target.value })}
                  placeholder="Contoh: Aesthetic Pondok Indah - Cabang Utama"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Tarif Baseline Konsultasi */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Tarif Baseline Konsultasi (Rp)</label>
                <Input
                  type="number"
                  value={profile.consultationFee}
                  onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) })}
                  placeholder="250000"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900 font-semibold"
                />
              </div>

              {/* Biografi / Deskripsi Praktik */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Biografi & Deskripsi Layanan Praktik</label>
                <textarea
                  rows={5}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tuliskan profil singkat, bidang keahlian, dan pendekatan pelayanan pasien Anda..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
