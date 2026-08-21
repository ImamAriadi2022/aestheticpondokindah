import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface ReservationConsentPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  patientName: string;
  patientPhone: string;
  isGuest: boolean;
  serviceName: string;
  doctorName: string;
  dateStr: string;
  timeStr: string;
  signatureData?: string | null;
  acceptedAt?: string | null;
}

export default function ReservationConsentPdfModal({
  isOpen,
  onClose,
  bookingCode,
  patientName,
  patientPhone,
  isGuest,
  serviceName,
  doctorName,
  dateStr,
  timeStr,
  signatureData,
  acceptedAt,
}: ReservationConsentPdfModalProps) {
      const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [customConsent, setCustomConsent] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      getPublicClinicSettings()
        .then((settings: any) => {
          if (settings.pdf_informed_consent) {
            setCustomConsent(settings.pdf_informed_consent);
          }
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : `${dateStr}, ${timeStr}`;

    const handlePrint = () => {
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

    const w = customConsent?.kop?.logoWidth || 75;
    const h = customConsent?.kop?.logoHeight || 75;

    const clausesHtml = customConsent?.clausuls && customConsent.clausuls.length > 0
      ? customConsent.clausuls.map((c: any) => `
          <div class="section-title">${c.title}</div>
          <p>${c.content}</p>
        `).join('')
      : `
          <div class="section-title">1. Ketentuan Kedatangan & Registrasi Pasien</div>
          <p>Pasien diwajibkan hadir di klinik sekurang-kurangnya 15 (lima belas) menit sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.</p>

          <div class="section-title">2. Kebijakan Keterlambatan & Penjadwalan Ulang (Reschedule)</div>
          <p>Apabila pasien mengalami keterlambatan lebih dari 15 menit tanpa pemberitahuan sebelumnya, pihak klinik berhak mengalihkan antrean demi kelancaran operasional. Penjadwalan ulang dapat dilakukan bebas biaya dengan menghubungi petugas administrasi selambat-lambatnya 1 x 24 jam sebelum jadwal tindakan.</p>

          <div class="section-title">3. Persetujuan Tindakan Medis (Informed Consent)</div>
          <p>Dengan menyetujui dan menandatangani lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.</p>

          <div class="section-title">4. Kerahasiaan Rekam Medis & Privasi Pasien</div>
          <p>Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan regulasi perundang-undangan kesehatan Republik Indonesia.</p>

          <div class="section-title">5. Pembayaran & Kebijakan Pembatalan</div>
          <p>Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer bank kasir klinik. Pembatalan sepihak saat hari H tanpa alasan darurat medis dapat memengaruhi kuota prioritas reservasi berikutnya.</p>
        `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${customConsent?.docTitle || "Surat Persetujuan Tindakan Medis"} - ${patientName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm 14mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
              color: #111;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              font-size: 9.5pt;
              background: #fff;
            }
            .kop-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              padding-bottom: 10px;
              margin-bottom: 14px;
              border-bottom: 3px double #111;
            }
            .kop-logo { flex-shrink: 0; }
            .kop-logo img { width: ${w}px; height: ${h}px; object-fit: contain; }
            .kop-details { text-align: center; flex: 1; }
            .kop-title { font-size: 13.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
            .kop-contact { font-size: 8.5pt; font-weight: 500; color: #222; margin-bottom: 2px; }
            .kop-contact a { color: #0056b3; text-decoration: underline; }
            .kop-address { font-size: 8pt; color: #333; line-height: 1.3; }

            .doc-header {
              text-align: center;
              margin-bottom: 14px;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: 800;
              color: #111;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-ref {
              font-size: 8.5pt;
              color: #555;
              margin-top: 1px;
            }
            .meta-box {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 12px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
              font-size: 8.5pt;
            }
            .meta-item {
              display: flex;
              gap: 6px;
            }
            .meta-label {
              font-weight: 600;
              color: #6b5e4f;
              min-width: 95px;
            }
            .meta-value {
              font-weight: 700;
              color: #2c2416;
            }
            .section-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: #111;
              margin: 10px 0 2px 0;
            }
            p {
              margin: 0 0 6px 0;
              text-align: justify;
              color: #333;
              font-size: 8.8pt;
              line-height: 1.4;
            }
            .custom-statement {
              margin: 14px 0;
              padding: 8px 12px;
              background: #fafafa;
              border-left: 3px solid #111;
              font-size: 8.5pt;
              font-style: italic;
            }
            .footer-grid {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 10px;
            }
            .seal-box {
              font-size: 8pt;
              color: #555;
            }
            .seal-badge {
              display: inline-block;
              padding: 2px 6px;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              color: #065f46;
              border-radius: 4px;
              font-weight: bold;
              font-size: 7.5pt;
              margin-bottom: 4px;
            }
            .signature-box {
              width: 220px;
              border: 1px solid #e0d7c4;
              border-radius: 6px;
              padding: 8px;
              text-align: center;
              background: #fff;
            }
            .signature-box img {
              max-height: 55px;
              max-width: 170px;
              object-fit: contain;
              display: block;
              margin: 4px auto;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${customConsent?.kop?.logoUrl ? `<div class="kop-logo"><img src="${customConsent.kop.logoUrl}" alt="Logo" /></div>` : ''}
            <div class="kop-details">
              <div class="kop-title">${customConsent?.kop?.clinicName || 'PT NAVENA INTERNATIONAL GROUP'}</div>
              <div class="kop-contact">Phone: ${customConsent?.kop?.phone || '+62 21 555 1900'} &nbsp; E-mail: <a>${customConsent?.kop?.email || 'navenainternationalgroup@gmail.com'}</a></div>
              <div class="kop-address">${customConsent?.kop?.address || 'Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan'}</div>
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">${customConsent?.docTitle || "SURAT PERSETUJUAN TINDAKAN KEDOKTERAN GIGI (INFORMED CONSENT)"}</div>
            <div class="doc-ref">Nomor Dokumen: SK-CONSENT-${bookingCode} • Lembar Informed Consent Resmi</div>
          </div>

          <div class="meta-box">
            <div>
              <div class="meta-item"><span class="meta-label">Nama Pasien:</span> <span class="meta-value">${patientName}</span> (${isGuest ? "Guest" : "Member"})</div>
              <div class="meta-item"><span class="meta-label">No. Telepon/WA:</span> <span class="meta-value">${patientPhone || "-"}</span></div>
              <div class="meta-item"><span class="meta-label">Layanan Tindakan:</span> <span class="meta-value">${serviceName}</span></div>
            </div>
            <div>
              <div class="meta-item"><span class="meta-label">Dokter Bertugas:</span> <span class="meta-value">${doctorName}</span></div>
              <div class="meta-item"><span class="meta-label">Jadwal Praktik:</span> <span class="meta-value">${dateStr} • ${timeStr}</span></div>
              <div class="meta-item"><span class="meta-label">Waktu Disetujui:</span> <span class="meta-value">${formattedDate}</span></div>
            </div>
          </div>

          ${clausesHtml}

          <div class="custom-statement">${customConsent?.closingStatement || "Demikian surat persetujuan tindakan medis ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya."}</div>

          <div class="footer-grid">
            <div class="seal-box">
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan<br/>
              <span style="font-size: 7.5pt; color: #888;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>

            <div class="signature-box">
              <div style="font-size: 7.5pt; font-weight: 700; color: #8C6B1C; margin-bottom: 2px; text-transform: uppercase;">
                Tanda Tangan Pasien / Wali
              </div>
              ${signatureData ? `
                <img src="${signatureData}" alt="Tanda Tangan ${patientName}" />
              ` : `
                <div style="font-size: 8pt; font-weight: 700; color: #047857; padding: 10px 0;">✓ Disetujui Secara Digital</div>
              `}
              <div style="font-size: 8.5pt; font-weight: 700; text-decoration: underline; margin-top: 2px;">${patientName}</div>
              <div style="font-size: 7.5pt; color: #666;">${isGuest ? "Guest User" : "Pasien Terdaftar"}</div>
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-white border border-[#EADBBD] shadow-2xl overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-xs">
              <FileText className="w-5 h-5 text-[#8C6B1C]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                Dokumen Persetujuan & Kebijakan Reservasi
              </DialogTitle>
              <DialogDescription className="text-xs text-[#7C7365] mt-0.5">
                Surat Informed Consent Resmi Pasien #{bookingCode}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              className="h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Cetak Dokumen Resmi"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Formal PDF Document View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]">
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]">
                        {/* Dynamic Formal Kop Surat */}
            <div className="flex items-center justify-center gap-4 pb-3 text-center border-b-2" style={{ borderBottom: "3px double #111" }}>
              {customConsent?.kop?.logoUrl ? (
                <div
                  className="flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg p-1 bg-white shadow-2xs overflow-hidden"
                  style={{
                    width: `${customConsent.kop.logoWidth || 75}px`,
                    height: `${customConsent.kop.logoHeight || 75}px`,
                  }}
                >
                  <img src={customConsent.kop.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : null}
              <div className="flex-1 text-center">
                <h2 className="text-sm sm:text-base font-black text-black tracking-wide uppercase">
                  {customConsent?.kop?.clinicName || "PT NAVENA INTERNATIONAL GROUP"}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-800 font-medium mt-0.5">
                  Phone: {customConsent?.kop?.phone || "+62 21 555 1900"} &nbsp; E-mail: <span className="text-blue-600 underline">{customConsent?.kop?.email || "navenainternationalgroup@gmail.com"}</span>
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5 leading-tight">
                  {customConsent?.kop?.address || "Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan, Provinsi DKI Jakarta, 12310"}
                </p>
              </div>
            </div>

            {/* Document Sub-Header */}
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-[#2C2416]">
                SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK
              </h3>
              <div className="text-[11px] text-[#8C8272] pt-0.5 flex items-center justify-center gap-3">
                <span>Ref. Dokumen: <strong className="font-mono font-semibold">SK-CONSENT-{bookingCode}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-700">Tersertifikasi Digital</strong></span>
              </div>
            </div>

            {/* Reservation & Patient Profile Meta Box */}
            <div className="bg-[#FAF8F5] border border-[#EADBBD] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <User className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Nama Pasien:</span>
                  <strong className="text-[#2C2416]">{patientName}</strong>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-[#D9D0BC] text-[#8C6B1C] font-semibold">
                    {isGuest ? "Guest User" : "Pasien Terdaftar"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <span>No. Telepon / WhatsApp:</span>
                  <strong className="text-[#2C2416]">{patientPhone || "-"}</strong>
                </div>
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Layanan yang Dipilih:</span>
                  <strong className="text-[#2C2416]">{serviceName}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <Stethoscope className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Dokter Spesialis:</span>
                  <strong className="text-[#2C2416]">{doctorName}</strong>
                </div>
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Tanggal & Jam Praktik:</span>
                  <strong className="text-[#2C2416]">{dateStr} • {timeStr}</strong>
                </div>
                <div className="flex items-center gap-2 text-[#6B5E4F]">
                  <Clock className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Waktu Persetujuan:</span>
                  <span className="text-[#2C2416]">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Admin Terms if Present */}
            {adminTerms && (
              <div className="space-y-2 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4">
                <div className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wider">
                  Ketentuan Khusus Operasional:
                </div>
                <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#EDE5D6]">{adminTerms}</div>
              </div>
            )}

            {/* Standard Legal Clauses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#443E33] leading-relaxed">
              <div className="space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  1. Ketentuan Kedatangan & Registrasi Pasien
                </h4>
                <p className="text-xs text-[#555]">
                  Pasien diwajibkan hadir di klinik sekurang-kurangnya <strong>15 (lima belas) menit</strong> sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.
                </p>
              </div>

              <div className="space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  2. Kebijakan Keterlambatan & Penjadwalan Ulang
                </h4>
                <p className="text-xs text-[#555]">
                  Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal tanpa pemberitahuan, antrean dialihkan. Penjadwalan ulang (reschedule) bebas biaya dilakukan selambatnya <strong>1 x 24 jam</strong> sebelum jadwal.
                </p>
              </div>

              <div className="space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  3. Persetujuan Tindakan Medis (Informed Consent)
                </h4>
                <p className="text-xs text-[#555]">
                  Dengan membubuhkan tanda tangan digital pada lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis untuk pemeriksaan klinis, diagnostik rontgen bila diperlukan, dan perawatan yang disepakati.
                </p>
              </div>

              <div className="space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  4. Kerahasiaan Rekam Medis & Privasi Pasien
                </h4>
                <p className="text-xs text-[#555]">
                  Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai regulasi hukum kesehatan Republik Indonesia.
                </p>
              </div>
            </div>

            {/* Pasal 5 */}
            <div className="space-y-1 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]">
              <h4 className="font-bold text-[#2C2416]">
                5. Pembayaran & Kebijakan Pembatalan
              </h4>
              <p className="text-xs text-[#555]">
                Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer kasir klinik. Pembatalan sepihak hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya.
              </p>
            </div>

            {/* Official Digital Signature & Validation Block */}
            <div className="pt-4 border-t-2 border-[#2C2416] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div className="space-y-2 text-xs text-[#6B5E4F]">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Lembar Persetujuan Sah Secara Medikolegal</span>
                </div>
                <p className="text-[11px] text-[#7C7365] leading-relaxed">
                  Tanda tangan digital ini terekam melalui kanvas biometrik terenkripsi dan disimpan permanen pada sistem basis data rekam medis klinik.
                </p>
                <div className="text-[10px] text-[#8C8272] pt-1">
                  Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                </div>
              </div>

              {/* Signature Card */}
              <div className="border border-[#D9D0BC] rounded-2xl p-4 bg-[#FAF8F5] text-center space-y-2">
                <p className="text-[11px] font-semibold text-[#8C6B1C] uppercase tracking-wider">
                  Tanda Tangan Pasien / Wali Sah
                </p>

                <div className="w-full h-24 bg-white border border-[#D9D0BC] rounded-xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
                  {signatureData && signatureData.trim().length > 10 ? (
                    <img
                      src={signatureData}
                      alt={`Tanda Tangan ${patientName}`}
                      className="max-h-full max-w-full object-contain filter contrast-125"
                    />
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui Secara Digital
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-[#2C2416] underline underline-offset-4">
                    {patientName}
                  </p>
                  <p className="text-[10px] text-[#7C7365] mt-0.5">
                    {isGuest ? "Pengunjung / Pasien Guest" : "Member Terdaftar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

