import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  X,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  ExternalLink,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import TermsPdfModal from "@/features/patient/reservation/components/TermsPdfModal";
import ReservationConsentPdfModal from "@/features/admin/reservation/components/ReservationConsentPdfModal";

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
  patientName = "Pasien Guest",
  serviceName = "Konsultasi & Perawatan Gigi",
  doctorName = "Dokter Gigi Spesialis",
  dateStr = "Hari Ini",
  timeStr = "10:00 WIB",
  phone = "-",
  onConfirm,
}: GuestBookingTermsDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [showTermsPdfModal, setShowTermsPdfModal] = useState(false);
  const [showConsentPdfModal, setShowConsentPdfModal] = useState(false);

  if (!open) return null;

  const handleConfirmSubmit = () => {
    if (!termsAccepted || !signatureData) return;
    onConfirm(signatureData);
    onOpenChange(false);
  };

  const handleClearSignature = () => {
    setSignatureData(null);
  };

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !showTermsPdfModal && !showConsentPdfModal) {
              onOpenChange(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EDE5D6] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner">
                  <FileCheck className="w-5 h-5 text-[#8C6B1C]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2C2416]">
                    2 Langkah Verifikasi Dokumen Reservasi Tamu
                  </h2>
                  <p className="text-xs text-[#8C8272]">
                    Persetujuan Dokumen PDF S&K dan Dokumen PDF Surat Persetujuan Tanda Tangan Digital
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full bg-[#FAF5EA] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Langkah 1: Syarat & Ketentuan Layanan (PDF 1) */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${termsAccepted ? "text-emerald-600" : "text-[#8C6B1C]"}`} />
                    <span>Langkah 1: Dokumen Syarat & Ketentuan Layanan (PDF)</span>
                  </span>
                  <Button
                    type="button"
                    onClick={() => setShowTermsPdfModal(true)}
                    className={`h-8 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      termsAccepted
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-[#8C6B1C] text-white hover:bg-[#735614]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{termsAccepted ? "✓ Buka Kembali PDF S&K" : "Buka & Setujui PDF S&K"}</span>
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#4A3F35]">
                      Persetujuan Ketentuan Layanan Pasien
                    </p>
                    <p className="text-[11px] text-[#8A7B6B]">
                      Ceklis persetujuan dilakukan langsung di dalam lembar dokumen PDF resmi.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                      termsAccepted
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-900 border-amber-300"
                    }`}
                  >
                    {termsAccepted ? "✓ Telah Disetujui di PDF" : "Wajib Disetujui di PDF *"}
                  </span>
                </div>
              </div>

              {/* Langkah 2: Surat Pernyataan & Persetujuan Pasien (PDF 2) */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <PenTool className={`w-4 h-4 ${signatureData ? "text-emerald-600" : "text-[#8C6B1C]"}`} />
                    <span>Langkah 2: Dokumen Surat Persetujuan Medis / Informed Consent (PDF)</span>
                  </span>
                  <Button
                    type="button"
                    onClick={() => setShowConsentPdfModal(true)}
                    className={`h-8 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      signatureData
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-[#8C6B1C] text-white hover:bg-[#735614]"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{signatureData ? "✓ Ubah Tanda Tangan PDF" : "Buka & Tanda Tangani PDF"}</span>
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#4A3F35]">
                        Tanda Tangan Digital Pasien
                      </p>
                      <p className="text-[11px] text-[#8A7B6B]">
                        Tanda tangan digoreskan langsung di dalam lembar PDF Surat Persetujuan Medis.
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                        signatureData
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-amber-50 text-amber-900 border-amber-300"
                      }`}
                    >
                      {signatureData ? "✓ Tanda Tangan Tersemat" : "Wajib Ditandatangani di PDF *"}
                    </span>
                  </div>

                  {/* Preview Thumbnail if signed */}
                  {signatureData && (
                    <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="border border-gray-300 rounded-lg bg-white p-1 h-10 w-24 flex items-center justify-center">
                          <img
                            src={signatureData}
                            alt="Tanda Tangan"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] text-[#5C5546]">
                          Penandatangan: <strong>{patientName}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSignature}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
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
                disabled={!termsAccepted || !signatureData}
                onClick={handleConfirmSubmit}
                className="h-10 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setuju & Kirim Reservasi</span>
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PDF Modal 1: Syarat & Ketentuan (Persetujuan Ceklis di dalam PDF) */}
      <TermsPdfModal
        isOpen={showTermsPdfModal}
        onClose={() => setShowTermsPdfModal(false)}
        initialName={patientName}
        isAgreed={termsAccepted}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsPdfModal(false);
        }}
        showAcceptButton={true}
      />

      {/* PDF Modal 2: Surat Persetujuan Medis / Informed Consent (Tanda Tangan di dalam PDF) */}
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
        readOnly={false}
        onAccept={(sigData) => {
          setSignatureData(sigData);
          setShowConsentPdfModal(false);
        }}
      />
    </>
  );
}
