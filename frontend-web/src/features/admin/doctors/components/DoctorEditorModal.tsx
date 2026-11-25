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
  Loader2,
  Calendar,
  Clock,
  Camera,
  Trash2,
  Building2,
  MapPin,
  Banknote,
  FileText,
} from "lucide-react";
import { getStorageUrl } from "@/core/api/apiConfig";

type DoctorEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: any;
  onSave: (doctorData: any) => Promise<void>;
};

const SPECIALIZATION_OPTIONS = [
  "Dokter Gigi Umum",
  "Dokter Gigi Umum & Estetika",
  "Spesialis Kedokteran Gigi Anak (Sp.KGA)",
  "Spesialis Ortodonti (Sp.Ort)",
  "Spesialis Bedah Mulut & Maksilofasial (Sp.BM)",
  "Spesialis Konservasi Gigi (Sp.KG)",
  "Spesialis Periodonsia (Sp.Perio)",
  "Spesialis Prostodonsia (Sp.Pros)",
  "Spesialis Penyakit Mulut (Sp.PM)",
  "Oral & Maxillofacial Surgery",
];

const STR_INSTITUTIONS = [
  "Konsil Kedokteran Indonesia (KKI)",
  "Konsil Tenaga Kesehatan Gigi Indonesia (KTKGI)",
  "Kementerian Kesehatan RI",
];

const SIP_INSTITUTIONS = [
  "Persatuan Dokter Gigi Indonesia (PDGI)",
  "Dinas Kesehatan Kota / Kabupaten",
  "Pelayanan Terpadu Satu Pintu (PTSP)",
];

const TITLE_PREFIX_OPTIONS = ["drg.", "dr.", "Prof. drg.", ""];

const DAYS_OF_WEEK = [
  { key: "Senin", label: "Senin" },
  { key: "Selasa", label: "Selasa" },
  { key: "Rabu", label: "Rabu" },
  { key: "Kamis", label: "Kamis" },
  { key: "Jumat", label: "Jumat" },
  { key: "Sabtu", label: "Sabtu" },
  { key: "Minggu", label: "Minggu" },
];

export default function DoctorEditorModal({ open, onOpenChange, doctor, onSave }: DoctorEditorModalProps) {
  const isEdit = Boolean(doctor && doctor.id);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields matching Assist.id / Gambar 2 layout
  const [titlePrefix, setTitlePrefix] = useState("drg.");
  const [nameWithoutTitle, setNameWithoutTitle] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Laki-laki");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ktpNumber, setKtpNumber] = useState("");
  const [ihsId, setIhsId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // STR
  const [strInstitution, setStrInstitution] = useState(STR_INSTITUTIONS[0]);
  const [strNumber, setStrNumber] = useState("");
  const [strExpiry, setStrExpiry] = useState("");
  const [strLifetime, setStrLifetime] = useState(true);

  // SIP
  const [sipInstitution, setSipInstitution] = useState(SIP_INSTITUTIONS[0]);
  const [sipNumber, setSipNumber] = useState("");
  const [sipExpiry, setSipExpiry] = useState("");

  // Job & Specialty
  const [jobCategory, setJobCategory] = useState("Dokter Gigi");
  const [specialization, setSpecialization] = useState(SPECIALIZATION_OPTIONS[0]);
  const [subspecialist, setSubspecialist] = useState("");

  // Left Column Extra
  const [education, setEducation] = useState("Universitas Indonesia");
  const [experienceYears, setExperienceYears] = useState(5);
  const [primaryBranch, setPrimaryBranch] = useState("Aesthetic Pondok Indah Main Branch");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Right Column: Estimasi Waktu & Jadwal Praktek
  const [consultationDuration, setConsultationDuration] = useState("30");
  const [consultationFee, setConsultationFee] = useState(250000);
  const [weeklySchedules, setWeeklySchedules] = useState<Record<string, { active: boolean; start: string; end: string }>>({
    Senin: { active: true, start: "10:00", end: "18:00" },
    Selasa: { active: true, start: "10:00", end: "18:00" },
    Rabu: { active: true, start: "10:00", end: "18:00" },
    Kamis: { active: true, start: "10:00", end: "18:00" },
    Jumat: { active: true, start: "10:00", end: "18:00" },
    Sabtu: { active: true, start: "10:00", end: "18:00" },
    Minggu: { active: false, start: "10:00", end: "15:00" },
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

      // Parse name into prefix / body / suffix if possible
      const rawName: string = doctor.name || "";
      let pref = "drg.";
      let body = rawName;
      let suff = "";

      if (rawName.startsWith("drg. ")) {
        pref = "drg.";
        body = rawName.substring(5);
      } else if (rawName.startsWith("dr. ")) {
        pref = "dr.";
        body = rawName.substring(4);
      } else if (rawName.startsWith("Prof. drg. ")) {
        pref = "Prof. drg.";
        body = rawName.substring(11);
      }

      const commaIdx = body.indexOf(",");
      if (commaIdx !== -1) {
        suff = body.substring(commaIdx + 1).trim();
        body = body.substring(0, commaIdx).trim();
      }

      setTitlePrefix(pref);
      setNameWithoutTitle(body);
      setTitleSuffix(suff);
      setBirthDate(doctor.birth_date || doctor.birthDate || "");
      setGender(doctor.gender || "Laki-laki");
      setPhone(doctor.phone || doctor.whatsapp || "");
      setEmail(doctor.email || "");
      setKtpNumber(doctor.ktp_number || doctor.ktp || "");
      setIhsId(doctor.ihs_id || doctor.ihsId || "");
      setAvatarUrl(doctor.avatar_url || doctor.avatar || doctor.photo || doctor.photo_url || "");

      setStrInstitution(doctor.str_institution || STR_INSTITUTIONS[0]);
      setStrNumber(doctor.str || doctor.str_number || doctor.strNumber || "");
      setStrExpiry(doctor.str_expiry || "2029-12-31");
      setStrLifetime(doctor.str_lifetime !== undefined ? Boolean(doctor.str_lifetime) : true);

      setSipInstitution(doctor.sip_institution || SIP_INSTITUTIONS[0]);
      setSipNumber(doctor.sip || doctor.sip_number || doctor.sipNumber || "");
      setSipExpiry(doctor.sip_expiry || "2027-07-02");

      setSpecialization(doctor.specialization || doctor.speciality || SPECIALIZATION_OPTIONS[0]);
      setSubspecialist(doctor.subspecialist || "");
      setEducation(doctor.education || "Universitas Indonesia");
      setExperienceYears(doctor.experience_years ?? doctor.experienceYears ?? 5);
      setPrimaryBranch(doctor.primary_branch || doctor.primaryBranch || "Aesthetic Pondok Indah Main Branch");
      setConsultationDuration(String(doctor.consultation_duration || doctor.consultationDuration || "30"));
      setConsultationFee(doctor.consultation_fee ?? doctor.consultationFee ?? 250000);
      setIsActive(activeState);
      setPassword("");
      setConfirmPassword("");
    } else {
      setTitlePrefix("drg.");
      setNameWithoutTitle("");
      setTitleSuffix("");
      setBirthDate("");
      setGender("Laki-laki");
      setPhone("");
      setEmail("");
      setKtpNumber("");
      setIhsId("");
      setAvatarUrl("");
      setStrInstitution(STR_INSTITUTIONS[0]);
      setStrNumber("");
      setStrExpiry("2029-12-31");
      setStrLifetime(true);
      setSipInstitution(SIP_INSTITUTIONS[0]);
      setSipNumber("");
      setSipExpiry("2027-07-02");
      setJobCategory("Dokter Gigi");
      setSpecialization(SPECIALIZATION_OPTIONS[0]);
      setSubspecialist("");
      setEducation("Universitas Indonesia");
      setExperienceYears(5);
      setPrimaryBranch("Aesthetic Pondok Indah Main Branch");
      setConsultationDuration("30");
      setConsultationFee(250000);
      setIsActive(true);
      setPassword("");
      setConfirmPassword("");
    }
  }, [doctor, open]);

  const handleApplyAllSchedule = () => {
    const monday = weeklySchedules.Senin || { active: true, start: "10:00", end: "18:00" };
    const updated: typeof weeklySchedules = {};
    DAYS_OF_WEEK.forEach((d) => {
      updated[d.key] = { active: true, start: monday.start, end: monday.end };
    });
    setWeeklySchedules(updated);
    toast.success("Jadwal hari Senin berhasil disalin ke seluruh hari");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameWithoutTitle.trim()) {
      toast.error("Nama lengkap dokter wajib diisi");
      return;
    }
    if (!isEdit && !email.trim()) {
      toast.error("Alamat email dokter wajib diisi");
      return;
    }
    if (!isEdit && !password) {
      toast.error("Password akun login dokter wajib diisi");
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    const fullName = `${titlePrefix ? titlePrefix + " " : ""}${nameWithoutTitle.trim()}${
      titleSuffix ? ", " + titleSuffix.trim() : ""
    }`;

    setSaving(true);
    try {
      await onSave({
        ...doctor,
        id: doctor?.id,
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        password: password || undefined,
        birth_date: birthDate || null,
        gender,
        ktp_number: ktpNumber || null,
        ihs_id: ihsId || null,
        avatar_url: avatarUrl || null,
        avatar: avatarUrl || null,
        specialization,
        speciality: specialization,
        subspecialist: subspecialist || null,
        job_category: jobCategory,
        str: strNumber,
        str_number: strNumber,
        strNumber: strNumber,
        str_institution: strInstitution,
        str_expiry: strExpiry,
        str_lifetime: strLifetime,
        sip: sipNumber,
        sip_number: sipNumber,
        sipNumber: sipNumber,
        sip_institution: sipInstitution,
        sip_expiry: sipExpiry,
        education,
        experience_years: Number(experienceYears),
        experienceYears: Number(experienceYears),
        primary_branch: primaryBranch,
        primaryBranch: primaryBranch,
        title_prefix: titlePrefix || null,
        title_suffix: titleSuffix || null,
        consultation_duration: Number(consultationDuration),
        consultation_fee: Number(consultationFee),
        consultationFee: Number(consultationFee),
        weekly_schedules: weeklySchedules,
        is_active: isActive,
        status: isActive ? "active" : "inactive",
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan akun dokter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[90vw] max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E8DFC8]/80 bg-[#FDFAF3] shadow-2xl z-[150] sm:ml-10 md:ml-12"
      >
        {/* Header bergaya Warm Gold & Brand Charcoal AESPI */}
        <div className="px-7 py-4.5 bg-white/90 border-b border-[#E8DFC8]/70 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26] tracking-tight">
              {isEdit ? "Edit Tenaga Medis" : "Tambah Tenaga Medis Baru"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-full border border-[#DDD4C0] hover:bg-[#FAF5EA] flex items-center justify-center text-[#8A7C6D] hover:text-[#2D2A26] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - 2 Kolom Layout (Kiri: Identitas & STR/SIP, Kanan: Jadwal Praktek) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-7 overflow-y-auto flex-1 min-h-0 space-y-7 bg-[#FDFAF3]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* ======================================================== */}
              {/* KOLOM KIRI (7/12): FOTO PROFIL, DATA PRIBADI, STR & SIP */}
              {/* ======================================================== */}
              <div className="lg:col-span-7 space-y-5">
                {/* Bagian Atas: Foto Profil di Kiri + Form Identitas di Kanan */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                  {/* Foto Profil & Tombol Upload */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-full aspect-[3/4] max-w-[180px] rounded-xl border-2 border-dashed border-[#DDD4C0] bg-white overflow-hidden relative group flex items-center justify-center shadow-xs">
                      {avatarUrl ? (
                        <img
                          src={getStorageUrl(avatarUrl) || avatarUrl}
                          alt="Foto Profil Dokter"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#A89D8F] p-4 text-center">
                          <User className="w-12 h-12 stroke-[1.2] mb-1 text-[#C4BAA9]" />
                          <span className="text-[11px] font-medium">Belum ada foto</span>
                        </div>
                      )}
                    </div>

                    <label className="mt-2.5 w-full max-w-[180px] h-8 rounded-lg border border-[#C9A24A] bg-[#FAF4E8] text-[#8C6B1C] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer hover:bg-[#F3E6CA] transition active:scale-[0.98]">
                      Upload Photo Profile
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setAvatarUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="mt-1 text-[11px] text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Foto
                      </button>
                    )}
                  </div>

                  {/* Form Data Personal */}
                  <div className="sm:col-span-8 space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Nama Lengkap (Tanpa Gelar) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nameWithoutTitle}
                        onChange={(e) => setNameWithoutTitle(e.target.value)}
                        placeholder="M. Ryan Maulana Jusuf"
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Nomor HP / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="082283391121"
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required={!isEdit}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ryanjusuf813@gmail.com"
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Nomor KTP (NIK)
                        </label>
                        <input
                          type="text"
                          value={ktpNumber}
                          onChange={(e) => setKtpNumber(e.target.value)}
                          placeholder="1306090207970001"
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Satu Sehat IHS ID
                        </label>
                        <input
                          type="text"
                          value={ihsId}
                          onChange={(e) => setIhsId(e.target.value)}
                          placeholder="12874694954"
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E8DFC8]/60 pt-4 space-y-4">
                  {/* STR Section */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-bold text-[#8C6B1C] block mb-1 uppercase tracking-wider">
                        Lembaga Registrasi (STR)
                      </label>
                      <select
                        value={strInstitution}
                        onChange={(e) => setStrInstitution(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      >
                        {STR_INSTITUTIONS.map((inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Nomor Registrasi (Nomor STR) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={strNumber}
                          onChange={(e) => setStrNumber(e.target.value)}
                          placeholder="1312100122260875"
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A453E] block">
                          Masa Berlaku STR
                        </label>
                        <input
                          type="date"
                          value={strExpiry}
                          disabled={strLifetime}
                          onChange={(e) => setStrExpiry(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A] disabled:bg-[#F5F0E6] disabled:text-[#8A7C6D]"
                        />
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A453E] select-none">
                          <input
                            type="checkbox"
                            checked={strLifetime}
                            onChange={(e) => setStrLifetime(e.target.checked)}
                            className="w-4 h-4 rounded border-[#DDD4C0] text-[#C9A24A] focus:ring-[#C9A24A]"
                          />
                          <span>Aktif Selamanya (Seumur Hidup)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SIP Section */}
                  <div className="space-y-2.5 pt-2 border-t border-[#E8DFC8]/40">
                    <div>
                      <label className="text-xs font-bold text-[#8C6B1C] block mb-1 uppercase tracking-wider">
                        Lembaga Registrasi (SIP)
                      </label>
                      <select
                        value={sipInstitution}
                        onChange={(e) => setSipInstitution(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      >
                        {SIP_INSTITUTIONS.map((inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Nomor Registrasi (Nomor SIP) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sipNumber}
                          onChange={(e) => setSipNumber(e.target.value)}
                          placeholder="4/B.15c/31.74.05.1002.26.R-2.d/4/TM.09.74/"
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Masa Berlaku SIP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={sipExpiry}
                          onChange={(e) => setSipExpiry(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gelar Depan, Gelar Belakang & Spesialis */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#E8DFC8]/40">
                    <div className="sm:col-span-4">
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Gelar Depan
                      </label>
                      <select
                        value={titlePrefix}
                        onChange={(e) => setTitlePrefix(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      >
                        {TITLE_PREFIX_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t || "-- Tanpa Gelar --"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-8">
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Gelar Belakang
                      </label>
                      <input
                        type="text"
                        value={titleSuffix}
                        onChange={(e) => setTitleSuffix(e.target.value)}
                        placeholder="cth: Sp.KG, Subsp.I.DM.(K)"
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Job Medis <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jobCategory}
                        onChange={(e) => setJobCategory(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      >
                        <option value="Dokter Gigi">Dokter Gigi</option>
                        <option value="Dokter Spesialis">Dokter Spesialis</option>
                        <option value="Perawat Dental">Perawat Dental</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Specialist <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      >
                        {SPECIALIZATION_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Subspecialist
                      </label>
                      <input
                        type="text"
                        value={subspecialist}
                        onChange={(e) => setSubspecialist(e.target.value)}
                        placeholder="cth: Implantologi"
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      />
                    </div>
                  </div>

                  {/* Kredensial Password Dokter */}
                  <div className="pt-2 border-t border-[#E8DFC8]/40 space-y-3">
                    <label className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider block">
                      Kredensial Akun Login Dokter
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          {isEdit ? "Password Baru (Opsional)" : "Password Login Dokter *"}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isEdit ? "Kosongkan jika tak diubah" : "Minimal 8 karakter"}
                            className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                          Konfirmasi Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password"
                            className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#DDD4C0] bg-white text-xs font-medium text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* KOLOM KANAN (5/12): ESTIMASI WAKTU & JADWAL PRAKTEK */}
              {/* ======================================================== */}
              <div className="lg:col-span-5 space-y-6">
                {/* Estimasi Waktu */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#8C6B1C] uppercase tracking-wider">Estimasi Waktu & Tarif</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Estimasi Lama Waktu Konsultasi
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={consultationDuration}
                          onChange={(e) => setConsultationDuration(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                        />
                        <span className="text-xs font-medium text-[#7A756D] shrink-0">Menit</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                        Biaya Konsultasi (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Jadwal Praktek Mingguan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#8C6B1C] uppercase tracking-wider">Jadwal Praktek</h3>
                    <button
                      type="button"
                      onClick={handleApplyAllSchedule}
                      className="px-3 h-8 rounded-lg border border-[#C9A24A] bg-[#FAF4E8] text-[#8C6B1C] hover:bg-[#F3E6CA] text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98]"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Atur Semua</span>
                    </button>
                  </div>

                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#DDD4C0]/70 shadow-xs">
                    {DAYS_OF_WEEK.map((day) => {
                      const item = weeklySchedules[day.key] || { active: false, start: "10:00", end: "18:00" };
                      return (
                        <div
                          key={day.key}
                          className="flex items-center justify-between gap-2 py-1.5 border-b border-[#F4EFE6] last:border-0"
                        >
                          <div className="flex items-center gap-2 w-20">
                            <span className="text-xs font-semibold text-[#2D2A26]">{day.label}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setWeeklySchedules((prev) => ({
                                ...prev,
                                [day.key]: { ...item, active: !item.active },
                              }));
                            }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition shrink-0 ${
                              item.active
                                ? "bg-[#C9A24A] text-white"
                                : "bg-[#FAF8F5] text-[#A89D8F] hover:bg-[#F3EDE2] border border-[#DDD4C0]"
                            }`}
                            title={item.active ? "Hari Aktif" : "Hari Libur / Nonaktif"}
                          >
                            {item.active ? "✓" : "+"}
                          </button>

                          {item.active ? (
                            <div className="flex items-center gap-2 flex-1 justify-end">
                              <input
                                type="time"
                                value={item.start}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedules((prev) => ({
                                    ...prev,
                                    [day.key]: { ...item, start: val },
                                  }));
                                }}
                                className="h-8 px-2 rounded-md border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                              />
                              <span className="text-xs text-stone-400">-</span>
                              <input
                                type="time"
                                value={item.end}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedules((prev) => ({
                                    ...prev,
                                    [day.key]: { ...item, end: val },
                                  }));
                                }}
                                className="h-8 px-2 rounded-md border border-[#DDD4C0] bg-white text-xs text-[#2D2A26] outline-none focus:border-[#C9A24A]"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-[#A89D8F] italic flex-1 text-right pr-2">Libur Praktik</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Keaktifan Akun */}
                <div className="p-4 rounded-xl border border-[#DDD4C0]/70 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2D2A26]">Status Praktik Dokter</p>
                      <p className="text-[11px] text-[#8A7C6D]">
                        {isActive ? "Aktif menerima pasien di reservasi" : "Sedang nonaktif / cuti"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        isActive ? "bg-emerald-600" : "bg-[#DDD4C0]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-7 py-4 bg-white/90 border-t border-[#E8DFC8]/60 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-lg border-[#DDD4C0] text-[#4A453E] hover:bg-[#FAF5EA] text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-10 px-7 rounded-lg bg-[#C9A24A] hover:bg-[#B38D38] text-white text-xs font-semibold transition shadow-sm active:scale-[0.98]"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
