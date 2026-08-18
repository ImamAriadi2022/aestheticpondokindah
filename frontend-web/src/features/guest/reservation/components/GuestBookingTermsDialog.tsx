import { useEffect, useState, useRef } from "react";
import {
  FileText,
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PenTool,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { getPublicClinicSettings } from "../services/clinicSettingsApi";

interface GuestBookingTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms?: string;
  patientName?: string;
  onConfirm: (signatureData?: string | null) => void;
}

export default function GuestBookingTermsDialog({
  open,
  onOpenChange,
  terms,
  patientName = "Pasien Guest",
  onConfirm,
}: GuestBookingTermsDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (open) {
      setAccepted(false);
      setSignatureData(null);
      setHasSignature(false);

      getPublicClinicSettings()
        .then((settings) => {
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  // Initialize Canvas
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = "#2C2416";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, 150);

    return () => clearTimeout(timer);
  }, [open]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ("clientX" in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureData(dataUrl);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    setSignatureData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl border border-[#EADBBD] flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-xs">
              <FileText className="w-4 h-4 text-[#8C6B1C]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#2C2416]">
                Syarat & Ketentuan Reservasi
              </h3>
              <p className="text-[11px] text-[#7C7365]">
                Dokumen Resmi Informed Consent & Kebijakan Klinik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#8C6B1C] hover:bg-[#EFE9DC] transition-all shadow-xs"
              title="Cetak / Simpan PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Formal PDF Document & Signature Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#FAF9F6]">
          {/* PDF Official Letterhead Card */}
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-6 shadow-sm space-y-5 text-[#2C2416]">
            <div className="border-b-2 border-[#2C2416] pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>Aesthetic Pondok Indah Dental Clinic</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-[#2C2416]">
                SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK
              </h2>
              <p className="text-[11px] text-[#7C7365]">
                Jl. Metro Pondok Indah Kav. IV, Jakarta Selatan, 12310 • WhatsApp: +62 819-9011-4949
              </p>
              <div className="text-[10px] text-[#8C8272] pt-1">
                Ref. Dokumen: <span className="font-mono font-semibold">SK-CONSENT-2026/GUEST-REV</span>
              </div>
            </div>

            {/* Admin Terms if any */}
            {adminTerms ? (
              <div className="space-y-3 text-xs text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4">
                <div className="font-bold text-[#8C6B1C] text-[11px] uppercase tracking-wider">
                  Ketentuan Khusus Operasional:
                </div>
                {adminTerms}
              </div>
            ) : null}

            {/* Standard Clauses */}
            <div className="space-y-3 text-xs text-[#443E33] leading-relaxed">
              <div>
                <h4 className="font-bold text-[#2C2416]">1. Ketentuan Kedatangan & Registrasi Pasien</h4>
                <p className="text-[#6B5E4F] mt-0.5">
                  Pasien diwajibkan hadir di klinik sekurang-kurangnya <strong>15 (lima belas) menit</strong> sebelum waktu jadwal reservasi untuk verifikasi identitas dan persiapan rekam medis awal.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#2C2416]">2. Kebijakan Keterlambatan & Penjadwalan Ulang</h4>
                <p className="text-[#6B5E4F] mt-0.5">
                  Apabila pasien mengalami keterlambatan lebih dari 15 menit tanpa pemberitahuan, pihak klinik berhak mengalihkan antrean atau menjadwalkan ulang demi kelancaran operasional dokter.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#2C2416]">3. Persetujuan Tindakan Medis (Informed Consent)</h4>
                <p className="text-[#6B5E4F] mt-0.5">
                  Dengan membubuhkan tanda tangan digital di bawah ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis dan tindakan diagnostik sesuai standar medis.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#2C2416]">4. Kerahasiaan & Keamanan Data Medis</h4>
                <p className="text-[#6B5E4F] mt-0.5">
                  Seluruh riwayat medis, identitas, dan tanda tangan digital pasien dilindungi secara ketat sesuai regulasi rekam medis dan privasi kesehatan Republik Indonesia.
                </p>
              </div>
            </div>

            {/* Digital Signature Canvas Section */}
            <div className="pt-4 border-t border-[#EDE5D6] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C2416] flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Tanda Tangan Digital Pasien (Goresan Tangan Asli)
                </label>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Hapus Goresan
                  </button>
                )}
              </div>

              <div className="relative border-2 border-dashed border-[#C9A24A]/60 hover:border-[#C9A24A] bg-[#FAF8F5] rounded-2xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 touch-none cursor-crosshair block bg-white"
                />

                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-3">
                    <PenTool className="w-5 h-5 text-[#C9A24A] mb-1 opacity-70" />
                    <p className="text-xs font-bold text-[#3D332A]">Goreskan Tanda Tangan Anda di Sini</p>
                    <p className="text-[10px] text-[#8A7B6B]">Gunakan jari di layar sentuh atau mouse komputer</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7C7365] pt-0.5">
                <span>Penandatangan: <strong>{patientName}</strong></span>
                {hasSignature ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Goresan Terekam
                  </span>
                ) : (
                  <span className="text-amber-700 italic">Belum ditandatangani</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Confirmation Bar */}
        <div className="border-t border-[#EDE5D6] bg-white p-4 sm:p-5 space-y-3 shrink-0">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#C9A24A] rounded"
            />
            <span className="text-xs text-[#443E33] leading-relaxed">
              Saya telah membaca, memahami seluruh isi surat persetujuan, dan membubuhkan tanda tangan secara sah.
            </span>
          </label>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl text-xs font-semibold py-2.5 h-auto border-[#D9D0BC] text-[#4A3F35]"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={!accepted}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white text-xs font-bold py-2.5 h-auto shadow-md disabled:opacity-40"
              onClick={() => {
                onOpenChange(false);
                onConfirm(signatureData);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Setuju & Kirim Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
