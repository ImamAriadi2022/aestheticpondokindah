import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  Printer,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface TermsPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsPdfModal({
  isOpen,
  onClose,
  onAccept,
}: TermsPdfModalProps) {
  const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getPublicClinicSettings()
        .then((settings) => {
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Surat Persetujuan Tindakan Medis - Aesthetic Pondok Indah</title>
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
              line-height: 1.55;
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
              letter-spacing: 0.5px;
            }
            .letterhead-contact {
              font-size: 8.5pt;
              color: #555;
              line-height: 1.35;
            }
            .doc-header {
              text-align: center;
              margin-bottom: 18px;
            }
            .doc-title {
              font-size: 12pt;
              font-weight: 800;
              text-transform: uppercase;
              color: #111;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            .doc-ref {
              font-size: 8.5pt;
              color: #777;
              font-family: monospace;
            }
            .section-title {
              font-weight: 700;
              font-size: 10pt;
              margin-top: 12px;
              margin-bottom: 3px;
              color: #111;
            }
            p {
              margin: 0 0 8px 0;
              text-align: justify;
              font-size: 9.5pt;
              color: #333;
            }
            .custom-terms {
              background: #faf8f5;
              border: 1px solid #eadbbd;
              border-radius: 6px;
              padding: 10px 14px;
              margin: 12px 0;
              font-size: 9pt;
              white-space: pre-line;
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
            .seal-badge {
              font-weight: 700;
              color: #047857;
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

          <div class="doc-header">
            <div class="doc-title">Surat Persetujuan Tindakan Medis & Ketentuan Layanan</div>
            <div class="doc-ref">Nomor Dokumen: SK-CONSENT-2026/REV-03 • Lembar Informed Consent Resmi</div>
          </div>

          ${adminTerms ? `
            <div class="custom-terms">
              <strong>Ketentuan Khusus Operasional Klinik:</strong><br/>
              ${adminTerms}
            </div>
          ` : ''}

          <div class="section-title">1. Ketentuan Kedatangan & Registrasi Pasien</div>
          <p>Pasien diwajibkan hadir di klinik sekurang-kurangnya 15 menit sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.</p>

          <div class="section-title">2. Kebijakan Keterlambatan & Penjadwalan Ulang</div>
          <p>Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal yang telah ditentukan tanpa pemberitahuan sebelumnya, pihak klinik berhak mengalihkan antrean kepada pasien berikutnya atau menjadwalkan ulang demi kenyamanan bersama. Permintaan perubahan jadwal dapat dilakukan bebas biaya dengan menghubungi petugas administrasi selambat-lambatnya 1 x 24 jam sebelum jadwal tindakan.</p>

          <div class="section-title">3. Persetujuan Tindakan Medis</div>
          <p>Dengan menyetujui dan menandatangani lembar persetujuan ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.</p>

          <div class="section-title">4. Kerahasiaan Rekam Medis & Privasi Pasien</div>
          <p>Seluruh data rekam medis elektronik, riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.</p>

          <div class="section-title">5. Pembayaran & Kebijakan Pembatalan</div>
          <p>Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer perbankan yang telah diverifikasi oleh kasir klinik. Pembatalan sepihak saat hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya.</p>

          <div class="footer-sign">
            <div>
              <span class="seal-badge">✓ Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal</span><br/>
              Klinik Utama Aesthetic Pondok Indah — Jakarta Selatan
            </div>
            <div style="text-align: right;">
              Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
              Status: Disetujui Pasien
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
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                Syarat & Ketentuan Reservasi
              </h3>
              <p className="text-xs text-[#7C7365]">
                Dokumen Resmi Informed Consent & Kebijakan Klinik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-xl bg-white border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cetak / Simpan PDF Resmi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
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

        {/* Scrollable Formal PDF Document View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FAF8F5]">
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#2C2416]">
            {/* Official Letterhead Header */}
            <div className="border-b-2 border-[#8C6B1C] pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>Aesthetic Pondok Indah Dental Clinic</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-[#2C2416]">
                SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK
              </h2>
              <p className="text-xs text-[#7C7365]">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310 • Telp: (021) 765-4321 • WhatsApp: +62 811-9876-5432
              </p>
              <div className="text-[11px] text-[#8C8272] pt-1">
                Ref. Dokumen: <span className="font-mono font-semibold">SK-CONSENT-2026/REV-03</span>
              </div>
            </div>

            {/* Admin Dynamic Terms Content if Present */}
            {adminTerms ? (
              <div className="space-y-3 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4">
                <div className="font-bold text-[#8C6B1C] text-xs uppercase tracking-wider">
                  Ketentuan Khusus Operasional:
                </div>
                {adminTerms}
              </div>
            ) : null}

            {/* Standard Legal & Clinical Clauses (No copywriting in parentheses) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#443E33] leading-relaxed">
              {/* Pasal 1 */}
              <div className="space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  1. Ketentuan Kedatangan & Registrasi Pasien
                </h4>
                <p>
                  Pasien diwajibkan hadir di klinik sekurang-kurangnya <strong>15 menit</strong> sebelum waktu jadwal reservasi yang telah disepakati untuk verifikasi identitas dan registrasi ulang.
                </p>
              </div>

              {/* Pasal 2 */}
              <div className="space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  2. Kebijakan Keterlambatan & Penjadwalan Ulang
                </h4>
                <p>
                  Keterlambatan lebih dari 15 menit tanpa konfirmasi dapat menyebabkan antrean dialihkan. Penjadwalan ulang bebas biaya maksimal <strong>1 x 24 jam</strong> sebelum jadwal tindakan.
                </p>
              </div>

              {/* Pasal 3 */}
              <div className="space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  3. Persetujuan Tindakan Medis
                </h4>
                <p>
                  Pasien memberikan wewenang kepada dokter spesialis untuk melakukan pemeriksaan klinis, diagnostik rontgen jika diperlukan, serta prosedur perawatan yang disepakati.
                </p>
              </div>

              {/* Pasal 4 */}
              <div className="space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6]">
                <h4 className="font-bold text-[#2C2416]">
                  4. Kerahasiaan Rekam Medis & Privasi Pasien
                </h4>
                <p>
                  Seluruh data rekam medis elektronik dan riwayat kesehatan pasien dilindungi kerahasiaannya sesuai regulasi perundang-undangan kesehatan Republik Indonesia.
                </p>
              </div>
            </div>

            {/* Pasal 5 */}
            <div className="space-y-1.5 bg-[#FAF8F5]/60 p-4 rounded-xl border border-[#EDE5D6] text-xs sm:text-sm text-[#443E33]">
              <h4 className="font-bold text-[#2C2416]">
                5. Pembayaran & Kebijakan Pembatalan
              </h4>
              <p>
                Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer bank resmi kasir klinik. Pembatalan sepihak hari H tanpa alasan darurat dapat memengaruhi kuota booking prioritas.
              </p>
            </div>

            {/* Official Seal / Footer Note */}
            <div className="pt-4 border-t border-[#EDE5D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C7365]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal</span>
              </div>
              <span className="text-[#A0988A]">Terakhir diperbarui: Agustus 2026</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Tutup
          </Button>

          <Button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
          >
            Saya Telah Membaca & Setuju
          </Button>
        </div>
      </div>
    </div>
  );
}
