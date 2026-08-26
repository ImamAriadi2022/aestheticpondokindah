import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface TermsPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export default function TermsPdfModal({
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false,
}: TermsPdfModalProps) {
      const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [customTerms, setCustomTerms] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getPublicClinicSettings()
        .then((settings: any) => {
          if (settings.pdf_terms_and_conditions) {
            setCustomTerms(settings.pdf_terms_and_conditions);
          }
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

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

    const w = customTerms?.kop?.logoWidth || 75;
    const h = customTerms?.kop?.logoHeight || 75;

    const sectionsHtml = customTerms?.bodyHtml || (customTerms?.sections && customTerms.sections.length > 0
      ? customTerms.sections.map((s: any) => `
          <div class="section-title">${s.title}</div>
          <p>${s.content}</p>
        `).join('')
      : `
          <div class="section-title">1. Ketentuan Umum & Pendaftaran Layanan</div>
          <p>Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform resmi klinik.</p>
          <div class="section-title">2. Ketentuan Penjadwalan, Kedatangan & Reschedule</div>
          <p>Pasien diharapkan hadir di klinik minimal 10 menit sebelum waktu janji temu yang telah dikonfirmasi.</p>
          <div class="section-title">3. Standar Pelayanan Medis & Keselamatan Pasien</div>
          <p>Seluruh tindakan perawatan gigi dan estetik dilakukan oleh dokter gigi spesialis berizin praktik resmi.</p>
          <div class="section-title">4. Kebijakan Pembayaran & Garansi Layanan</div>
          <p>Biaya tindakan disesuaikan dengan jenis perawatan dan bahan medis yang disetujui pasien sebelum tindakan.</p>
        `);

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${customTerms?.docTitle || "Syarat dan Ketentuan Layanan Pasien"} - Aesthetic Pondok Indah</title>
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
              font-size: ${customTerms?.baseFontSize || "9.5pt"};
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
            .doc-sub {
              font-size: 8.5pt;
              color: #555;
              font-style: italic;
              margin-top: 1px;
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
            .footer-info {
              margin-top: 20px;
              border-top: 1px dashed #bbb;
              padding-top: 8px;
              font-size: 7.5pt;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            ${customTerms?.kop?.logoUrl ? `<div class="kop-logo"><img src="${customTerms.kop.logoUrl}" alt="Logo" /></div>` : ''}
            <div class="kop-details">
              <div class="kop-title">${customTerms?.kop?.clinicName || 'PT NAVENA INTERNATIONAL GROUP'}</div>
              <div class="kop-contact">Phone: ${customTerms?.kop?.phone || '+62 21 555 1900'} &nbsp; E-mail: <a>${customTerms?.kop?.email || 'navenainternationalgroup@gmail.com'}</a></div>
              <div class="kop-address">${customTerms?.kop?.address || 'Jl. Sapta Taruna Raya No.7, Desa/Kelurahan Pondok Pinang, Kec. Kebayoran Lama, Kota Adm. Jakarta Selatan'}</div>
            </div>
          </div>

          <div class="doc-header">
            <div class="doc-title">${customTerms?.docTitle || "SYARAT DAN KETENTUAN LAYANAN & PERAWATAN GIGI"}</div>
            <div class="doc-sub">${customTerms?.docSubtitle || "Pedoman Resmi Pasien Aesthetic Pondok Indah"} (${customTerms?.docVersion || "Versi 2.4 - Berlaku Resmi 2026"})</div>
          </div>

          ${sectionsHtml}

          <div class="footer-info">
            ${customTerms?.footerNote || "Dokumen ini sah dan diterbitkan secara digital oleh Aesthetic Pondok Indah Dental Clinic."}<br/>
            Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
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
        document.body.removeChild(printFrame);
      }, 1000);
    }, 350);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl lg:max-w-4xl xl:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner">
              <FileText className="w-5 h-5 text-[#8C6B1C]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-[#2C2416]">
                Dokumen Syarat & Ketentuan Layanan Pasien
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272]">
                Kebijakan operasional, aturan penjadwalan, tata tertib, dan perlindungan privasi klinik.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5ECE0] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EDE5D6]/30">
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-[#E0D7C4] text-[#2C2416] space-y-6">
            {/* Letterhead */}
            <div className="border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#8C6B1C]">
                <Building2 className="w-5 h-5" />
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider">
                  Aesthetic Pondok Indah
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#4A3F35]">
                DENTAL CLINIC & IMPLANT CENTER
              </p>
              <p className="text-[11px] text-[#7A6E60] leading-relaxed">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br />
                Telepon: (021) 765-4321 | WhatsApp Layanan: 0812-3456-7890 | Website: https://aestheticpondokindah.web.id
              </p>
            </div>

            {/* Document Title Header */}
            <div className="text-center space-y-1 py-1 bg-[#FAF8F5] rounded-xl border border-[#EDE5D6] p-3">
              <h2 className="text-sm sm:text-base font-extrabold uppercase text-[#2C2416] tracking-wide">
                Syarat dan Ketentuan Layanan Pasien
              </h2>
              <p className="text-[11px] text-[#8C6B1C] font-semibold">
                DOKUMEN KEBIJAKAN OPERASIONAL & PERJANJIAN LAYANAN KLINIK
              </p>
            </div>

            {/* Content Sections */}
            {customTerms?.bodyHtml ? (
              <div
                className="wp-editor-content prose max-w-none text-xs sm:text-sm leading-relaxed text-[#3D332A]"
                dangerouslySetInnerHTML={{ __html: customTerms.bodyHtml }}
              />
            ) : (
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#3D332A]">
                {/* Pasal 1 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1">
                    1. Ketentuan Umum & Pendaftaran Layanan
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs">
                    <li>Seluruh reservasi konsultasi dan tindakan medis gigi di Aesthetic Pondok Indah Dental Clinic wajib didaftarkan melalui platform reservasi resmi klinik atau bagian resepsionis.</li>
                    <li>Pasien atau wali sah wajib memberikan data identitas diri, nomor kontak aktif, serta riwayat medis yang akurat dan dapat dipertanggungjawabkan.</li>
                    <li>Klinik berhak memverifikasi identitas pasien saat kedatangan untuk keperluan administrasi dan rekam medis elektronik.</li>
                  </ol>
                </div>

                {/* Pasal 2 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1">
                    2. Ketentuan Penjadwalan, Kedatangan & Reschedule
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs">
                    <li>Pasien diharapkan hadir di klinik minimal 15 (lima belas) menit sebelum estimasi jam tindakan untuk proses registrasi dan pengecekan awal.</li>
                    <li>Keterlambatan lebih dari 20 menit dari waktu jadwal yang telah dikonfirmasi dapat mengakibatkan penyesuaian durasi perawatan atau penjadwalan ulang (*reschedule*) demi kenyamanan antrean pasien berikutnya.</li>
                    <li>Permohonan perubahan jadwal (*reschedule*) dapat dilakukan maksimal 4 (empat) jam sebelum jadwal tindakan melalui sistem atau staf klinik.</li>
                  </ol>
                </div>

                {/* Pasal 3 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1">
                    3. Tata Tertib & Prosedur Medis Klinik
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs">
                    <li>Sebelum tindakan medis dilakukan, dokter gigi yang bertugas akan melakukan pemeriksaan klinis dan menjelaskan rencana perawatan, indikasi, serta estimasi biaya.</li>
                    <li>Tindakan medis invasif, bedah minor, restorasi lanjutan, dan estetik memerlukan penandatanganan <strong>Surat Pernyataan dan Persetujuan Pasien (Informed Consent)</strong> yang sah.</li>
                    <li>Pasien wajib mematuhi seluruh instruksi pra-tindakan dan pasca-tindakan yang diberikan oleh dokter gigi demi efektivitas dan keamanan hasil perawatan.</li>
                  </ol>
                </div>

                {/* Pasal 4 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1">
                    4. Kebijakan Pembayaran & Jaminan Layanan
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs">
                    <li>Pembayaran tagihan tindakan dapat dilakukan secara tunai, kartu debit/kredit, transfer bank, maupun metode pembayaran digital resmi yang disediakan klinik.</li>
                    <li>Setiap perawatan bergaransi (seperti pemasangan veneer porselen atau implan tertentu) tunduk pada syarat kontrol berkala sesuai rekomendasi dokter penanggung jawab.</li>
                  </ol>
                </div>

                {/* Pasal 5 */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wide border-b border-[#EADBBD] pb-1">
                    5. Kerahasiaan Data Pribadi & Rekam Medis
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#4A3F35] text-xs">
                    <li>Aesthetic Pondok Indah menjamin kerahasiaan data pribadi dan rekam medis pasien sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.</li>
                    <li>Dokumentasi klinis (foto gigi intraoral/ekstraoral dan rontgen panoramic) digunakan secara ketat untuk kepentingan diagnosis medis dan rekam jejak kesehatan gigi pasien.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Certification Footer Note */}
            <div className="pt-4 border-t border-[#E8DFC8] text-center text-[11px] text-[#7A6E60] space-y-1">
              <p className="font-semibold text-[#8C6B1C]">
                Aesthetic Pondok Indah Dental Clinic — Standar Pelayanan & Keselamatan Pasien Terakreditasi
              </p>
              <p>
                Dokumen ini merupakan standar resmi syarat & ketentuan layanan klinik yang berlaku mengikat bagi seluruh pasien terdaftar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#E8DFC8] rounded-b-3xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#8C8272]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen Syarat & Ketentuan Resmi Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border-[#D9D0BC] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
            >
              Tutup
            </Button>
            {showAcceptButton && onAccept && (
              <Button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="h-9 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saya Menyetujui Syarat & Ketentuan</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
