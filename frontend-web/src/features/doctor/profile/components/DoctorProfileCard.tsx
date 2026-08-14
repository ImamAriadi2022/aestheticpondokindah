import { Card, CardContent } from "@/shared/ui/card";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Smile,
} from "lucide-react";

interface DoctorProfileCardProps {
  profile: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    specialization?: string;
    strNumber?: string;
    sipNumber?: string;
    education?: string;
    experienceYears?: number | string;
    primaryBranch?: string;
    consultationFee?: number;
    bio?: string;
  };
}

export default function DoctorProfileCard({ profile }: DoctorProfileCardProps) {
  return (
    <div className="space-y-6">
      {/* Banner / Card Atas */}
      <Card className="rounded-3xl border-[#F0E6D3] shadow-sm overflow-hidden bg-white">
        <div className="h-32 bg-gradient-to-r from-[#C9A24A] via-[#E8C547] to-[#B8943F] relative" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-12">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center text-[#C9A24A]">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35] truncate">{profile.name}</h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dokter Terverifikasi
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#C9A24A] mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Stethoscope className="w-4 h-4" />
                {profile.specialization}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {profile.primaryBranch}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Informasi Kredensial & Kontak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kredensial Medis */}
        <Card className="rounded-2xl border-[#F0E6D3] shadow-sm bg-white overflow-hidden">
          <div className="bg-[#FAF8F5] px-6 py-3.5 border-b border-[#F0E6D3] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A24A]" />
            <h3 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider">Kredensial & Izin Praktik</h3>
          </div>
          <CardContent className="p-6 space-y-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold">Nomor STR (Registrasi)</p>
              <p className="text-[#4A3F35] font-mono font-bold text-sm mt-0.5">{profile.strNumber || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Nomor SIP (Izin Praktik)</p>
              <p className="text-[#4A3F35] font-mono font-bold text-sm mt-0.5">{profile.sipNumber || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Pendidikan & Alumni</p>
              <p className="text-[#4A3F35] font-medium mt-0.5">{profile.education || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Pengalaman Praktik</p>
              <p className="text-[#4A3F35] font-medium mt-0.5">{profile.experienceYears || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Kontak & Tarif */}
        <Card className="rounded-2xl border-[#F0E6D3] shadow-sm bg-white overflow-hidden">
          <div className="bg-[#FAF8F5] px-6 py-3.5 border-b border-[#F0E6D3] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C9A24A]" />
            <h3 className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider">Kontak & Layanan</h3>
          </div>
          <CardContent className="p-6 space-y-4 text-xs">
            <div>
              <p className="text-gray-500 font-semibold">Email Login</p>
              <p className="text-[#4A3F35] font-medium mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">WhatsApp / Telepon</p>
              <p className="text-[#4A3F35] font-medium mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {profile.phone}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Tarif Baseline Konsultasi</p>
              <p className="text-[#C9A24A] font-bold text-sm mt-0.5">
                Rp {(profile.consultationFee || 250000).toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Tentang Dokter</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed">{profile.bio || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
