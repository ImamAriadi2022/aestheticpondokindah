import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { getSession, updateSessionProfile } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { API_BASE } from "@/core/api/apiConfig";
import {
  User,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Activity,
  Stethoscope,
  Smile,
} from "lucide-react";

export default function DoctorProfileDetailPage() {
  const session = getSession();
  const navigate = useNavigate();

  const getCleanAvatar = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return "";
    if (avatarUrl.includes("storage/data:image")) {
      return avatarUrl.substring(avatarUrl.indexOf("data:image"));
    }
    return avatarUrl;
  };

  const [profile, setProfile] = useState<any>({
    name: session?.name || "Pengguna",
    email: session?.email || "doctor@aestheticpondokindah.local",
    phone: (session as any)?.whatsapp || session?.phone || "+62887437525305",
    avatar: getCleanAvatar((session as any)?.avatar),
    specialization: (session as any)?.specialization || "Dokter Gigi Spesialis",
    strNumber: (session as any)?.strNumber || (session as any)?.str_number || "31.2.1.100.3.21.123456",
    sipNumber: (session as any)?.sipNumber || (session as any)?.sip_number || "503/449/SIP.DG/DKS/2024",
    education: (session as any)?.education || "FKG Universitas Indonesia (UI)",
    experienceYears: (session as any)?.experienceYears || (session as any)?.experience_years || "8 Tahun Praktik",
    primaryBranch: (session as any)?.primaryBranch || (session as any)?.primary_branch || "Aesthetic Pondok Indah - Cabang Utama",
    consultationFee: (session as any)?.consultationFee || (session as any)?.consultation_fee || 250000,
    bio: (session as any)?.bio || "Praktisi kedokteran gigi profesional yang berdedikasi memberikan perawatan kesehatan gigi dan mulut terbaik untuk pasien.",
  });

  useEffect(() => {
    const token = localStorage.getItem("apident:token");
    if (!token) return;

    fetch(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const cleanAvatar = getCleanAvatar(data.avatar);
          setProfile((prev: any) => ({
            ...prev,
            ...data,
            avatar: cleanAvatar || prev.avatar,
            strNumber: data.strNumber || data.str_number || prev.strNumber,
            sipNumber: data.sipNumber || data.sip_number || prev.sipNumber,
            specialization: data.specialization || prev.specialization,
            education: data.education || prev.education,
            experienceYears: data.experienceYears || data.experience_years || prev.experienceYears,
            primaryBranch: data.primaryBranch || data.primary_branch || prev.primaryBranch,
            consultationFee: data.consultationFee || data.consultation_fee || prev.consultationFee,
            bio: data.bio || prev.bio,
          }));

          if (cleanAvatar) {
            updateSessionProfile({ avatar: cleanAvatar });
          }
        }
      })
      .catch(() => {});
  }, []);

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
              onClick={() => navigate("/dashboard/doctor")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Profil Dokter</h1>
              <p className="text-sm text-gray-500">Informasi kredensial, izin praktik, dan profil profesional Anda</p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/profile/edit")}
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl px-5 h-11 shadow-md shadow-[#c9a24a]/20 transition-all"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Banner Card */}
        <div className="bg-gradient-to-br from-[#1a1612] via-[#2a2319] to-[#1a1612] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-[#c9a24a]/30 shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#c9a24a]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -top-12 w-48 h-48 bg-[#e8c547]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg shadow-[#c9a24a]/30 border-2 border-[#e8c547]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#e8c547] via-[#c9a24a] to-[#b8943f] p-1 shadow-lg shadow-[#c9a24a]/30">
                  <div className="w-full h-full rounded-full bg-[#1a1612] flex items-center justify-center text-[#e8c547] font-bold text-3xl sm:text-4xl">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "D"}
                  </div>
                </div>
              )}
              <div
                className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-[#1a1612] flex items-center justify-center text-white"
                title="Akun Terverifikasi"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Main Details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{profile.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Akun Terverifikasi
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[#d4c5b0]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#e8c547]" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#e8c547]" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Credentials */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional Credentials */}
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Kredensial & Izin Praktik</h3>
                </div>
              </div>
              <CardContent className="p-6 divide-y divide-gray-100">
                <DisplayRow icon={User} label="Nama & Gelar Dokter" value={profile.name} />
                <DisplayRow icon={Stethoscope} label="Spesialisasi" value={profile.specialization || "Dokter Gigi Spesialis"} />
                <DisplayRow icon={ShieldCheck} label="Nomor STR (Registrasi)" value={profile.strNumber || "31.2.1.100.3.21.123456"} />
                <DisplayRow icon={ShieldCheck} label="Nomor SIP (Izin Praktik)" value={profile.sipNumber || "503/449/SIP.DG/DKS/2024"} />
                <DisplayRow icon={Briefcase} label="Alumni / Pendidikan" value={profile.education || "FKG Universitas Indonesia (UI)"} />
                <DisplayRow icon={Calendar} label="Pengalaman Praktik" value={profile.experienceYears || "8 Tahun Praktik"} />
              </CardContent>
            </Card>

            {/* Operational & Contact Info */}
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Lokasi & Tarif Operasional</h3>
                </div>
              </div>
              <CardContent className="p-6 divide-y divide-gray-100">
                <DisplayRow icon={MapPin} label="Cabang Praktik Utama" value={profile.primaryBranch || "Aesthetic Pondok Indah - Cabang Utama"} />
                <DisplayRow icon={Activity} label="Tarif Baseline Konsultasi" value={`Rp ${Number(profile.consultationFee || 250000).toLocaleString('id-ID')}`} />
                <DisplayRow icon={Mail} label="Email Operasional" value={profile.email} />
                <DisplayRow icon={Phone} label="Nomor WhatsApp Dokter" value={profile.phone} />
              </CardContent>
            </Card>
          </div>

          {/* Doctor Bio Card */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Deskripsi & Biografi Praktik Dokter</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 font-medium">
                {profile.bio || "Praktisi kedokteran gigi profesional yang berdedikasi memberikan perawatan kesehatan gigi dan mulut terbaik untuk pasien."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DisplayRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-gray-500 min-w-0">
        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 text-right truncate max-w-[260px]">{value || "-"}</span>
    </div>
  );
}
