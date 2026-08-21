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
  ExternalLink,
  FileCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { getPublicClinicSettings } from "../services/clinicSettingsApi";
import TermsPdfModal from "@/features/patient/reservation/components/TermsPdfModal";
import ReservationConsentPdfModal from "@/features/admin/reservation/components/ReservationConsentPdfModal";
import { broadcastRealtimeReservationEvent } from "@/core/services/GlobalNotificationManager";

interface GuestBookingTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms?: string;
  patientName?: string;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  timeStr?: string;
  phone?: string;
  onConfirm: (signatureData?: string | null) => void;
}

export default function GuestBookingTermsDialog({
  open,
  onOpenChange,
  terms,
  patientName = "Pasien Guest",
  serviceName = "Konsultasi & Perawatan Gigi",
  doctorName = "Dokter Gigi Spesialis",
  dateStr = "Hari Ini",
  timeStr = "10:00 WIB",
  phone = "-",
  onConfirm,
}: GuestBookingTermsDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [showTermsPdfModal, setShowTermsPdfModal] = useState(false);
  const [showConsentPdfModal, setShowConsentPdfModal] = useState(false);

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

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
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
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
    setHasSignature(false);
  };

  const handleConfirmSubmit = () => {
    onConfirm(signatureData);
    broadcastRealtimeReservationEvent({
      type: "guest_booked",
      bookingCode: "#RSV-GUEST",
      patientName: patientName,
      serviceName: serviceName,
      dateStr: dateStr,
      timeStr: timeStr,
      isGuest: true,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EDE5D6] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner">
                <FileCheck className="w-5 h-5 text-[#8C6B1C]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#2C2416]">
                  2 Langkah Verifikasi Reservasi Tamu
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8C8272]">
                  Persetujuan Syarat & Ketentuan serta Tanda Tangan Digital Pasien
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-[#FAF5EA] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Langkah 1: Syarat & Ketentuan Layanan */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Langkah 1: Syarat & Ketentuan Layanan Pasien</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTermsPdfModal(true)}
                  className="h-7 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen PDF S&K</span>
                </Button>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#8C6B1C] focus:ring-[#8C6B1C]"
                />
                <span className="text-xs text-[#5C5546] leading-relaxed">
                  Saya telah membaca, memahami, dan menyetujui seluruh{" "}
                  <strong className="text-[#8C6B1C]">Syarat & Ketentuan Layanan Pasien</strong>{" "}
                  serta Kebijakan Klinik Aesthetic Pondok Indah. *
                </span>
              </label>
            </div>

            {/* Langkah 2: Surat Pernyataan & Persetujuan Pasien */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                  <span>Langkah 2: Surat Pernyataan & Persetujuan Pasien (Informed Consent)</span>
                </span>
                <Button
                  type="button"
                  onClick={() => setShowConsentPdfModal(true)}
                  className="h-7 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen PDF Surat Persetujuan</span>
                </Button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5546]">
                    Goreskan Tanda Tangan Digital Anda: *
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Bersihkan Canvas
                    </button>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-[#D9D0BC] rounded-2xl bg-[#FAF8F5] overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-32 cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4 text-[#A0988A]">
                      <PenTool className="w-5 h-5 mb-1 opacity-50" />
                      <p className="text-xs font-bold text-[#3D332A]">Goreskan Tanda Tangan Anda di Sini</p>
                      <p className="text-[10px]">Gunakan jari di layar sentuh atau mouse komputer</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#7A6E60] pt-0.5">
                  <span>Penandatangan: <strong>{patientName}</strong></span>
                  <span className={hasSignature ? "text-emerald-700 font-bold" : "text-amber-700"}>
                    {hasSignature ? "✓ Tanda tangan tersemat" : "Wajib ditandatangani *"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-[#EDE5D6] flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
            >
              Batal
            </Button>

            <Button
              type="button"
              disabled={!accepted || !hasSignature}
              onClick={handleConfirmSubmit}
              className="h-10 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Setuju & Kirim Reservasi</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Modal 1: S&K */}
      <TermsPdfModal
        isOpen={showTermsPdfModal}
        onClose={() => setShowTermsPdfModal(false)}
        onAccept={() => {
          setAccepted(true);
          setShowTermsPdfModal(false);
        }}
        showAcceptButton={true}
      />

      {/* PDF Modal 2: Surat Persetujuan */}
      <ReservationConsentPdfModal
        isOpen={showConsentPdfModal}
        onClose={() => setShowConsentPdfModal(false)}
        bookingCode="DRAFT-GUEST"
        patientName={patientName}
        patientPhone={phone}
        isGuest={true}
        serviceName={serviceName}
        doctorName={doctorName}
        dateStr={dateStr}
        timeStr={timeStr}
        signatureData={signatureData}
        acceptedAt={new Date().toISOString()}
      />
    </>
  );
}
