import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { submitPublicReservation } from "@/features/reservation/services/reservationApi";
import { API_BASE } from "@/shared/lib/apiConfig";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { services as allServices } from "@/features/marketing/pages/Services";

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

  useEffect(() => {
    fetch(`${API_BASE}/public/doctor-schedules`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    if (!form.patientName || form.patientName.trim().length < 2) return "Nama pasien minimal 2 karakter.";
    if (!form.phone || !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) return "Format nomor WhatsApp/Telepon tidak valid.";
    if (!form.preferredDate) return "Tanggal reservasi wajib diisi.";
    if (form.preferredDate < today) return "Tanggal reservasi tidak boleh di masa lalu.";
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
      } else {
        setError("Gagal mengirim permintaan reservasi. Silakan periksa koneksi Anda.");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat memproses reservasi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

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

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link to="/login?mode=register" className="w-full sm:w-auto flex-1">
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

                <form onSubmit={onSubmit} className="space-y-6">
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

                  {/* Section 3: Tanggal & Waktu */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a24a] border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Jadwal Periksa Yang Diinginkan
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">Tanggal Periksa *</Label>
                        <Input
                          type="date"
                          min={today}
                          value={form.preferredDate}
                          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                          required
                          className="rounded-xl border-gray-200 text-xs h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700">Jam Periksa *</Label>
                        <Select
                          value={form.preferredTime}
                          onValueChange={(val) => setForm({ ...form, preferredTime: val })}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 text-xs h-11">
                            <SelectValue placeholder="Pilih Jam" />
                          </SelectTrigger>
                          <SelectContent>
                            {["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"].map((t) => (
                              <SelectItem key={t} value={t}>
                                {t} WIB
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
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

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-bold rounded-xl h-12 text-sm shadow-md transition-all"
                  >
                    {submitting ? "Memproses Reservasi Guest..." : "Kirim Permintaan Reservasi Guest"}
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
