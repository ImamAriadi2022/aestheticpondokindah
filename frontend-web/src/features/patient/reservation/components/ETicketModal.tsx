import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Ticket,
  CheckCircle2,
  FileText,
  ExternalLink,
  Sparkles,
  Phone,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import TermsPdfModal from "./TermsPdfModal";
import ReservationConsentPdfModal from "@/features/admin/reservation/components/ReservationConsentPdfModal";

interface ETicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAgain: () => void;
  ticketData: {
    id?: string | number;
    code?: string;
    status: string;
    doctorName: string;
    specialization?: string;
    serviceName: string;
    locationName?: string;
    locationAddress?: string;
    date: string;
    displayDate?: string;
    time: string;
    examinationResult?: string;
    totalAmount?: string | number;
    patientName?: string;
    phone?: string;
  };
}

export default function ETicketModal({
  isOpen,
  onClose,
  onBookAgain,
  ticketData,
}: ETicketModalProps) {
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showConsentModal, setShowConsentModal] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawStatus = (ticketData.status || "confirmed").toLowerCase();
  const isCompleted = rawStatus === "selesai" || rawStatus === "completed";
  const isConfirmed = rawStatus === "dikonfirmasi" || rawStatus === "confirmed";
  const isCancelled = rawStatus === "dibatalkan" || rawStatus === "cancelled";

  const statusBadge = isCompleted ? (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8C6B1C] text-white shadow-2xs">
      Selesai
    </span>
  ) : isConfirmed ? (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
      Terkonfirmasi
    </span>
  ) : isCancelled ? (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
      Dibatalkan
    </span>
  ) : (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
      Menunggu
    </span>
  );

  const formattedCode =
    ticketData.code
      ? (ticketData.code.startsWith("#") ? ticketData.code : `#${ticketData.code}`)
      : (ticketData.id
          ? `#RSV-${String(ticketData.id).padStart(6, "0")}`
          : `#RSV-000001`);

  const formattedPrice =
    typeof ticketData.totalAmount === "number"
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(ticketData.totalAmount)
      : ticketData.totalAmount || "Rp 1.500.000";

  // Clean Isolated Print for Official E-Ticket (without barcode)
  const handlePrintTicket = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>E-Tiket Reservasi - ${formattedCode} - Aesthetic Pondok Indah</title>
          <style>
            @page { size: A4 portrait; margin: 18mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Segoe UI', sans-serif; color: #1a1a1a; line-height: 1.5; font-size: 10.5pt; }
            .letterhead { border-bottom: 2.5px solid #8C6B1C; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
            .brand-title { font-size: 16pt; font-weight: bold; color: #2C2416; letter-spacing: 0.5px; }
            .brand-sub { font-size: 9pt; color: #666; }
            .ticket-card { border: 1.5px solid #E6DECB; border-radius: 12px; padding: 18px; margin-bottom: 18px; background: #FAF8F5; }
            .ticket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EDE5D6; padding-bottom: 12px; margin-bottom: 14px; }
            .ticket-code { font-family: monospace; font-size: 14pt; font-weight: bold; color: #8C6B1C; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            .info-group { margin-bottom: 8px; }
            .info-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: bold; }
            .info-value { font-size: 10pt; font-weight: bold; color: #2C2416; }
            .notice-box { background: #FAF5EA; border: 1px solid #EADBBD; border-radius: 8px; padding: 12px; font-size: 8.5pt; color: #555; margin-top: 14px; }
            .footer-sign { margin-top: 24px; font-size: 8.5pt; color: #777; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="brand-title">AESTHETIC PONDOK INDAH</div>
            <div class="brand-sub">Dental Clinic & Esthetic Oral Surgery Center</div>
            <div class="brand-sub">Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310</div>
          </div>

          <div class="ticket-card">
            <div class="ticket-header">
              <div>
                <div class="info-label">Kode Reservasi Resmi</div>
                <div class="ticket-code">${formattedCode}</div>
              </div>
              <div style="font-weight: bold; color: #047857; font-size: 10.5pt;">✓ Terkonfirmasi</div>
            </div>

            <div class="grid-2">
              <div class="info-group">
                <div class="info-label">Nama Lengkap Pasien</div>
                <div class="info-value">${ticketData.patientName || "Pasien Terdaftar"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Dokter Spesialis</div>
                <div class="info-value">${ticketData.doctorName}</div>
                <div style="font-size: 9pt; color: #8C6B1C;">${ticketData.specialization || "Spesialis Gigi"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Layanan Perawatan</div>
                <div class="info-value">${ticketData.serviceName}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Jadwal Praktik</div>
                <div class="info-value">${ticketData.displayDate || ticketData.date}</div>
                <div style="font-size: 9pt; color: #8C6B1C; font-weight: bold;">Pukul ${ticketData.time} WIB</div>
              </div>
              <div class="info-group">
                <div class="info-label">Lokasi Klinik</div>
                <div class="info-value">Aesthetic Pondok Indah</div>
                <div style="font-size: 8.5pt; color: #666;">Jakarta Selatan</div>
              </div>
            </div>
          </div>

          <div class="notice-box">
            <strong>Petunjuk Kedatangan Pasien:</strong><br/>
            Harap tiba di klinik 15 menit sebelum waktu janji temu untuk verifikasi data awal di resepsionis.
          </div>

          <div class="footer-sign">
            <div>
              <strong style="color: #047857;">✓ Persetujuan Tindakan Medis Terverifikasi Secara Digital</strong><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan
            </div>
            <div style="text-align: right;">
              Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(printContent);
    frameDoc.close();

    const images = Array.from(frameDoc.querySelectorAll("img"));
    let hasPrinted = false;

    const executePrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          window.print();
        }
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 3000);
      }, 200);
    };

    if (images.length === 0) {
      executePrint();
    } else {
      let loadedCount = 0;
      const onImageLoaded = () => {
        loadedCount++;
        if (loadedCount >= images.length) {
          executePrint();
        }
      };

      images.forEach((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          onImageLoaded();
        } else {
          img.onload = onImageLoaded;
          img.onerror = onImageLoaded;
        }
      });

      setTimeout(() => {
        executePrint();
      }, 1200);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-xl lg:max-w-2xl flex flex-col bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-left max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] text-white flex items-center justify-center shadow-2xs shrink-0">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2416]">
                Detail Reservasi Pasien
              </h3>
              <p className="text-[11px] text-[#7C7365]">
                Bukti Resmi Janji Temu Aesthetic Pondok Indah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrintTicket}
              className="h-9 w-9 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] shadow-2xs cursor-pointer touch-manipulation"
              title="Cetak E-Tiket"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer touch-manipulation"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8F5]">
          {/* Main Visual Card */}
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 space-y-4 text-[#2C2416] shadow-xs">
            {/* Top Code & Status Banner (Without Barcode) */}
            <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                  Kode Reservasi
                </p>
                <p className="font-mono text-base sm:text-lg font-bold text-[#8C6B1C] tracking-wide">
                  {formattedCode}
                </p>
              </div>
              <div className="shrink-0">{statusBadge}</div>
            </div>

            {/* Structured 2-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Doctor */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Dokter Spesialis</span>
                </p>
                <p className="font-bold text-[#2C2416] text-xs sm:text-sm">
                  {ticketData.doctorName}
                </p>
                <p className="text-[11px] text-[#8C6B1C] font-semibold">
                  {ticketData.specialization || "Dokter Gigi Spesialis"}
                </p>
              </div>

              {/* Schedule */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Jadwal Janji Temu</span>
                </p>
                <p className="font-bold text-[#2C2416] text-xs sm:text-sm">
                  {ticketData.displayDate || ticketData.date}
                </p>
                <p className="text-[11px] font-bold text-[#8C6B1C]">
                  Pukul {ticketData.time} WIB
                </p>
              </div>

              {/* Patient */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Nama Pasien</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  {ticketData.patientName || "Pasien Terdaftar"}
                </p>
                {ticketData.phone && (
                  <p className="text-[11px] text-[#7C7365] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#8C8272]" />
                    {ticketData.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Lokasi Klinik</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  Aesthetic Pondok Indah
                </p>
                <p className="text-[11px] text-[#7C7365]">
                  Jakarta Selatan
                </p>
              </div>
            </div>

            {/* Arrival Notice Box */}
            <div className="p-3 bg-[#FAF5EA] border border-[#EADBBD] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#8C6B1C] text-[11px]">
                📌 Petunjuk Kedatangan:
              </p>
              <p className="text-[11px] text-[#6B5E4F] leading-relaxed">
                Harap hadir di klinik 15 menit sebelum waktu janji temu untuk proses registrasi di meja resepsionis. Tunjukkan kode reservasi kepada staf kami.
              </p>
            </div>

            {/* Digital Signature Verified Badge */}
            <div className="pt-2 border-t border-[#EDE5D6] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Persetujuan Tindakan Medis Terverifikasi</span>
              </div>
              <span className="text-[10px] text-[#8C8272]">Sistem Terintegrasi</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-[#EDE5D6] bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTermsModal(true)}
              className="flex-1 sm:flex-none h-10 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF S&K</span>
            </Button>
            <Button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="flex-1 sm:flex-none h-10 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>PDF Surat Persetujuan</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              Tutup
            </Button>

            <Button
              type="button"
              onClick={onBookAgain}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white text-xs font-bold shadow-xs transition-all cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              Reservasi Baru
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Modal 1: Syarat & Ketentuan */}
      {showTermsModal && (
        <TermsPdfModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          readOnly={true}
        />
      )}

      {/* PDF Modal 2: Surat Pernyataan & Persetujuan Pasien */}
      {showConsentModal && (
        <ReservationConsentPdfModal
          isOpen={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          bookingCode={ticketData.code || `#RSV-${ticketData.id || "000001"}`}
          patientName={ticketData.patientName || "Pasien Terdaftar"}
          patientPhone={ticketData.phone || "-"}
          isGuest={false}
          serviceName={ticketData.serviceName}
          doctorName={ticketData.doctorName}
          dateStr={ticketData.displayDate || ticketData.date}
          timeStr={`${ticketData.time} WIB`}
          signatureData={(ticketData as any)?.signatureData || (ticketData as any)?.signature_data || (ticketData as any)?.signature || null}
          acceptedAt={(ticketData as any)?.termsAcceptedAt || (ticketData as any)?.terms_accepted_at || (ticketData as any)?.acceptedAt || new Date().toISOString()}
          readOnly={true}
        />
      )}
    </div>,
    document.body
  );
}
