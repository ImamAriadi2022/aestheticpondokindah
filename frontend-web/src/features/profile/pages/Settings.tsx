import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { getSession, updateSessionProfile } from "@/features/auth/services/session";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { JOB_OPTIONS, GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from "@/lib/regionData";
import { getProvinces, getRegencies, getDistricts } from "@/lib/wilayahApi";
import { API_BASE } from "@/lib/apiConfig";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/toast";
import {
  User,
  Check,
  Save,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Briefcase,
  Printer,
  Heart,
  Shield,
  Camera,
  Star,
} from "lucide-react";

const normalizeGenderValue = (gender: string | null | undefined): string => {
  switch ((gender || "").trim().toLowerCase()) {
    case "laki-laki":
    case "laki laki":
    case "pria":
    case "male":
      return "male";
    case "perempuan":
    case "wanita":
    case "female":
      return "female";
    case "lainnya":
    case "other":
      return "other";
    default:
      return "";
  }
};

export default function SettingsPage() {
  // Ambil session dari backend asli
  const session = getSession();

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: session?.name || "",
    email: session?.email || "",
    phone: (session as any)?.whatsapp || session?.phone || "",
    gender: normalizeGenderValue((session as any)?.gender),
    birthDate: (session as any)?.birthDate || "",
    bloodType: (session as any)?.blood_type || (session as any)?.bloodType || "",
    job: (session as any)?.job || "",
    address: (session as any)?.address_line || (session as any)?.address || "",
    province: (session as any)?.province || "",
    provinceId: (session as any)?.provinceId || "",
    city: (session as any)?.city || "",
    cityId: (session as any)?.cityId || "",
    district: (session as any)?.district || "",
    districtId: (session as any)?.districtId || "",
    postalCode: (session as any)?.postalCode || "",
    interests: (session as any)?.interests || [],
    consumptionHabits: (session as any)?.consumptionHabits || [],
    sourceInfo: (session as any)?.sourceInfo || "",
    insuranceProvider: (session as any)?.insuranceProvider || "",

    dentalComplaints: (session as any)?.dentalComplaints || [],
    desiredServices: (session as any)?.desiredServices || [],
    currentDentalConditions: (session as any)?.currentDentalConditions || [],
    lastDentalVisit: (session as any)?.lastDentalVisit || "",
    lifestyleInterests: (session as any)?.lifestyleInterests || [],
    treatmentGoals: (session as any)?.treatmentGoals || [],
    preferredCommunicationChannels: (session as any)?.preferredCommunicationChannels || [],
  });

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("apident:token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          logger.error("Gagal fetch profil", await res.text());
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        setProfile((p) => ({
          ...p,
          name: data?.name ?? p.name,
          email: data?.email ?? p.email,
          phone: data?.phone ?? (data?.whatsapp ?? p.phone),
          gender: normalizeGenderValue(data?.gender) || p.gender,
          birthDate: data?.birthDate ?? p.birthDate,
          bloodType: data?.bloodType ?? (data?.blood_type ?? p.bloodType),
          job: data?.job ?? p.job,
          address: data?.address ?? (data?.address_line ?? p.address),
          province: data?.province ?? p.province,
          city: data?.city ?? p.city,
          district: data?.district ?? p.district,
          postalCode: data?.postalCode ?? p.postalCode,
          interests: Array.isArray(data?.interests) ? data.interests : p.interests,
          consumptionHabits: Array.isArray(data?.consumptionHabits) ? data.consumptionHabits : p.consumptionHabits,
          sourceInfo: data?.sourceInfo ?? p.sourceInfo,
          insuranceProvider: data?.insuranceProvider ?? p.insuranceProvider,

          dentalComplaints: Array.isArray(data?.dentalComplaints) ? data.dentalComplaints : p.dentalComplaints,
          desiredServices: Array.isArray(data?.desiredServices) ? data.desiredServices : p.desiredServices,
          currentDentalConditions: Array.isArray(data?.currentDentalConditions) ? data.currentDentalConditions : p.currentDentalConditions,
          lastDentalVisit: data?.lastDentalVisit ?? p.lastDentalVisit,
          lifestyleInterests: Array.isArray(data?.lifestyleInterests) ? data.lifestyleInterests : p.lifestyleInterests,
          treatmentGoals: Array.isArray(data?.treatmentGoals) ? data.treatmentGoals : p.treatmentGoals,
          preferredCommunicationChannels: Array.isArray(data?.preferredCommunicationChannels)
            ? data.preferredCommunicationChannels
            : p.preferredCommunicationChannels,
        }));

        // Sinkronkan ke localStorage agar dashboard/profil lain tidak kosong setelah reload
        try {
          const rawUser = localStorage.getItem("apident:user");
          const currentUser = rawUser ? JSON.parse(rawUser) : {};
          const mergedUser = {
            ...currentUser,
            ...data,
            whatsapp: data?.phone ?? currentUser?.whatsapp,
            phone: data?.phone ?? currentUser?.phone,
            blood_type: data?.bloodType ?? currentUser?.blood_type,
            address_line: data?.address ?? currentUser?.address_line,
          };
          localStorage.setItem("apident:user", JSON.stringify(mergedUser));
        } catch (e) {
          logger.error("Gagal sinkronkan profil ke localStorage", e);
        }
      } catch (e) {
        logger.error("Gagal fetch profil", e);
      }
    };

    void fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const provinceOptions = useMemo(() => getProvinces(), []);
  const regencyOptions = useMemo(() => getRegencies(profile.provinceId), [profile.provinceId]);
  const districtOptions = useMemo(() => getDistricts(profile.cityId), [profile.cityId]);

  const normalizeWilayahName = (value: string) => {
    return (value || "")
      .toLowerCase()
      .replace(/^(kabupaten|kota)\s+/i, "")
      .trim();
  };

  useEffect(() => {
    if (profile.provinceId) return;
    if (!profile.province) return;
    if (provinceOptions.length === 0) return;

    const target = normalizeWilayahName(profile.province);
    const match = provinceOptions.find((x) => normalizeWilayahName(x.name) === target);
    if (!match) return;

    setProfile((p) => ({
      ...p,
      provinceId: match.id,
    }));
  }, [provinceOptions, profile.province, profile.provinceId]);

  useEffect(() => {
    if (!profile.provinceId) return;
    if (profile.cityId) return;
    if (!profile.city) return;
    if (regencyOptions.length === 0) return;

    const target = normalizeWilayahName(profile.city);
    const match = regencyOptions.find((x) => normalizeWilayahName(x.name) === target);
    if (!match) return;

    setProfile((p) => ({
      ...p,
      cityId: match.id,
    }));
  }, [regencyOptions, profile.provinceId, profile.city, profile.cityId]);

  useEffect(() => {
    if (!profile.cityId) return;
    if (profile.districtId) return;
    if (!profile.district) return;
    if (districtOptions.length === 0) return;

    const target = normalizeWilayahName(profile.district);
    const match = districtOptions.find((x) => normalizeWilayahName(x.name) === target);
    if (!match) return;

    setProfile((p) => ({
      ...p,
      districtId: match.id,
    }));
  }, [districtOptions, profile.cityId, profile.district, profile.districtId]);

  const serviceOptions: MultiSelectOption[] = [
    { value: "whitening", label: "Pemutihan Gigi (Whitening/Bleaching)" },
    { value: "orthodontics", label: "Perapihan Gigi (Behel/Invisalign)" },
    { value: "veneer", label: "Estetik Gigi (Veneer)" },
    { value: "implant", label: "Implan Gigi" },
    { value: "pediatric", label: "Perawatan Gigi Anak" },
    { value: "scaling", label: "Pembersihan Karang Gigi (Scaling)" },
  ];

  const consumptionOptions: MultiSelectOption[] = [
    { value: "coffee_tea", label: "Konsumsi Kopi/Teh (Sering)" },
    { value: "smoker", label: "Perokok" },
  ];

  const complaintOptions: MultiSelectOption[] = [
    { value: "tooth_sensitive", label: "Gigi sensitif" },
    { value: "tooth_yellow", label: "Gigi kuning" },
    { value: "bad_breath", label: "Bau mulut" },
    { value: "bleeding_gums", label: "Gusi berdarah" },
    { value: "cavities", label: "Gigi berlubang" },
    { value: "misaligned_teeth", label: "Gigi tidak rapi" },
    { value: "braces_issue", label: "Masalah behel" },
    { value: "broken_tooth", label: "Gigi patah" },
    { value: "missing_teeth", label: "Gigi ompong" },
    { value: "jaw_pain", label: "Nyeri rahang" },
    { value: "no_special_complaint", label: "Tidak ada keluhan khusus" },
  ];

  const desiredServiceOptions: MultiSelectOption[] = [
    { value: "dental_whitening", label: "Dental Whitening" },
    { value: "veneers", label: "Veneers" },
    { value: "invisalign", label: "Invisalign" },
    { value: "orthodontics", label: "Behel / Orthodontics" },
    { value: "scaling_cleaning", label: "Scaling & Cleaning" },
    { value: "dental_spa", label: "Dental Spa" },
    { value: "dental_implant", label: "Implan Gigi" },
    { value: "smile_makeover", label: "Smile Makeover" },
    { value: "gum_treatment", label: "Perawatan Gusi" },
    { value: "tooth_filling", label: "Tambal Gigi" },
    { value: "tooth_extraction", label: "Cabut Gigi" },
    { value: "pediatric_dentistry", label: "Perawatan Anak" },
    { value: "aesthetic_consultation", label: "Konsultasi Estetik Gigi" },
  ];

  const currentConditionOptions: MultiSelectOption[] = [
    { value: "wearing_braces", label: "Sedang menggunakan behel" },
    { value: "had_veneers", label: "Pernah veneer" },
    { value: "had_bleaching", label: "Pernah bleaching" },
    { value: "has_implant", label: "Memiliki implan gigi" },
    { value: "none", label: "Tidak ada" },
  ];

  const lastVisitOptions = [
    { value: "lt_6m", label: "Kurang dari 6 bulan" },
    { value: "6_12m", label: "6–12 bulan lalu" },
    { value: "gt_1y", label: "Lebih dari 1 tahun" },
    { value: "very_long", label: "Sudah sangat lama" },
    { value: "never", label: "Belum pernah" },
  ];

  const lifestyleOptions: MultiSelectOption[] = [
    { value: "beauty_skincare", label: "Beauty & Skincare" },
    { value: "fitness_gym", label: "Fitness / Gym" },
    { value: "healthy_lifestyle", label: "Healthy Lifestyle" },
    { value: "fashion", label: "Fashion" },
    { value: "coffee_cafe", label: "Coffee & Cafe" },
    { value: "traveling", label: "Traveling" },
    { value: "parenting", label: "Parenting" },
    { value: "business_career", label: "Business & Professional Career" },
    { value: "luxury_lifestyle", label: "Luxury Lifestyle" },
    { value: "social_media_content", label: "Social Media & Content" },
    { value: "wellness_selfcare", label: "Wellness & Self Care" },
  ];

  const treatmentGoalOptions: MultiSelectOption[] = [
    { value: "confidence_smile", label: "Ingin senyum lebih percaya diri" },
    { value: "more_attractive", label: "Ingin penampilan lebih menarik" },
    { value: "routine_health", label: "Menjaga kesehatan gigi rutin" },
    { value: "relieve_pain", label: "Mengatasi rasa sakit" },
    { value: "wedding_event", label: "Persiapan wedding / event" },
    { value: "professional_look", label: "Mendukung penampilan profesional" },
    { value: "camera_ready", label: "Ingin tampil lebih estetik di kamera / media sosial" },
  ];

  const communicationOptions: MultiSelectOption[] = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Telepon" },
  ];

  const calculateProgress = () => {
    const fields = [
      "name",
      "email",
      "phone",
      "gender",
      "birthDate",
      "bloodType",
      "job",
      "address",
      "province",
      "city",
      "sourceInfo",
    ];
    const filledFields = fields.filter((field) => !!(profile as any)[field]);
    const interestScore = profile.interests.length > 0 ? 1 : 0;
    const totalFields = fields.length + 1;
    const totalFilled = filledFields.length + interestScore;
    return Math.round((totalFilled / totalFields) * 100);
  };

  const progress = calculateProgress();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleProfileSave = async () => {
    if (isSaving) return;

    const token = localStorage.getItem("apident:token");
    if (!token) {
      toast({
        title: "Sesi berakhir",
        message: "Silakan login kembali sebelum menyimpan profil.",
        variant: "error",
      });
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      const rawUser = localStorage.getItem("apident:user");
      const currentUser = rawUser ? JSON.parse(rawUser) : null;

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            whatsapp: profile.phone,
            birthDate: profile.birthDate,
            gender: profile.gender,
            bloodType: profile.bloodType,
            job: profile.job,
            address: profile.address,
            province: profile.province,
            city: profile.city,
            district: profile.district,
            postalCode: profile.postalCode,
            interests: profile.interests,
            consumptionHabits: profile.consumptionHabits,
            sourceInfo: profile.sourceInfo,
            insuranceProvider: profile.insuranceProvider,

            dentalComplaints: profile.dentalComplaints,
            desiredServices: profile.desiredServices,
            currentDentalConditions: profile.currentDentalConditions,
            lastDentalVisit: profile.lastDentalVisit || null,
            lifestyleInterests: profile.lifestyleInterests,
            treatmentGoals: profile.treatmentGoals,
            preferredCommunicationChannels: profile.preferredCommunicationChannels,
        }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        const firstValidationError = errorPayload?.errors
          ? Object.values(errorPayload.errors).flat().find((message): message is string => typeof message === "string")
          : null;
        throw new Error(firstValidationError || errorPayload?.message || "Profil gagal disimpan.");
      }

      const updated = await res.json();
          const nextUser = {
            ...(currentUser || {}),
            name: updated?.name ?? profile.name,
            email: updated?.email ?? profile.email,
            whatsapp: updated?.phone ?? updated?.whatsapp ?? profile.phone,
            birthDate: updated?.birthDate ?? profile.birthDate,
            gender: updated?.gender ?? profile.gender,
            bloodType: updated?.bloodType ?? profile.bloodType,
            blood_type: updated?.bloodType ?? profile.bloodType,
            job: updated?.job ?? profile.job,
            address_line: updated?.address ?? profile.address,
            address: updated?.address ?? profile.address,
            province: updated?.province ?? profile.province,
            city: updated?.city ?? profile.city,
            district: updated?.district ?? profile.district,
            interests: updated?.interests ?? profile.interests,
            consumptionHabits: updated?.consumptionHabits ?? profile.consumptionHabits,
            sourceInfo: updated?.sourceInfo ?? profile.sourceInfo,
            insuranceProvider: updated?.insuranceProvider ?? profile.insuranceProvider,

            dentalComplaints: updated?.dentalComplaints ?? profile.dentalComplaints,
            desiredServices: updated?.desiredServices ?? profile.desiredServices,
            currentDentalConditions: updated?.currentDentalConditions ?? profile.currentDentalConditions,
            lastDentalVisit: updated?.lastDentalVisit ?? profile.lastDentalVisit,
            lifestyleInterests: updated?.lifestyleInterests ?? profile.lifestyleInterests,
            treatmentGoals: updated?.treatmentGoals ?? profile.treatmentGoals,
            preferredCommunicationChannels: updated?.preferredCommunicationChannels ?? profile.preferredCommunicationChannels,
          };
          localStorage.setItem("apident:user", JSON.stringify(nextUser));

          updateSessionProfile({
        ...profile,
        phone: nextUser?.whatsapp ?? nextUser?.phone ?? profile.phone,
      } as any);
      setSaved(true);
      toast({
        title: "Profil tersimpan",
        message: "Perubahan profil Anda telah berhasil disimpan ke database.",
        variant: "success",
      });
      window.setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      logger.error("Gagal simpan profil", e);
      toast({
        title: "Profil belum tersimpan",
        message: e instanceof Error ? e.message : "Terjadi kesalahan saat menyimpan profil.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setDentalComplaints = (next: string[]) => {
    if (next.includes("no_special_complaint")) {
      setProfile({ ...profile, dentalComplaints: ["no_special_complaint"] });
      return;
    }
    setProfile({ ...profile, dentalComplaints: next.filter((x) => x !== "no_special_complaint") });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Silakan login terlebih dahulu</p>
          <Button onClick={() => navigate("/login")} className="bg-[#c9a24a] text-white">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full px-2 sm:px-4 pb-12">
        {/* Modern Hero Section */}
        <div className="relative mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e8]/30 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Profil Saya
                </h1>
                <p className="text-sm text-gray-500 mt-1">Kelola informasi pribadi dan preferensi Anda</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl px-5 h-11 text-sm font-medium border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2 text-gray-600" />
                  Cetak
                </Button>
                <Button
                  className="rounded-xl px-5 h-11 text-sm font-medium bg-[#c9a24a] hover:bg-[#a8843a] text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {isEditMode ? "Selesai" : "Edit Profil"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern 2-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Profile Card */}
          <div className="xl:col-span-4 order-2 xl:order-1">
            <div className="sticky top-6 space-y-6">
              {/* Modern Profile Card */}
              <Card className="rounded-2xl border-0 shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
                {/* Profile Header with Gold Gradient */}
                <div className="h-32 bg-gradient-to-br from-[#e8d5a3] via-[#d4b483] to-[#c9a24a] relative">
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 128" preserveAspectRatio="none">
                      <path d="M0,64 Q100,0 200,64 T400,64 L400,128 L0,128 Z" fill="white" opacity="0.3"/>
                      <path d="M0,96 Q100,32 200,96 T400,96 L400,128 L0,128 Z" fill="white" opacity="0.2"/>
                    </svg>
                  </div>
                </div>

                <CardContent className="relative px-6 pb-6 pt-0">
                  <div className="flex flex-col items-center -mt-16">
                    {/* Avatar with Initial */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f5e6c8] to-[#e8d5a3] flex items-center justify-center text-[#8a6b2b] text-4xl font-bold">
                          {session.name ? session.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-[#e8d5a3] flex items-center justify-center shadow-md">
                        <Camera className="w-4 h-4 text-[#a8843a]" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-bold text-gray-900">{session.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{session.email}</p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        Akun Terverifikasi
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Kelengkapan Profil</span>
                      <span className="text-lg font-bold text-[#a8843a]">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Profile Sections Checklist */}
                  <div className="mt-6 space-y-2">
                    {[
                      { icon: User, label: "Informasi Pribadi", status: "Lengkap", done: true },
                      { icon: MapPin, label: "Alamat & Lokasi", status: "Lengkap", done: true },
                      { icon: Heart, label: "Gaya Hidup & Segmentasi", status: "Lengkap", done: true },
                      { icon: Star, label: "Preferensi Layanan", status: "Lengkap", done: true },
                      { icon: Shield, label: "Keamanan Akun", status: "Aktif", done: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#f5e6c8] flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-[#a8843a]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          {item.status} <Check className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Info Card */}
              <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/40 bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center shadow-lg shadow-amber-200">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Informasi Anda aman bersama kami.</h3>
                      <p className="text-xs text-gray-600 mt-1">Data pribadi Anda dilindungi dengan enkripsi tingkat tinggi.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="xl:col-span-8 order-1 xl:order-2 space-y-6">
            {/* Informasi Pribadi Card */}
            <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/40 bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-100 bg-[#faf8f5]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8d5a3] to-[#c9a24a] flex items-center justify-center shadow-lg shadow-amber-200">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Informasi Pribadi</CardTitle>
                    <p className="text-xs text-gray-500">Data dasar untuk identifikasi pasien</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-gray-400" />
                      Nama Lengkap
                    </label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      Nomor WhatsApp
                    </label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      Tanggal Lahir
                    </label>
                    <Input
                      type="date"
                      value={profile.birthDate}
                      onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                      className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Jenis Kelamin</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={normalizeGenderValue(g)}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Droplet className="w-3 h-3 text-gray-400" />
                      Golongan Darah
                    </label>
                    <select
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Pilih Golongan Darah</option>
                      {BLOOD_TYPE_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-gray-400" />
                    Pekerjaan
                  </label>
                  <select
                    value={profile.job}
                    onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                  >
                    <option value="">Pilih Pekerjaan</option>
                    {JOB_OPTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Alamat Card */}
            <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/40 bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-100 bg-[#faf8f5]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8d5a3] to-[#c9a24a] flex items-center justify-center shadow-lg shadow-amber-200">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Alamat & Lokasi</CardTitle>
                    <p className="text-xs text-gray-500">Informasi alamat lengkap Anda</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Alamat Lengkap</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 text-sm font-medium bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 transition-all resize-none hover:border-gray-300"
                    placeholder="Masukkan alamat lengkap (jalan, RT/RW, kelurahan, dsb.)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Provinsi</label>
                    <select
                      value={profile.provinceId}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = provinceOptions.find((x) => x.id === value);
                        setProfile({
                          ...profile,
                          provinceId: value,
                          province: selected?.name ?? "",
                          cityId: "",
                          city: "",
                          districtId: "",
                          district: "",
                        });
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinceOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Kota / Kabupaten</label>
                    <select
                      value={profile.cityId}
                      disabled={!profile.provinceId}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = regencyOptions.find((x) => x.id === value);
                        setProfile({
                          ...profile,
                          cityId: value,
                          city: selected?.name ?? "",
                          districtId: "",
                          district: "",
                        });
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!profile.provinceId
                          ? "Pilih Provinsi Dulu"
                          : "Pilih Kota/Kabupaten"}
                      </option>
                      {regencyOptions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Kecamatan</label>
                    <select
                      value={profile.districtId}
                      disabled={!profile.cityId}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = districtOptions.find((x) => x.id === value);
                        setProfile({
                          ...profile,
                          districtId: value,
                          district: selected?.name ?? "",
                        });
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!profile.cityId
                          ? "Pilih Kota Dulu"
                          : "Pilih Kecamatan"}
                      </option>
                      {districtOptions.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Kode Pos</label>
                    <Input
                      value={profile.postalCode}
                      onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                      className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                      placeholder="Contoh: 34194"
                    />
                  </div>
                </div>

                {/* Location info banner */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#faf8f5] to-[#f5f0e8] border border-[#e8d5a3]/30">
                  <div className="w-12 h-12 rounded-full bg-[#e8d5a3]/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#a8843a]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      Pastikan alamat sudah benar agar memudahkan kami memberikan layanan terbaik.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gaya Hidup & Segmentasi Card */}
            <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/40 bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-100 bg-[#faf8f5]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8d5a3] to-[#c9a24a] flex items-center justify-center shadow-lg shadow-amber-200">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Gaya Hidup & Segmentasi</CardTitle>
                    <p className="text-xs text-gray-500">Informasi untuk personalisasi layanan</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Keluhan Gigi yang Sering Dialami</label>
                    <MultiSelect
                      options={complaintOptions}
                      value={profile.dentalComplaints}
                      onChange={setDentalComplaints}
                      placeholder="Pilih keluhan (bisa lebih dari satu)"
                      searchPlaceholder="Cari keluhan..."
                    />
                    <p className="text-[10px] text-gray-400 font-semibold">
                      Jika memilih "Tidak ada keluhan khusus", pilihan lain otomatis dinonaktifkan.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Layanan yang Diminati</label>
                    <MultiSelect
                      options={desiredServiceOptions}
                      value={profile.desiredServices}
                      onChange={(next) => setProfile({ ...profile, desiredServices: next })}
                      placeholder="Pilih layanan (bisa lebih dari satu)"
                      searchPlaceholder="Cari layanan..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Kondisi Gigi Saat Ini (Opsional)</label>
                    <MultiSelect
                      options={currentConditionOptions}
                      value={profile.currentDentalConditions}
                      onChange={(next) => setProfile({ ...profile, currentDentalConditions: next })}
                      placeholder="Pilih kondisi (opsional)"
                      searchPlaceholder="Cari kondisi..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Kunjungan Terakhir ke Dokter Gigi (Opsional)</label>
                    <select
                      value={profile.lastDentalVisit}
                      onChange={(e) => setProfile({ ...profile, lastDentalVisit: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Pilih (opsional)</option>
                      {lastVisitOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Minat & Lifestyle</label>
                    <MultiSelect
                      options={lifestyleOptions}
                      value={profile.lifestyleInterests}
                      onChange={(next) => setProfile({ ...profile, lifestyleInterests: next })}
                      placeholder="Pilih minat (bisa lebih dari satu)"
                      searchPlaceholder="Cari minat..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Tujuan Utama Perawatan Gigi</label>
                    <MultiSelect
                      options={treatmentGoalOptions}
                      value={profile.treatmentGoals}
                      onChange={(next) => setProfile({ ...profile, treatmentGoals: next })}
                      placeholder="Pilih tujuan (bisa lebih dari satu)"
                      searchPlaceholder="Cari tujuan..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Media Komunikasi Favorit</label>
                    <MultiSelect
                      options={communicationOptions}
                      value={profile.preferredCommunicationChannels}
                      onChange={(next) => setProfile({ ...profile, preferredCommunicationChannels: next })}
                      placeholder="Pilih media (bisa lebih dari satu)"
                      searchable={false}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Kebiasaan Konsumsi</label>
                    <MultiSelect
                      options={consumptionOptions}
                      value={profile.consumptionHabits}
                      onChange={(next) => setProfile({ ...profile, consumptionHabits: next })}
                      placeholder="Pilih kebiasaan (bisa lebih dari satu)"
                      searchable={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Layanan yang Diminati (Segmentasi)</label>
                    <MultiSelect
                      options={serviceOptions}
                      value={profile.interests}
                      onChange={(next) => setProfile({ ...profile, interests: next })}
                      placeholder="Pilih layanan (bisa lebih dari satu)"
                      searchPlaceholder="Cari layanan..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Informasi & Asuransi</label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-700">Tahu Klinik Dari?</span>
                        <select
                          value={profile.sourceInfo}
                          onChange={(e) => setProfile({ ...profile, sourceInfo: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 appearance-none bg-[#faf8f5] transition-all cursor-pointer hover:border-gray-300"
                        >
                          <option value="">Pilih Sumber</option>
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="google">Google Maps/Search</option>
                          <option value="friends">Teman/Keluarga</option>
                          <option value="ads">Iklan Berbayar</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-700">Asuransi (Opsional)</span>
                        <Input
                          placeholder="Contoh: Prudential, Allianz, dsb."
                          value={profile.insuranceProvider}
                          onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                          className="h-11 rounded-xl text-sm border-gray-200 bg-[#faf8f5] focus:border-[#a8843a] focus:ring-2 focus:ring-amber-100 font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleProfileSave}
              disabled={isSaving}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-95 transition-all gap-2"
            >
              {isSaving ? <Save className="w-4 h-4 animate-pulse" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan Perubahan"}
            </Button>
          </div>
          </div> {/* End right column */}
        </div> {/* End grid */}
      </div>
    </DashboardLayout>
  );
}
