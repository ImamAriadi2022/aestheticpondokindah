import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { getSession, updateSessionProfile } from "@/core/auth/services/session";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { JOB_OPTIONS, GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from "@/core/constants/regionData";
import { getProvinces, getRegencies, getDistricts, type WilayahItem } from "@/core/api/wilayahApi";
import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";
import { toast } from "@/shared/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  User,
  Save,
  MapPin,
  Calendar,
  ArrowLeft,
  X,
  Camera,
  Activity,
  Coffee,
  Flame,
  Stethoscope,
  HeartHandshake,
  Smile,
  Shield,
} from "lucide-react";

const normalizeGenderValue = (gender: string | null | undefined): string => {
  if (!gender) return "Laki-laki";
  const g = gender.trim().toLowerCase();
  if (g.includes("laki") || g.includes("pria") || g === "male") return "Laki-laki";
  if (g.includes("perempuan") || g.includes("wanita") || g === "female") return "Perempuan";
  return gender;
};

const LAST_DENTAL_VISIT_OPTIONS = [
  "< 6 Bulan Lalu",
  "6 - 12 Bulan Lalu",
  "1 - 2 Tahun Lalu",
  "Lebih dari 2 Tahun Lalu",
  "Belum Pernah Periksa Gigi",
];

const DENTAL_COMPLAINTS_OPTIONS = [
  "Gigi Berlubang",
  "Gigi Sensitif",
  "Gusi Berdarah / Bengkak",
  "Gigi Kuning / Noda",
  "Gigi Tidak Rapi / Gingsul",
  "Bau Mulut",
  "Tidak Ada Keluhan Khusus",
];

const DESIRED_SERVICES_OPTIONS = [
  "Pembersihan Karang Gigi (Scaling)",
  "Penambalan Gigi",
  "Pemutihan Gigi (Bleaching)",
  "Behel / Orthodontic",
  "Veneer Gigi",
  "Implan Gigi",
  "Pencabutan Gigi",
  "Konsultasi Rutin",
];

const TREATMENT_GOALS_OPTIONS = [
  "Senyum Lebih Estetik & Putih",
  "Bebas Dari Rasa Nyeri / Sakit",
  "Gigi Rapi & Rata",
  "Kesehatan Gigi & Gusi Jangka Panjang",
  "Pencegahan Karang & Gigi Berlubang",
];

export default function ProfileEditPage() {
  const session = getSession();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);

  const [profile, setProfile] = useState({
    name: session?.name || "",
    email: session?.email || "",
    phone: (session as any)?.whatsapp || session?.phone || "",
    avatar: (session as any)?.avatar || "",
    gender: normalizeGenderValue((session as any)?.gender) || "",
    birthDate: (session as any)?.birthDate || (session as any)?.birth_date || "",
    bloodType: (session as any)?.blood_type || (session as any)?.bloodType || "",
    job: (session as any)?.job || "",
    address: (session as any)?.address_line || (session as any)?.address || "",
    province: (session as any)?.province || "",
    provinceId: (session as any)?.provinceId || "",
    city: (session as any)?.city || "",
    cityId: (session as any)?.cityId || "",
    district: (session as any)?.district || "",
    districtId: (session as any)?.districtId || "",
    postalCode: (session as any)?.postalCode || (session as any)?.postal_code || "",
    insuranceProvider: (session as any)?.insuranceProvider || (session as any)?.insurance_provider || "",
    isCoffeeDrinker: (session as any)?.isCoffeeDrinker ?? false,
    isSmoker: (session as any)?.isSmoker ?? false,
    lastDentalVisit: (session as any)?.lastDentalVisit || "",
    dentalComplaints: (session as any)?.dentalComplaints || [],
    desiredServices: (session as any)?.desiredServices || [],
    treatmentGoals: (session as any)?.treatmentGoals || [],
  });

  useEffect(() => {
    let mounted = true;
    getProvinces().then((provList) => {
      if (mounted) setProvinces(provList || []);
    }).catch((err) => {
      logger.error("Failed to initialize region dropdowns:", err);
    });

    const token = localStorage.getItem("apident:token");
    if (!token) return;

    // Fetch live user profile from backend API
    fetch(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (!data || !mounted) return;

        const normGender = normalizeGenderValue(data.gender) || "";
        const normBlood = data.bloodType || data.blood_type || "";
        const normJob = data.job || "";
        const provName = data.province || "";
        const cityName = data.city || "";
        const distName = data.district || "";

        // Match province, regency, district IDs from wilayah API
        const provList = await getProvinces();
        if (mounted) setProvinces(provList || []);

        const foundProv = provName
          ? provList.find(
              (p) =>
                p.id === data.provinceId ||
                p.name.toLowerCase().trim() === provName.toLowerCase().trim()
            )
          : undefined;

        let regList: WilayahItem[] = [];
        let foundReg: WilayahItem | undefined;
        if (foundProv) {
          regList = await getRegencies(foundProv.id);
          if (mounted) setRegencies(regList);
          foundReg = cityName
            ? regList.find(
                (r) =>
                  r.id === data.cityId ||
                  r.name.toLowerCase().trim() === cityName.toLowerCase().trim()
              )
            : undefined;
        }

        let distList: WilayahItem[] = [];
        let foundDist: WilayahItem | undefined;
        if (foundReg) {
          distList = await getDistricts(foundReg.id);
          if (mounted) setDistricts(distList);
          foundDist = distName
            ? distList.find(
                (d) =>
                  d.id === data.districtId ||
                  d.name.toLowerCase().trim() === distName.toLowerCase().trim()
              )
            : undefined;
        }

        setProfile((prev) => ({
          ...prev,
          name: data.name ?? prev.name,
          email: data.email ?? prev.email,
          phone: data.phone || data.whatsapp || prev.phone,
          avatar: data.avatar || prev.avatar,
          gender: normGender,
          birthDate: data.birthDate || data.birth_date || "",
          bloodType: normBlood,
          job: normJob,
          address: data.address || data.address_line || "",
          province: provName,
          provinceId: foundProv?.id || data.provinceId || "",
          city: cityName,
          cityId: foundReg?.id || data.cityId || "",
          district: distName,
          districtId: foundDist?.id || data.districtId || "",
          postalCode: data.postalCode || data.postal_code || "",
          insuranceProvider: data.insuranceProvider || data.insurance_provider || "",
          isCoffeeDrinker: data.isCoffeeDrinker ?? false,
          isSmoker: data.isSmoker ?? false,
          lastDentalVisit: data.lastDentalVisit || "",
          dentalComplaints: data.dentalComplaints || [],
          desiredServices: data.desiredServices || [],
          treatmentGoals: data.treatmentGoals || [],
        }));
      })
      .catch((err) => logger.error("Failed to load user profile from API:", err));

    return () => {
      mounted = false;
    };
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { compressImageToWebP } = await import("@/core/utils/imageCompressor");
      const result = await compressImageToWebP(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });
      setProfile((prev) => ({ ...prev, avatar: result.dataUrl }));
    } catch (err) {
      toast({
        title: "Gagal Memproses Foto",
        message: "Tidak dapat mengompresi foto profil.",
        variant: "error",
      });
    }
  };

  const handleProvinceChange = (provId: string) => {
    const provName = provinces.find((p) => p.id === provId)?.name || "";
    setProfile((prev) => ({
      ...prev,
      provinceId: provId,
      province: provName,
      cityId: "",
      city: "",
      districtId: "",
      district: "",
    }));
    if (provId) {
      getRegencies(provId).then((regList) => setRegencies(regList || []));
    } else {
      setRegencies([]);
    }
    setDistricts([]);
  };

  const handleCityChange = (regId: string) => {
    const regName = regencies.find((r) => r.id === regId)?.name || "";
    setProfile((prev) => ({
      ...prev,
      cityId: regId,
      city: regName,
      districtId: "",
      district: "",
    }));
    if (regId) {
      getDistricts(regId).then((distList) => setDistricts(distList || []));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (distId: string) => {
    const distName = districts.find((d) => d.id === distId)?.name || "";
    setProfile((prev) => ({
      ...prev,
      districtId: distId,
      district: distName,
    }));
  };

  const toggleArrayItem = (key: "dentalComplaints" | "desiredServices" | "treatmentGoals", item: string) => {
    setProfile((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(item)
        ? current.filter((x: string) => x !== item)
        : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("apident:token");
      if (!token) {
        toast({
          title: "Sesi Habis",
          message: "Silakan login kembali untuk menyimpan profil Anda.",
          variant: "error",
        });
        return;
      }

      // Clean payload: map phone to whatsapp, convert empty strings to null
      const payload: Record<string, any> = { ...profile };
      payload.whatsapp = profile.phone || (profile as any).whatsapp;
      Object.keys(payload).forEach((k) => {
        if (typeof payload[k] === "string" && payload[k].trim() === "") {
          payload[k] = null;
        }
      });

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errMsg =
          errorData?.message ||
          (errorData?.errors ? Object.values(errorData.errors).flat().join(", ") : "Gagal memperbarui data profil.");
        toast({
          title: "Gagal Menyimpan Profil",
          message: errMsg,
          variant: "error",
        });
        return;
      }

      const updatedUser = await res.json();
      updateSessionProfile(updatedUser);

      toast({
        title: "Berhasil",
        message: "Profil Anda telah berhasil diperbarui",
        variant: "info",
      });

      navigate("/profile");
    } catch (err: any) {
      logger.error("Failed to update profile:", err);
      toast({
        title: "Gagal",
        message: err?.message || "Terjadi kesalahan saat menyimpan profil",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

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
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profil</h1>
              <p className="text-sm text-gray-500">Ubah data diri, domisili, dan preferensi kesehatan gigi Anda</p>
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

        {/* 2-Column Grid Layout Matching ProfileDetail.tsx */}
        {sessionRole === "clinic" ? (
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white max-w-2xl mx-auto">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Edit Data Administrator</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Foto Avatar Upload */}
              <div className="flex items-center gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60">
                <div className="relative shrink-0">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Foto Profil"
                      className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#c9a24a]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#c9a24a] flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
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
                  <h4 className="text-sm font-bold text-gray-900">Foto Profil Administrator</h4>
                  <p className="text-xs text-gray-500">Unggah foto profil administrator klinik (maks 2MB)</p>
                </div>
              </div>

              {/* Nama Lengkap Admin */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nama Lengkap Administrator</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nama administrator"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Email Operasional */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Email Operasional</label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Email aktif"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nomor WhatsApp Admin</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+628..."
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Informasi Pribadi */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Informasi Pribadi</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Foto Avatar Upload */}
              <div className="flex items-center gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60">
                <div className="relative shrink-0">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Foto Profil"
                      className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#c9a24a]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#c9a24a] flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
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
                  <h4 className="text-sm font-bold text-gray-900">Foto Profil</h4>
                  <p className="text-xs text-gray-500">Klik ikon kamera untuk unggah foto baru (maks 2MB)</p>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nama Lengkap</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nama lengkap"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Email</label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Email aktif"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Nomor WhatsApp</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+628..."
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Tanggal Lahir</label>
                <Input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Jenis Kelamin Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Jenis Kelamin</label>
                <Select
                  value={profile.gender || undefined}
                  onValueChange={(val) => setProfile((prev) => ({ ...prev, gender: val }))}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Golongan Darah Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Golongan Darah</label>
                <Select
                  value={profile.bloodType || undefined}
                  onValueChange={(val) => setProfile((prev) => ({ ...prev, bloodType: val }))}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Golongan Darah" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {BLOOD_TYPE_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pekerjaan Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Pekerjaan</label>
                <Select
                  value={profile.job || undefined}
                  onValueChange={(val) => setProfile((prev) => ({ ...prev, job: val }))}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Pekerjaan" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {JOB_OPTIONS.map((j) => (
                      <SelectItem key={j} value={j} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Alamat & Domisili */}
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Alamat & Domisili</h3>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Alamat Lengkap */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Alamat Lengkap</label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Jl. Nama Jalan No..."
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Provinsi Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Provinsi</label>
                <Select
                  value={profile.provinceId || undefined}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Provinsi" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kota / Kab Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Kota / Kabupaten</label>
                <Select
                  value={profile.cityId || undefined}
                  onValueChange={handleCityChange}
                  disabled={!profile.provinceId || regencies.length === 0}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm disabled:opacity-50">
                    <SelectValue placeholder={profile.provinceId ? "Pilih Kota / Kabupaten" : "Pilih Provinsi Terlebih Dahulu"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {regencies.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kecamatan Radix UI Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Kecamatan</label>
                <Select
                  value={profile.districtId || undefined}
                  onValueChange={handleDistrictChange}
                  disabled={!profile.cityId || districts.length === 0}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm disabled:opacity-50">
                    <SelectValue placeholder={profile.cityId ? "Pilih Kecamatan" : "Pilih Kota/Kab Terlebih Dahulu"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kode Pos */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Kode Pos</label>
                <Input
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  placeholder="Kode Pos"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 3: Preferensi Medis, Gaya Hidup & Kebiasaan */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Preferensi Medis & Gaya Hidup</h3>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Terakhir Kunjungan Gigi */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#c9a24a]" />
                  Terakhir Kunjungan Gigi
                </label>
                <Select
                  value={profile.lastDentalVisit || undefined}
                  onValueChange={(val) => setProfile((prev) => ({ ...prev, lastDentalVisit: val }))}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 bg-white text-gray-900 font-medium text-sm">
                    <SelectValue placeholder="Pilih Waktu Kunjungan Terakhir" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-200 text-gray-900 rounded-xl shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {LAST_DENTAL_VISIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-gray-900 font-medium hover:bg-[#c9a24a]/10 hover:text-[#c9a24a]">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Asuransi */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#c9a24a]" />
                  Provider Asuransi
                </label>
                <Input
                  value={profile.insuranceProvider}
                  onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                  placeholder="Misal: Mandiri Inhealth / BPJS / Allianz"
                  className="rounded-xl border-gray-200 focus:border-[#c9a24a] focus:ring-[#c9a24a]/20 text-gray-900"
                />
              </div>

              {/* Kebiasaan Konsumsi (Coffee & Smoker) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Kebiasaan Konsumsi & Gaya Hidup</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${profile.isCoffeeDrinker ? 'bg-amber-50/60 border-amber-300 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={profile.isCoffeeDrinker}
                      onChange={(e) => setProfile({ ...profile, isCoffeeDrinker: e.target.checked })}
                      className="w-4 h-4 rounded text-[#c9a24a] focus:ring-[#c9a24a]"
                    />
                    <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-semibold">Peminum Kopi / Teh Rutin</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${profile.isSmoker ? 'bg-rose-50/60 border-rose-300 text-rose-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={profile.isSmoker}
                      onChange={(e) => setProfile({ ...profile, isSmoker: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-semibold">Perokok / Vaper</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Checkbox Chips Sections */}
            {/* Keluhan Gigi */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#c9a24a]" />
                Keluhan Gigi Yang Pernah Dilaporkan
              </label>
              <div className="flex flex-wrap gap-2">
                {DENTAL_COMPLAINTS_OPTIONS.map((item) => {
                  const active = (profile.dentalComplaints || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("dentalComplaints", item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-[#c9a24a] text-white border-[#c9a24a] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {active ? `✓ ${item}` : item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layanan Yang Diinginkan */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#c9a24a]" />
                Layanan Gigi Yang Diinginkan
              </label>
              <div className="flex flex-wrap gap-2">
                {DESIRED_SERVICES_OPTIONS.map((item) => {
                  const active = (profile.desiredServices || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("desiredServices", item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {active ? `✓ ${item}` : item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tujuan Perawatan */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#c9a24a]" />
                Tujuan Perawatan Gigi
              </label>
              <div className="flex flex-wrap gap-2">
                {TREATMENT_GOALS_OPTIONS.map((item) => {
                  const active = (profile.treatmentGoals || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("treatmentGoals", item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {active ? `✓ ${item}` : item}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )}

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="rounded-xl px-5 h-11 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl px-8 h-11 shadow-md shadow-[#c9a24a]/20 transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Memproses..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
