import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { getSession, updateSessionProfile } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Pencil, ArrowLeft } from "lucide-react";
import { getDoctorProfile, type DoctorProfileData } from "../services/doctorProfileService";
import DoctorProfileCard from "../components/DoctorProfileCard";

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
    getDoctorProfile().then((data) => {
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
    });
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
              <h1 className="text-2xl font-bold text-[#4A3F35]">Profil Dokter Spesialis</h1>
              <p className="text-sm text-gray-500">Informasi kredensial, alumni, spesialisasi, dan kontak Anda</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/profile/edit")}
            className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#C9A24A]/20 h-10 px-5"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Card Modular Component */}
        <DoctorProfileCard profile={profile} />
      </div>
    </DashboardLayout>
  );
}
