import React from "react";
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
  QrCode,
  Ticket,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FileText, ExternalLink } from "lucide-react";
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

  // Clean Isolated Print for Official E-Ticket
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
            @page {
              size: A4 portrait;
              margin: 18mm 16mm 18mm 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
              color: #1a1a1a;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              font-size: 10.5pt;
              background: #fff;
            }
            .letterhead {
              border-bottom: 2.5px solid #8C6B1C;
              padding-bottom: 12px;
              margin-bottom: 18px;
              text-align: center;
            }
            .letterhead-title {
              font-size: 16pt;
              font-weight: 800;
              color: #8C6B1C;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .letterhead-subtitle {
              font-size: 11pt;
              font-weight: 700;
              color: #2C2416;
              margin-bottom: 4px;
            }
            .letterhead-contact {
              font-size: 8.5pt;
              color: #555;
              line-height: 1.35;
            }
            .ticket-card {
              border: 1.5px solid #E6DECB;
              border-radius: 12px;
              padding: 18px;
              margin-bottom: 18px;
              background: #FAF8F5;
            }
            .ticket-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1.5px dashed #D9D0BC;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .ticket-code {
              font-family: monospace;
              font-size: 15pt;
              font-weight: bold;
              color: #8C6B1C;
            }
            .status-tag {
              background: #d1fae5;
              color: #065f46;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 9pt;
              font-weight: bold;
              border: 1px solid #a7f3d0;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              font-size: 10pt;
            }
            .info-group {
              margin-bottom: 8px;
            }
            .info-label {
              font-size: 8.5pt;
              color: #777;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .info-value {
              font-weight: 700;
              color: #2C2416;
            }
            .notice-box {
              background: #fef6e8;
              border: 1px solid #fadb9e;
              border-radius: 8px;
              padding: 10px 14px;
              font-size: 9pt;
              color: #8c5300;
              margin-top: 15px;
            }
            .footer-sign {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px dashed #bbb;
              display: flex;
              justify-content: space-between;
              font-size: 8.5pt;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="letterhead-title">Aesthetic Pondok Indah</div>
            <div class="letterhead-subtitle">Klinik Gigi & Estetika Medis</div>
            <div class="letterhead-contact">
              Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
              Telepon: (021) 765-4321 • WhatsApp: +62 811-9876-5432 • Web: aestheticpondokindah.com
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 15px;">
            <h2 style="font-size: 13pt; font-weight: 800; text-transform: uppercase; margin: 0 0 3px 0; color: #111;">
              E-Tiket Konfirmasi Reservasi Pasien
            </h2>
            <div style="font-size: 8.5pt; color: #777;">Tunjukkan e-tiket ini kepada resepsionis saat kedatangan</div>
          </div>

          <div class="ticket-card">
            <div class="ticket-header">
              <div>
                <div class="info-label">Kode Reservasi Resmi</div>
                <div class="ticket-code">${formattedCode}</div>
              </div>
              <div class="status-tag">✓ Terkonfirmasi</div>
            </div>

            <div class="grid-2">
              <div class="info-group">
                <div class="info-label">Nama Lengkap Pasien</div>
                <div class="info-value">${ticketData.patientName || "Pasien Terdaftar"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Nomor Telepon / WhatsApp</div>
                <div class="info-value">${ticketData.phone || "-"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Dokter Spesialis</div>
                <div class="info-value">${ticketData.doctorName}</div>
                <div style="font-size: 9pt; color: #8C6B1C;">${ticketData.specialization || "Spesialis Gigi"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Layanan Tindakan</div>
                <div class="info-value">${ticketData.serviceName}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Jadwal Praktik</div>
                <div class="info-value">${ticketData.displayDate || ticketData.date}</div>
                <div style="font-size: 9pt; color: #8C6B1C; font-weight: bold;">Pukul ${ticketData.time} WIB</div>
              </div>
              <div class="info-group">
                <div class="info-label">Estimasi Biaya</div>
                <div class="info-value" style="color: #8C6B1C; font-size: 11pt;">${formattedPrice}</div>
              </div>
            </div>

            <div class="info-group" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ede5d6;">
              <div class="info-label">Lokasi Klinik</div>
              <div class="info-value">Aesthetic Pondok Indah</div>
              <div style="font-size: 8.5pt; color: #555;">Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 (Telp: 021-7654321)</div>
            </div>
          </div>

          <div class="notice-box">
            <strong>Petunjuk Kedatangan Pasien:</strong><br/>
            Harap tiba di klinik sekurang-kurangnya 15 menit sebelum waktu appointment Anda untuk proses verifikasi identitas dan administrasi awal.
          </div>

          <div class="footer-sign">
            <div>
              <strong style="color: #047857;">✓ Tanda Tangan Digital Persetujuan Tindakan Medis Terverifikasi</strong><br/>
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

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl lg:max-w-3xl flex flex-col bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-left max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                E-Tiket Reservasi Pasien
              </h3>
              <p className="text-xs text-[#7C7365]">
                Bukti Konfirmasi Janji Temu Resmi Aesthetic Pondok Indah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrintTicket}
              className="h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cetak / Simpan PDF E-Tiket"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak E-Tiket</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable E-Ticket Card */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8F5]">
          {/* Main Visual Ticket Card */}
          <div className="bg-white border-2 border-[#E6DECB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 text-[#2C2416] relative overflow-hidden">
            {/* Top Brand Banner */}
            <div className="border-b border-[#EDE5D6] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C2416]">
                    Aesthetic Pondok Indah
                  </h4>
                  <p className="text-[11px] text-[#7C7365]">
                    Jl. Metro Pondok Indah Blok TB No. 12, Jakarta Selatan
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                  Status Reservasi
                </p>
                <div className="mt-0.5">{statusBadge}</div>
              </div>
            </div>

            {/* Ticket Code & QR Code Mockup */}
            <div className="bg-[#FAF8F5] border border-[#EADBBD] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                  Kode Reservasi Resmi
                </p>
                <p className="font-mono text-xl sm:text-2xl font-bold text-[#8C6B1C] tracking-wider">
                  {formattedCode}
                </p>
                <p className="text-[11px] text-[#7C7365]">
                  Tunjukkan kode atau e-tiket ini kepada staf resepsionis klinik
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white border border-[#D9D0BC] p-2 flex items-center justify-center text-[#2C2416] shadow-inner shrink-0 self-start sm:self-auto">
                <QrCode className="w-full h-full" />
              </div>
            </div>

            {/* 2-Column Info Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* Patient */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#8C6B1C]" />
                  <span>Pasien</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  {ticketData.patientName || "Pasien Terdaftar"}
                </p>
                {ticketData.phone && (
                  <p className="text-xs text-[#7C7365]">{ticketData.phone}</p>
                )}
              </div>

              {/* Doctor */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#8C6B1C]" />
                  <span>Dokter Spesialis</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  {ticketData.doctorName}
                </p>
                <p className="text-xs text-[#8C6B1C] font-semibold">
                  {ticketData.specialization || "Dokter Gigi Spesialis"}
                </p>
              </div>

              {/* Service */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#8C6B1C]" />
                  <span>Layanan Tindakan</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  {ticketData.serviceName}
                </p>
              </div>

              {/* Schedule */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EDE5D6] space-y-1">
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#8C6B1C]" />
                  <span>Jadwal Kunjungan</span>
                </p>
                <p className="font-bold text-[#2C2416]">
                  {ticketData.displayDate || ticketData.date}
                </p>
                <p className="text-xs font-bold text-[#8C6B1C]">
                  Pukul {ticketData.time} WIB
                </p>
              </div>
            </div>

            {/* Total Estimate & Verification Badge */}
            <div className="pt-3 border-t border-[#EDE5D6] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Tanda Tangan Digital & Persetujuan Tindakan Sah</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7C7365]">Estimasi Biaya:</span>
                <span className="text-base font-bold text-[#8C6B1C]">
                  {formattedPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons & PDF Viewers */}
        <div className="p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTermsModal(true)}
              className="flex-1 sm:flex-none h-10 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF S&K</span>
            </Button>
            <Button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="flex-1 sm:flex-none h-10 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
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
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
            >
              Tutup
            </Button>

            <Button
              type="button"
              onClick={onBookAgain}
              className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Reservasi Baru
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Modal 1: Syarat & Ketentuan */}
      <TermsPdfModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* PDF Modal 2: Surat Pernyataan & Persetujuan Pasien */}
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
        signatureData={(ticketData as any)?.signatureData || (ticketData as any)?.signature_data || null}
        acceptedAt={new Date().toISOString()}
      />
    </div>
  );
}
