import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/toast";
import { createConsultation } from "@/features/patient/consultation/services/consultationApi";
import { setCachedConsultation } from "@/features/patient/consultation/services/consultationCache";
import {
  MessageSquareText,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

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

export default function DesktopKonsultasi() {
  const navigate = useNavigate();
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [painScale, setPainScale] = useState<string>("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        message: "Silakan tuliskan detail keluhan gigi yang Anda rasakan.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPain = painScale !== "" ? parseInt(painScale, 10) : undefined;
      const consultation = await createConsultation({
        type: "quick",
        topic: selectedSymptom,
        chiefComplaint: complaintDetails.trim(),
        painScale: parsedPain,
        preferredContact: "whatsapp",
      });

      if (consultation && consultation.id) {
        setCachedConsultation(String(consultation.id), consultation);
      }

      toast({
        title: "Konsultasi Terkirim",
        message: "Menghubungkan ke ruang Live Chat...",
        variant: "success",
      });

      navigate(`/dashboard/user/consultation/${consultation.id}`);
    } catch (err: any) {
      toast({
        title: "Gagal Mengirim Konsultasi",
        message: err?.message || "Tidak dapat mengirim data konsultasi. Silakan coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F0EAE1] bg-gradient-to-r from-[#FAF8F5] to-[#FAF5EA] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2C2416]">Konsultasi Online Langsung</h2>
            <p className="text-[11px] text-[#8C8272]">
              Sampaikan keluhan gigi Anda dan langsung mulai sesi live chat dengan tim medis
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Dokter Siaga
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
        {/* Dropdown 1: Gejala yang dirasakan */}
        <div>
          <label htmlFor="user-symptom-select" className="block text-xs font-bold text-[#2C2416] mb-1.5">
            Gejala yang Dirasakan <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="user-symptom-select"
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
          <label htmlFor="user-pain-select" className="block text-xs font-bold text-[#2C2416] mb-1.5">
            Tingkat Nyeri (Skala 0 - 10)
          </label>
          <div className="relative">
            <select
              id="user-pain-select"
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
          <label htmlFor="user-complaint-details" className="block text-xs font-bold text-[#2C2416] mb-1.5">
            Detail Keluhan <span className="text-rose-500">*</span>
          </label>
          <Textarea
            id="user-complaint-details"
            value={complaintDetails}
            onChange={(e) => setComplaintDetails(e.target.value)}
            placeholder="Ceritakan detail keluhan Anda (misal: gigi bagian mana yang sakit, sudah berapa hari dirasakan, apakah ada bengkak atau rasa ngilu saat makan/minum, dll)..."
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
                Menghubungkan ke Ruang Live Chat...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Mulai Konsultasi & Buka Live Chat
              </>
            )}
          </Button>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C8272] border-t border-[#F0EAE1]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kerahasiaan rekam keluhan Anda terenkripsi aman.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
            <span>Estimasi respon dokter 15-30 menit.</span>
          </div>
        </div>
      </form>
    </div>
  );
}

