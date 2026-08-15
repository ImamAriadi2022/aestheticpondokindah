import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import {
  ChevronRight,
  ArrowLeft,
  Zap,
  MessageSquareText,
  ShieldCheck,
  Clock,
  Loader2,
  Frown,
  Meh,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { createGuestConsultation } from "../services/guestConsultationApi";
import { useGuestSession } from "../services/GuestSessionContext";

const symptoms = [
  { id: "sakit", label: "Sakit Gigi", icon: Frown, color: "bg-red-100 text-red-600" },
  { id: "ngilu", label: "Gigi Ngilu", icon: Meh, color: "bg-orange-100 text-orange-600" },
  { id: "berdarah", label: "Gusi Berdarah", icon: AlertCircle, color: "bg-rose-100 text-rose-600" },
  { id: "bengkak", label: "Gusi Bengkak", icon: AlertCircle, color: "bg-pink-100 text-pink-600" },
  { id: "patah", label: "Gigi Patah", icon: AlertCircle, color: "bg-purple-100 text-purple-600" },
  { id: "kuning", label: "Gigi Kuning", icon: AlertCircle, color: "bg-yellow-100 text-yellow-600" },
  { id: "karies", label: "Gigi Berlubang", icon: AlertCircle, color: "bg-blue-100 text-blue-600" },
  { id: "lainnya", label: "Lainnya", icon: Stethoscope, color: "bg-gray-100 text-gray-600" },
];

const painLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GuestKonsultasiPage() {
  const navigate = useNavigate();
  const { addRef } = useGuestSession();

  const [step, setStep] = useState<"landing" | "identity" | "complaint">("landing");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Lengkapi Data", message: "Nama dan nomor WhatsApp wajib diisi", variant: "error" });
      return;
    }
    if (selectedSymptoms.length === 0) {
      toast({ title: "Pilih Gejala", message: "Silakan pilih minimal 1 gejala", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { consultation, token } = await createGuestConsultation({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        topic: selectedSymptoms.map((id) => symptoms.find((s) => s.id === id)?.label).filter(Boolean).join(", ") || "Konsultasi",
        chiefComplaint: description.trim() || (selectedSymptoms.map((id) => symptoms.find((s) => s.id === id)?.label).filter(Boolean).join(", ") || "Keluhan gigi"),
        painScale: painLevel ?? undefined,
        preferredContact: "whatsapp",
        contactNumber: phone.trim(),
      });
      addRef({
        token,
        name: name.trim(),
        phone: phone.trim(),
        topic: consultation.topic || "Konsultasi",
        status: consultation.status || "Menunggu",
      });
      navigate(`/konsultasi/guest/${token}`);
    } catch (err) {
      toast({
        title: "Gagal",
        message: (err as Error)?.message || "Tidak bisa mengirim konsultasi. Coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepDots = ["landing", "identity", "complaint"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#F5E6C8]/40">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {/* Back */}
        <button
          onClick={() => {
            if (step === "identity") setStep("landing");
            else if (step === "complaint") setStep("identity");
            else navigate("/");
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8A7B6B] hover:text-[#4A3F35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "landing" ? "Kembali ke Beranda" : "Kembali"}
        </button>

        {/* Progress */}
        {step !== "landing" && (
          <div className="flex items-center gap-2 mb-8">
            {stepDots.map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all flex-1 ${
                  stepDots.indexOf(s) <= stepDots.indexOf(step) ? "bg-[#C9A24A]" : "bg-[#F0E6D3]"
                }`}
              />
            ))}
          </div>
        )}

        {step === "landing" && (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center shadow-lg shadow-[#C9A24A]/20 mb-6">
              <MessageSquareText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#4A3F35]">Konsultasi Online Gratis</h1>
            <p className="mt-3 text-base text-[#8A7B6B] max-w-lg mx-auto">
              Ceritakan keluhan gigi Anda secara langsung tanpa perlu datang ke klinik. Tim klinik akan
              merespons dalam 15–30 menit.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-[#B8943F]" />
                </div>
                <p className="text-sm font-bold text-[#4A3F35]">Respon Cepat</p>
                <p className="text-xs text-[#8A7B6B] mt-1">Estimasi respon 15–30 menit</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-[#B8943F]" />
                </div>
                <p className="text-sm font-bold text-[#4A3F35]">Tanpa Daftar</p>
                <p className="text-xs text-[#8A7B6B] mt-1">Cukup isi nama & nomor WhatsApp</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#B8943F]" />
                </div>
                <p className="text-sm font-bold text-[#4A3F35]">Data Aman</p>
                <p className="text-xs text-[#8A7B6B] mt-1">Informasi Anda dijaga kerahasiaannya</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => setStep("identity")}
                className="h-13 px-8 py-4 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20"
              >
                Mulai Konsultasi Sekarang
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/konsultasi/lanjut")}
                className="h-13 px-8 py-4 rounded-xl border-[#C9A24A]/50 text-[#8A6B2B] hover:bg-[#F5E6C8] font-semibold"
              >
                Lanjutkan Konsultasi Sebelumnya
              </Button>
            </div>
          </div>
        )}

        {step === "identity" && (
          <div className="bg-white rounded-3xl border border-[#F0E6D3] shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#4A3F35]">Data Diri</h2>
            <p className="text-sm text-[#8A7B6B] mt-1 mb-6">
              Diperlukan agar tim klinik dapat menghubungi Anda.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#4A3F35] block mb-1.5">
                  Nama Lengkap *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="h-12 rounded-xl border-[#E8D4A2] bg-[#FDF8F0] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4A3F35] block mb-1.5">
                  Nomor WhatsApp *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  inputMode="tel"
                  className="h-12 rounded-xl border-[#E8D4A2] bg-[#FDF8F0] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4A3F35] block mb-1.5">
                  Email (Opsional)
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@email.com"
                  inputMode="email"
                  className="h-12 rounded-xl border-[#E8D4A2] bg-[#FDF8F0] focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
                />
              </div>
              <Button
                onClick={() => setStep("complaint")}
                disabled={!name.trim() || !phone.trim()}
                className="w-full h-13 py-4 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl disabled:opacity-50"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === "complaint" && (
          <div className="bg-white rounded-3xl border border-[#F0E6D3] shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#4A3F35]">Keluhan Utama</h2>
            <p className="text-sm text-[#8A7B6B] mt-1 mb-6">
              Pilih gejala yang Anda rasakan saat ini (bisa lebih dari satu).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {symptoms.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? "border-[#C9A24A] bg-[#C9A24A]/5"
                        : "border-[#F0E6D3] bg-white hover:border-[#E8D4A2]"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${symptom.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium text-center ${isSelected ? "text-[#C9A24A]" : "text-[#4A3F35]"}`}>
                      {symptom.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-[#4A3F35] block mb-2">
                Seberapa parah rasa sakitnya? (Opsional)
              </label>
              <div className="flex flex-wrap gap-2">
                {painLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPainLevel(level)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                      painLevel === level
                        ? "bg-[#C9A24A] text-white shadow-lg shadow-[#C9A24A]/30"
                        : level <= 3
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : level <= 6
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-[#4A3F35] block mb-1.5">
                Detail Keluhan (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kapan gejala mulai terasa, apa yang memperparah/memperbaiki, dll..."
                className="w-full min-h-[120px] p-4 bg-[#FDF8F0] rounded-2xl text-sm text-[#4A3F35] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#C9A24A]/30 resize-none border border-[#E8D4A2]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSymptoms.length === 0}
              className="w-full h-13 py-4 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mengirim Konsultasi...
                </>
              ) : (
                <>
                  <MessageSquareText className="w-5 h-5 mr-2" />
                  Kirim Konsultasi
                </>
              )}
            </Button>
            <p className="text-[11px] text-[#B8A99A] mt-3 text-center">
              Dengan mengirim, Anda menyetujui data di atas digunakan untuk keperluan layanan konsultasi.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
