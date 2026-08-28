import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/toast";
import {
  MessageSquareText,
  Clock,
  Sparkles,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  History,
  UserCheck,
} from "lucide-react";
import { createGuestConsultation } from "../services/guestConsultationApi";
import { useGuestSession } from "../services/GuestSessionContext";
import { getSession } from "@/core/auth/services/session";

const SYMPTOMS_OPTIONS = [
  "Sakit Gigi / Nyeri Berdenyut",
  "Gigi Ngilu / Sensitif Dingin & Panas",
  "Gusi Berdarah / Radang Gusi",
  "Gusi Bengkak / Abses",
  "Gigi Berlubang (Karies)",
  "Gigi Patah / Retak",
  "Gigi Goyang / Longgar",
  "Gigi Kuning / Noda (Pemutihan / Bleaching)",
  "Pemasangan / Kontrol Kawat Gigi (Behel)",
  "Bau Mulut & Karang Gigi (Pembersihan / Scaling)",
  "Pencabutan / Masalah Gigi Bungsu",
  "Keluhan Gigi Lainnya",
];

const PAIN_SCALE_OPTIONS = [
  { value: 0, label: "0 - Tidak Nyeri (Pemeriksaan / Estetika / Scaling)" },
  { value: 1, label: "1 - Sangat Ringan (Hampir tidak terasa)" },
  { value: 2, label: "2 - Ringan (Terasa sesekali saat ditekan)" },
  { value: 3, label: "3 - Ringan (Mulai terasa sedikit mengganggu)" },
  { value: 4, label: "4 - Sedang (Terasa ngilu saat makan / minum)" },
  { value: 5, label: "5 - Sedang (Nyeri berdenyut sedang)" },
  { value: 6, label: "6 - Sedang Menuju Berat (Nyeri sering kambuh)" },
  { value: 7, label: "7 - Berat (Mengganggu konsentrasi & makan)" },
  { value: 8, label: "8 - Sangat Berat (Nyeri intens dan konstan)" },
  { value: 9, label: "9 - Amat Berat (Nyeri hebat sulit tertahankan)" },
  { value: 10, label: "10 - Nyeri Ekstrem / Darurat Medis" },
];

export default function GuestKonsultasiPage() {
  const navigate = useNavigate();
  const { addRef, refs } = useGuestSession();
  const authSession = getSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [painScale, setPainScale] = useState<string>("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from active auth session if user is logged in
  useEffect(() => {
    if (authSession) {
      if (authSession.name) setName(authSession.name);
      if (authSession.whatsapp || authSession.phone) {
        setPhone(authSession.whatsapp || authSession.phone || "");
      }
      if (authSession.email) setEmail(authSession.email);
    }
  }, [authSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = (name || authSession?.name || "").trim();
    const finalPhone = (phone || authSession?.whatsapp || authSession?.phone || "").trim();

    if (!finalName) {
      toast({
        title: "Nama Lengkap Wajib Diisi",
        message: "Silakan masukkan nama lengkap Anda untuk memulai konsultasi.",
        variant: "error",
      });
      return;
    }

    if (!finalPhone) {
      toast({
        title: "Nomor WhatsApp Wajib Diisi",
        message: "Silakan masukkan nomor WhatsApp aktif Anda agar tim medis dapat merespons.",
        variant: "error",
      });
      return;
    }

    if (!selectedSymptom) {
      toast({
        title: "Pilih Gejala",
        message: "Silakan pilih gejala yang Anda rasakan dari dropdown.",
        variant: "error",
      });
      return;
    }

    if (!complaintDetails.trim()) {
      toast({
        title: "Isi Detail Keluhan",
        message: "Silakan ceritakan sedikit detail tentang keluhan gigi Anda.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPain = painScale !== "" ? parseInt(painScale, 10) : undefined;
      const { consultation, token } = await createGuestConsultation({
        name: finalName,
        phone: finalPhone,
        email: email.trim() || undefined,
        topic: selectedSymptom,
        chiefComplaint: complaintDetails.trim(),
        painScale: parsedPain,
        preferredContact: "whatsapp",
        contactNumber: finalPhone,
      });

      addRef({
        token,
        name: finalName,
        phone: finalPhone,
        topic: consultation.topic || selectedSymptom,
        status: consultation.status || "Menunggu",
      });

      toast({
        title: "Konsultasi Terkirim",
        message: "Membuka ruang live chat dengan tim medis...",
        variant: "success",
      });

      // Navigate directly into the live chat UI
      navigate(`/konsultasi/guest/${token}`);
    } catch (err: any) {
      toast({
        title: "Gagal Mengirim Konsultasi",
        message: err?.message || "Terjadi kendala saat mengirim konsultasi. Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF8] to-[#F5EFE6] flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Top Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] text-xs font-bold shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
            Layanan Konsultasi Medis Online Gratis
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#2C2416] tracking-tight">
            Konsultasi Dokter Gigi Online
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5C5546] max-w-xl mx-auto leading-relaxed">
            Ceritakan keluhan yang Anda rasakan untuk mendapatkan asesmen awal dan panduan langsung dari tim dokter gigi kami.
          </p>
        </div>

        {/* 1-Page Consultation Form Card */}
        <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#F0EAE1] bg-gradient-to-r from-[#FAF8F5] to-[#FAF5EA] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white shadow-2xs">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#2C2416]">
                  Formulir Konsultasi & Keluhan
                </h2>
                <p className="text-[11px] text-[#8C8272]">
                  Lengkapi data di bawah ini untuk langsung terhubung ke ruang Live Chat
                </p>
              </div>
            </div>

            {refs.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/konsultasi/lanjut")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#8C6B1C] bg-white border border-[#EADBBD] hover:bg-[#FAF5EA] transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                Riwayat Sesi ({refs.length})
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Identity fields (Only if not logged in, or displayed as verified badge if logged in) */}
            {authSession ? (
              <div className="p-3.5 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#C9A24A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-[#2C2416] truncate">
                      Konsultasi sebagai: {authSession.name || "Pasien Terdaftar"}
                    </p>
                    <p className="text-[11px] text-[#8C6B1C] truncate">
                      {authSession.whatsapp || authSession.phone || authSession.email || "Akun Terverifikasi"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  ✓ Akun Aktif
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C2416] mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="h-11 rounded-xl border-[#D9D0BC] bg-[#FAF8F5] focus:bg-white text-xs font-medium text-[#2C2416] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2416] mb-1.5">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-[#8C6B1C] select-none">
                      🇮🇩 +62
                    </span>
                    <Input
                      value={phone.startsWith("+62") ? phone.slice(3) : phone.startsWith("0") ? phone.slice(1) : phone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPhone(raw.startsWith("0") ? raw.slice(1) : raw);
                      }}
                      placeholder="812-3456-7890"
                      inputMode="tel"
                      className="h-11 pl-18 rounded-xl border-[#D9D0BC] bg-[#FAF8F5] focus:bg-white text-xs font-medium text-[#2C2416] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown 1: Gejala yang dirasakan */}
            <div>
              <label htmlFor="symptom-select" className="block text-xs font-bold text-[#2C2416] mb-1.5">
                Gejala yang Dirasakan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="symptom-select"
                  value={selectedSymptom}
                  onChange={(e) => setSelectedSymptom(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#D9D0BC] bg-[#FAF8F5] focus:bg-white text-xs font-semibold text-[#2C2416] outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Gejala yang Dirasakan --</option>
                  {SYMPTOMS_OPTIONS.map((sym) => (
                    <option key={sym} value={sym}>
                      {sym}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8C6B1C]">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Dropdown 2: Tingkat Nyeri */}
            <div>
              <label htmlFor="pain-select" className="block text-xs font-bold text-[#2C2416] mb-1.5">
                Tingkat Nyeri (Skala 0 - 10)
              </label>
              <div className="relative">
                <select
                  id="pain-select"
                  value={painScale}
                  onChange={(e) => setPainScale(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#D9D0BC] bg-[#FAF8F5] focus:bg-white text-xs font-semibold text-[#2C2416] outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Tingkat Nyeri (Opsional) --</option>
                  {PAIN_SCALE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#8C6B1C]">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Textarea: Detail Keluhan */}
            <div>
              <label htmlFor="complaint-details" className="block text-xs font-bold text-[#2C2416] mb-1.5">
                Detail Keluhan <span className="text-rose-500">*</span>
              </label>
              <Textarea
                id="complaint-details"
                value={complaintDetails}
                onChange={(e) => setComplaintDetails(e.target.value)}
                placeholder="Ceritakan keluhan Anda secara spesifik (misal: gigi bagian mana yang sakit, sudah berapa hari dirasakan, apakah mengganggu saat mengunyah/tidur, dll)..."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-[#D9D0BC] bg-[#FAF8F5] focus:bg-white text-xs text-[#2C2416] placeholder:text-[#9E9485] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white font-bold text-sm rounded-xl shadow-md shadow-[#C9A24A]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghubungkan ke Ruang Chat...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Mulai Konsultasi & Buka Live Chat
                  </>
                )}
              </Button>
            </div>

            {/* Privacy & Trust Badge */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C8272] border-t border-[#F0EAE1]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Privasi data pasien terjamin dan dijaga kerahasiaannya.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
                <span>Respon cepat tim medis dalam 15-30 menit.</span>
              </div>
            </div>
          </form>
        </div>

        {/* Mobile History Link (if any saved) */}
        {refs.length > 0 && (
          <div className="sm:hidden text-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/konsultasi/lanjut")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#8C6B1C] bg-white border border-[#EADBBD] shadow-2xs cursor-pointer"
            >
              <History className="w-4 h-4" />
              Buka Sesi Konsultasi Sebelumnya ({refs.length})
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

