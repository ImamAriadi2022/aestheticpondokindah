import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession, updateSessionProfile } from "@/features/auth/services/session";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { API_BASE } from "@/shared/lib/apiConfig";
import {
  User,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Activity,
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Flame,
  HeartHandshake,
  Stethoscope,
  Smile,
  MessageSquare,
} from "lucide-react";

export default function ProfileDetailPage() {
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
    email: session?.email || "user@aestheticpondokindah.local",
    phone: (session as any)?.whatsapp || session?.phone || "+62887437525305",
    avatar: getCleanAvatar((session as any)?.avatar),
    gender: (session as any)?.gender || "Laki-laki",
    birthDate: (session as any)?.birthDate || "2004-11-21",
    bloodType: (session as any)?.blood_type || (session as any)?.bloodType || "O",
    job: (session as any)?.job || "Karyawan Swasta",
    address: (session as any)?.address_line || (session as any)?.address || "rt 2, rw 1, dusun 1, srisawahan, punggur, lampung tengah, lampung",
    province: (session as any)?.province || "Lampung",
    city: (session as any)?.city || "Lampung Tengah",
    district: (session as any)?.district || "Punggur",
    postalCode: (session as any)?.postalCode || "34152",
    membershipLevel: (session as any)?.membership_level || "bronze",
    membershipPoints: (session as any)?.membership_points || 0,
    insuranceProvider: (session as any)?.insuranceProvider || "Mandiri Inhealth",
    isCoffeeDrinker: (session as any)?.isCoffeeDrinker ?? true,
    isSmoker: (session as any)?.isSmoker ?? false,
    lastDentalVisit: (session as any)?.lastDentalVisit || "< 6 Bulan Lalu",
    dentalComplaints: (session as any)?.dentalComplaints || ["Gigi Sensitif", "Gigi Berlubang"],
    desiredServices: (session as any)?.desiredServices || ["Pembersihan Karang Gigi (Scaling)", "Pemutihan Gigi (Bleaching)"],
    currentDentalConditions: (session as any)?.currentDentalConditions || ["Plak Gigi", "Sensitif Dingin"],
    lifestyleInterests: (session as any)?.lifestyleInterests || ["Estetika Senyum", "Kesehatan Gigi"],
    treatmentGoals: (session as any)?.treatmentGoals || ["Senyum Lebih Estetik & Putih", "Kesehatan Gigi Jangka Panjang"],
    preferredCommunicationChannels: (session as any)?.preferredCommunicationChannels || ["WhatsApp", "Aplikasi"],
  });

  useEffect(() => {
    const token = localStorage.getItem("apident:token");
    if (!token) return;

    // Fetch live user profile & membership status from backend
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
            membershipLevel: data.membership_level || prev.membershipLevel,
            membershipPoints: data.membership_points ?? prev.membershipPoints,
          }));

          if (cleanAvatar) {
            updateSessionProfile({ avatar: cleanAvatar });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.gender,
      profile.birthDate,
      profile.bloodType,
      profile.job,
      profile.address,
      profile.province,
      profile.city,
    ];
    const filled = fields.filter((f) => f && f !== "-").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  const getTierBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case "diamond":
        return { label: "VIP Member (Diamond)", bg: "bg-cyan-500/10 text-cyan-700 border-cyan-200" };
      case "platinum":
        return { label: "Priority Member (Platinum)", bg: "bg-slate-500/10 text-slate-700 border-slate-200" };
      case "gold":
        return { label: "Premium Member (Gold)", bg: "bg-[#c9a24a]/15 text-[#a8843a] border-[#c9a24a]/30" };
      default:
        return { label: "Basic Member (Bronze)", bg: "bg-amber-700/10 text-amber-800 border-amber-300/30" };
    }
  };

  const tier = getTierBadge(profile.membershipLevel);
  const sessionRole = (session?.role as any) || "user";

  return (
    <DashboardLayout role={sessionRole}>
      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600"
              onClick={() => navigate("/dashboard/user")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Profil</h1>
              <p className="text-sm text-gray-500">Informasi identitas diri, domisili, dan preferensi medis Anda</p>
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
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
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

              {/* Progress & Membership Bar */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {/* Completion */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                  <div className="flex justify-between items-center text-xs text-[#d4c5b0] mb-2">
                    <span>Kelengkapan Profil</span>
                    <span className="font-bold text-[#e8c547]">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#c9a24a] to-[#e8c547] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Membership Badge & Points */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#d4c5b0] uppercase tracking-wider font-semibold">Tier Membership</p>
                    <p className="text-sm font-bold text-[#e8c547]">{tier.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#d4c5b0] uppercase tracking-wider font-semibold">Total Poin</p>
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <Sparkles className="w-3.5 h-3.5" />
                      {profile.membershipPoints.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Grid Cards */}
        {sessionRole === "doctor" ? (
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
                  <DisplayRow icon={ShieldCheck} label="Nomor STR (Registrasi)" value={profile.strNumber || profile.str_number || "31.2.1.100.3.21.123456"} />
                  <DisplayRow icon={ShieldCheck} label="Nomor SIP (Izin Praktik)" value={profile.sipNumber || profile.sip_number || "503/449/SIP.DG/DKS/2024"} />
                  <DisplayRow icon={Briefcase} label="Alumni / Pendidikan" value={profile.education || "FKG Universitas Indonesia (UI)"} />
                  <DisplayRow icon={Calendar} label="Pengalaman Praktik" value={profile.experienceYears || profile.experience_years || "8 Tahun Praktik"} />
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
                  <DisplayRow icon={MapPin} label="Cabang Praktik Utama" value={profile.primaryBranch || profile.primary_branch || "Aesthetic Pondok Indah - Cabang Utama"} />
                  <DisplayRow icon={Activity} label="Tarif Baseline Konsultasi" value={`Rp ${Number(profile.consultationFee || profile.consultation_fee || 250000).toLocaleString('id-ID')}`} />
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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Informasi Pribadi */}
              <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Informasi Pribadi</h3>
                  </div>
                </div>
                <CardContent className="p-6 divide-y divide-gray-100">
                  <DisplayRow icon={User} label="Nama Lengkap" value={profile.name} />
                  <DisplayRow icon={Mail} label="Email" value={profile.email} />
                  <DisplayRow icon={Phone} label="Nomor WhatsApp" value={profile.phone} />
                  <DisplayRow icon={Calendar} label="Tanggal Lahir" value={profile.birthDate} />
                  <DisplayRow
                    icon={User}
                    label="Jenis Kelamin"
                    value={
                      profile.gender === "male"
                        ? "Laki-laki"
                        : profile.gender === "female"
                        ? "Perempuan"
                        : profile.gender || "-"
                    }
                  />
                  <DisplayRow icon={Droplet} label="Golongan Darah" value={profile.bloodType ? `Golongan ${profile.bloodType}` : "-"} />
                  <DisplayRow icon={Briefcase} label="Pekerjaan" value={profile.job} />
                </CardContent>
              </Card>

              {/* Card 2: Alamat & Domisili */}
              <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Alamat & Domisili</h3>
                  </div>
                </div>
                <CardContent className="p-6 divide-y divide-gray-100">
                  <DisplayRow icon={MapPin} label="Alamat Lengkap" value={profile.address} />
                  <DisplayRow icon={MapPin} label="Provinsi" value={profile.province} />
                  <DisplayRow icon={MapPin} label="Kota / Kabupaten" value={profile.city} />
                  <DisplayRow icon={MapPin} label="Kecamatan" value={profile.district} />
                  <DisplayRow icon={MapPin} label="Kode Pos" value={profile.postalCode} />
                </CardContent>
              </Card>
            </div>

            {/* Card 3: Preferensi Medis, Gaya Hidup & Kebiasaan */}
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Preferensi Medis & Gaya Hidup</h3>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Terakhir Kunjungan Gigi</p>
                    <p className="text-sm font-bold text-gray-800">{profile.lastDentalVisit || "Belum Ada Catatan"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Provider Asuransi</p>
                    <p className="text-sm font-bold text-gray-800">{profile.insuranceProvider || "Tanpa Asuransi"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Konsumsi Kopi / Teh</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-amber-700" />
                      {profile.isCoffeeDrinker ? "Ya, Rutin" : "Tidak"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status Perokok</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-600" />
                      {profile.isSmoker ? "Ya, Perokok" : "Bukan Perokok"}
                    </p>
                  </div>
                </div>

                {/* Chips Display Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Keluhan Gigi */}
                  {Array.isArray(profile.dentalComplaints) && profile.dentalComplaints.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Keluhan Gigi Dilaporkan
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.dentalComplaints.map((c: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layanan Yang Diinginkan */}
                  {Array.isArray(profile.desiredServices) && profile.desiredServices.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Layanan Gigi Yang Diinginkan
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.desiredServices.map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200/60 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tujuan Perawatan */}
                  {Array.isArray(profile.treatmentGoals) && profile.treatmentGoals.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Smile className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Tujuan Perawatan Gigi
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.treatmentGoals.map((g: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-medium">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Saluran Komunikasi Favorit */}
                  {Array.isArray(profile.preferredCommunicationChannels) && profile.preferredCommunicationChannels.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Saluran Komunikasi Favorit
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferredCommunicationChannels.map((ch: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200/60 rounded-full text-xs font-medium">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
