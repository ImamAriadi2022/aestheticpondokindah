import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { buildGuestBookingWhatsAppUrl, submitPublicReservation } from "@/features/guest/reservation/services/reservationApi";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";
import { API_BASE } from "@/core/api/apiConfig";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
  MessageCircle,
  ScrollText,
} from "lucide-react";
import { services as allServices } from "@/features/guest/services/pages/Services";

export default function BookingNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedDoctor = searchParams.get("doctor");
  const preselectedDate = searchParams.get("date");
  const preselectedSlot = searchParams.get("slot");
  const preselectedService = searchParams.get("service");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "Laki-laki",
    treatmentInterest: preselectedService || "Pembersihan Karang Gigi (Scaling)",
    doctorId: "",
    preferredDate: preselectedDate || today,
    preferredTime: preselectedSlot ? preselectedSlot.split("-")[0] : "10:00",
    note: preselectedDoctor
      ? `Jadwal Dokter: ${preselectedDoctor}${preselectedSlot ? ` (${preselectedSlot})` : ""}`
      : "",
  });

  const [doctors, setDoctors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Terms & Conditions
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<{ booking_terms?: string; booking_whatsapp_number?: string }>({});

  useEffect(() => {
    getPublicClinicSettings().then((s) => setClinicSettings(s)).catch(() => {});
  }, []);

  const waNumber = clinicSettings.booking_whatsapp_number || "6281990114949";

  useEffect(() => {
    fetch(`${API_BASE}/public/doctor-schedules`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
      })
      .catch(() => {});
  }, []);

  const selectedDoctorObj = form.doctorId
    ? doctors.find((d) => String(d.id || d.doctorId || d._id) === String(form.doctorId))
    : null;

  const scheduleStatus = (() => {
    if (!selectedDoctorObj) return { available: true, message: "Jadwal tersedia" };

    if (selectedDoctorObj.timeRange && typeof selectedDoctorObj.timeRange === "string") {
      const parts = selectedDoctorObj.timeRange.split("-").map((t: string) => t.trim().replace(/WIB/i, "").trim());
      if (parts.length === 2) {
        const startTime = parts[0];
        const endTime = parts[1];
        const currentTime = form.preferredTime || "10:00";
        if (currentTime < startTime || currentTime > endTime) {
          return {
            available: false,
            message: `Dokter ${selectedDoctorObj.doctorName || ""} hanya berpraktik pukul ${selectedDoctorObj.timeRange}. Jam ${currentTime} WIB berada di luar jam praktik.`,
          };
        }
      }
    }

    if (selectedDoctorObj.date && /^\d{4}-\d{2}-\d{2}$/.test(selectedDoctorObj.date)) {
      if (selectedDoctorObj.date !== form.preferredDate) {
        return {
          available: false,
          message: `Dokter ${selectedDoctorObj.doctorName || ""} hanya berpraktik pada tanggal ${selectedDoctorObj.displayDate || selectedDoctorObj.date}.`,
        };
      }
    }

    return { available: true, message: "Jadwal dokter tersedia." };
  })();

  const validate = () => {
    if (!form.patientName || form.patientName.trim().length < 2) return "Nama pasien minimal 2 karakter.";
    if (!form.phone || !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) return "Format nomor WhatsApp/Telepon tidak valid.";
    if (!form.preferredDate) return "Tanggal reservasi wajib diisi.";
    if (form.preferredDate < today) return "Tanggal reservasi tidak boleh di masa lalu.";
    if (!scheduleStatus.available) return scheduleStatus.message;
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const apiRes = await submitPublicReservation({
        name: form.patientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        birth_date: form.birthDate || undefined,
        gender: form.gender,
        treatment_interest: form.treatmentInterest,
        doctor_id: form.doctorId || undefined,
        date: form.preferredDate,
        preferred_time: form.preferredTime,
        complaint: form.note || form.treatmentInterest,
        source: "guest_web",
      });

      if (apiRes) {
        setSuccessResult(apiRes);
        window.location.assign(buildGuestBookingWhatsAppUrl({
          name: form.patientName.trim(),
          phone: form.phone.trim(),
          complaint: form.note || form.treatmentInterest,
          date: form.preferredDate,
          waNumber,
        }));
      } else {
        setError("Gagal mengirim permintaan reservasi. Silakan periksa koneksi Anda.");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat memproses reservasi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const bookingTerms = clinicSettings.booking_terms ||
    "1. Reservasi ini bersifat permintaan, bukan konfirmasi pasti.\n2. Harap datang 10 menit sebelum jadwal.\n3. Data Anda hanya digunakan untuk keperluan layanan medis.";

  const termsList = bookingTerms.split("\n").filter((t) => t.trim());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-5 rounded-t-3xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#c9a24a]/20 border border-[#c9a24a]/40 flex items-center justify-center">
                  <ScrollText className="w-5 h-5 text-[#c9a24a]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Syarat & Ketentuan Reservasi</h3>
                  <p className="text-[11px] text-[#d4c5b0]">Baca dan setujui sebelum melanjutkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* T&C Content */}
            <div className="overflow-y-auto flex-1 p-5">
              <ul className="space-y-3">
                {termsList.map((term, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300/60 text-[#c9a24a] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{term.replace(/^\d+\.\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accept Checkbox & Action */}
            <div className="p-5 border-t border-gray-100 space-y-4 shrink-0">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    termsAccepted
                      ? "bg-[#c9a24a] border-[#c9a24a]"
                      : "border-gray-300 bg-white group-hover:border-[#c9a24a]/60"
                  }`}>
                    {termsAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-xs text-gray-700 leading-relaxed">
                  Saya telah membaca dan <strong className="text-gray-900">menyetujui</strong> seluruh syarat dan ketentuan reservasi Aesthetic Pondok Indah Dental Clinic.
                </span>
              </label>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTermsModal(false)}
                  className="flex-1 h-11 rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  disabled={!termsAccepted}
                  onClick={() => {
                    setShowTermsModal(false);
                    // Trigger actual form submission if terms accepted
                    const formEl = document.getElementById("guest-booking-form") as HTMLFormElement | null;
                    if (formEl) formEl.requestSubmit();
                  }}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all ${
                    termsAccepted
                      ? "bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white shadow-md cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Setuju & Lanjutkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="py-10 sm:py-14 container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {successResult ? (
            /* SUCCESS CONFIRMATION & REGISTRATION ENCOURAGEMENT CARD */
            <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-8 text-white text-center space-y-3 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="px-3.5 py-1 bg-[#c9a24a] text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                  {successResult.code || "RSV-SUCCESS"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Permintaan Reservasi Berhasil Dibuat!
                </h2>
                <p className="text-xs text-[#d4c5b0] max-w-md mx-auto">
                  Terima kasih <span className="font-bold text-white">{successResult.name}</span>. Permintaan Anda telah kami terima dan sedang ditinjau oleh staf admin klinik kami.
                </p>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Summary Details */}
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-3 text-xs">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-amber-200/60 pb-2">
                    Detail Jadwal Permintaan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-gray-500">Perawatan:</span>{" "}
                      <span className="font-bold text-gray-900">{successResult.treatment_interest}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>{" "}
                      <span className="font-bold text-gray-900">{successResult.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Waktu:</span>{" "}
                      <span className="font-bold text-[#c9a24a]">{successResult.preferred_time} WIB</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className="font-bold text-amber-700">Menunggu Konfirmasi Admin</span>
                    </div>
                  </div>
                </div>

                {/* Membership Encouragement Box */}
                <div className="bg-gradient-to-br from-[#1a1612] to-[#2a2319] text-white p-6 rounded-2xl border border-[#c9a24a]/40 shadow-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/20 text-[#e8c547] flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        Gabung Membership & Kumpulkan Poin!
                      </h4>
                      <p className="text-xs text-[#d4c5b0] mt-1 leading-relaxed">
                        Buat akun gratis sekarang untuk melacak status reservasi real-time, mendapatkan poin diskon perawatan, dan menyimpan rekam medis digital Anda secara aman.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#d4c5b0] pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#e8c547]" />
                      <span>Rekam Medis Digital</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e8c547]" />
                      <span>Bonus 100 Poin Awal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#e8c547]" />
                      <span>Prioritas Jadwal Periksa</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    {/* WhatsApp CTA - shown after success */}
                    <a
                      href={buildWAMessage(form, successResult)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 text-xs shadow-md flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Konfirmasi via WhatsApp Admin
                      </Button>
                    </a>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Link to="/login?mode=register" className="w-full sm:flex-1">
                        <Button className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-bold rounded-xl h-11 text-xs shadow-md">
                          Daftar Akun Sekarang <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>

                      <Link to="/" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full rounded-xl h-11 text-xs border-white/20 text-white hover:bg-white/10">
                          Kembali Ke Beranda
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* GUEST RESERVATION FORM */
            <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-8 text-white space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a24a]/20 text-[#e8c547] text-xs font-semibold border border-[#c9a24a]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Guest Reservation Form</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Formulir Reservasi Pasien
                </h1>
                <p className="text-xs text-[#d4c5b0]">
                  Lengkapi informasi kontak dan jadwal yang Anda inginkan. Admin klinik akan mengonfirmasi ketersediaan slot Anda.
                </p>
              </div>

              <CardContent className="p-6 sm:p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <form id="guest-booking-form" onSubmit={onSubmit} className="space-y-6">
                  {/* Section 1: Data Pasien Guest */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a24a] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Data Diri Pasien (Guest)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">Nama Lengkap Pasien *</Label>
                        <Input
                          value={form.patientName}
                          onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                          placeholder="mis. Budi Santoso"
                          required
                          className="rounded-xl border-gray-200 text-xs h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">Nomor WhatsApp / Telepon *</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="mis. 081234567890"
                          required
                          className="rounded-xl border-gray-200 text-xs h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Alamat Email (Opsional)</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="budi@example.com"
                          className="rounded-xl border-gray-200 text-xs h-11"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-gray-700">Jenis Kelamin</Label>
                          <Select
                            value={form.gender}
                            onValueChange={(val) => setForm({ ...form, gender: val })}
                          >
                            <SelectTrigger className="rounded-xl border-gray-200 text-xs h-11">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                              <SelectItem value="Perempuan">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-gray-700">Tanggal Lahir</Label>
                          <Input
                            type="date"
                            value={form.birthDate}
                            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                            className="rounded-xl border-gray-200 text-xs h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Pemilihan Perawatan & Dokter */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a24a] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" />
                      Layanan & Dokter Spesialis
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">Layanan Perawatan *</Label>
                        <Select
                          value={form.treatmentInterest}
                          onValueChange={(val) => setForm({ ...form, treatmentInterest: val })}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 text-xs h-11">
                            <SelectValue placeholder="Pilih Layanan" />
                          </SelectTrigger>
                          <SelectContent>
                            {allServices.map((s) => (
                              <SelectItem key={s.id} value={s.title}>
                                {s.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700">Dokter Spesialis (Opsional)</Label>
                        <Select
                          value={form.doctorId}
                          onValueChange={(val) => setForm({ ...form, doctorId: val })}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 text-xs h-11">
                            <SelectValue placeholder="Pilih Dokter (Opsional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((d: any) => (
                              <SelectItem key={d.id || d._id} value={String(d.id || d._id)}>
                                {d.doctorName || d.name || "Dokter Spesialis"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Tanggal & Jam Periksa */}
                  <div className="space-y-5 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a24a] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Jadwal Periksa Yang Diinginkan
                    </h3>

                    {/* Doctor Schedule Status Card if doctor is selected */}
                    {selectedDoctorObj && (
                      <div className={`p-3.5 rounded-xl border text-xs transition-all ${
                        scheduleStatus.available
                          ? "bg-amber-50/60 border-amber-200/80 text-gray-800"
                          : "bg-rose-50/80 border-rose-200 text-rose-800"
                      }`}>
                        <div className="flex items-center justify-between font-semibold">
                          <span>
                            Dokter: <strong className="text-[#c9a24a]">{selectedDoctorObj.doctorName || "Dokter"}</strong> ({selectedDoctorObj.timeRange || "09:00 - 17:00 WIB"})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            scheduleStatus.available
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                              : "bg-rose-100 text-rose-800 border border-rose-300/60"
                          }`}>
                            {scheduleStatus.available ? "Tersedia" : "Tidak Ada Praktik"}
                          </span>
                        </div>
                        {!scheduleStatus.available && (
                          <p className="text-[11px] font-semibold text-rose-700 mt-1.5 pt-1.5 border-t border-rose-200">
                            ⚠️ {scheduleStatus.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Pick Tanggal (Calendar) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-[#c9a24a]" />
                          Tanggal Periksa *
                        </Label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a24a] pointer-events-none" />
                          <Input
                            type="date"
                            min={today}
                            value={form.preferredDate}
                            onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                            required
                            className="pl-9 pr-3 rounded-xl border-gray-200 text-xs h-11 bg-white focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a]/20 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* 2. Pick Jam (Manual Time Picker) */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#c9a24a]" />
                          Jam Periksa (Time Picker) *
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a24a] pointer-events-none" />
                          <Input
                            type="time"
                            value={form.preferredTime}
                            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                            required
                            className={`pl-9 pr-3 rounded-xl text-xs h-11 bg-white cursor-pointer font-bold ${
                              scheduleStatus.available
                                ? "border-gray-200 focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a]/20"
                                : "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold text-gray-700">Catatan / Keluhan Pasien (Opsional)</Label>
                      <textarea
                        rows={3}
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        placeholder="Tuliskan keluhan atau instruksi khusus untuk dokter/perawat..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#c9a24a] text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Notice */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <ScrollText className="w-4 h-4 text-[#c9a24a] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Dengan melanjutkan, Anda wajib membaca dan menyetujui{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="font-bold text-[#c9a24a] underline underline-offset-2 hover:text-[#a8843a] cursor-pointer"
                      >
                        Syarat & Ketentuan Reservasi
                      </button>{" "}
                      Aesthetic Pondok Indah Dental Clinic.
                    </p>
                  </div>

                  {/* Submit Button - opens T&C modal first */}
                  <Button
                    type="button"
                    disabled={submitting || !scheduleStatus.available}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!scheduleStatus.available) return;
                      // Validate form first before showing T&C
                      const v = (() => {
                        if (!form.patientName || form.patientName.trim().length < 2) return "Nama pasien minimal 2 karakter.";
                        if (!form.phone || !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) return "Format nomor WhatsApp/Telepon tidak valid.";
                        if (!form.preferredDate) return "Tanggal reservasi wajib diisi.";
                        return null;
                      })();
                      if (v) { setError(v); return; }
                      setError(null);
                      setTermsAccepted(false);
                      setShowTermsModal(true);
                    }}
                    className={`w-full font-bold rounded-xl h-12 text-sm transition-all ${
                      scheduleStatus.available
                        ? "bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white shadow-md cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {submitting
                      ? "Memproses Reservasi Guest..."
                      : !scheduleStatus.available
                      ? "Pilih Tanggal/Jam Sesuai Jadwal Dokter"
                      : "Lanjutkan & Baca Syarat Ketentuan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
