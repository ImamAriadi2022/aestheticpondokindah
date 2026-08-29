import { useEffect, useState } from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import {
  Scale,
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";
import {
  getTermsBodyHtml,
  type PdfTermsSettings,
} from "@/features/admin/settings/services/clinicSettingsService";

export default function TermsOfServicePage() {
  const [termsData, setTermsData] = useState<PdfTermsSettings | null>(null);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicClinicSettings()
      .then((settings: any) => {
        if (settings.pdf_terms_and_conditions) {
          setTermsData(settings.pdf_terms_and_conditions);
        }
        if (settings.clinic_general_info) {
          setClinicInfo(settings.clinic_general_info);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const docTitle = termsData?.docTitle || "Syarat dan Ketentuan Layanan";
  const docSubtitle =
    termsData?.docSubtitle ||
    "Ketentuan Reservasi, Standar Pelayanan Medis & Kebijakan Pasien";
  const docVersion = termsData?.docVersion || "REV-2026.04";
  const bodyHtml = getTermsBodyHtml(termsData);
  const footerNote =
    termsData?.footerNote ||
    "Dengan menggunakan layanan Aesthetic Pondok Indah Dental Clinic, pasien dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum.";

  const clinicName =
    clinicInfo?.clinicName ||
    termsData?.kop?.clinicName ||
    "Aesthetic Pondok Indah Dental Clinic";
  const clinicAddress =
    clinicInfo?.address ||
    termsData?.kop?.address ||
    "Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310";
  const clinicPhone =
    clinicInfo?.phone || termsData?.kop?.phone || "021-7695948";
  const clinicEmail =
    clinicInfo?.email ||
    termsData?.kop?.email ||
    "info@aestheticpondokindah.com";
  const clinicWhatsapp = clinicInfo?.whatsappNumber || "+62 819-9011-4949";

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

    const w = termsData?.kop?.logoWidth || 75;
    const h = termsData?.kop?.logoHeight || 75;
    const baseSize = termsData?.baseFontSize || "9.5pt";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${docTitle} - ${clinicName}</title>
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
              font-size: ${baseSize};
              line-height: 1.55;
              color: #2D2821;
              background: #fff;
              margin: 0;
              padding: 0;
            }
            .kop-container {
              display: flex;
              align-items: center;
              gap: 16px;
              border-bottom: 2.5px solid #8C6B1C;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .kop-logo {
              width: ${w}px;
              height: ${h}px;
              object-fit: contain;
              flex-shrink: 0;
            }
            .kop-text h1 {
              font-size: 14pt;
              font-weight: 800;
              color: #8C6B1C;
              margin: 0 0 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .kop-text p {
              margin: 1px 0;
              font-size: 8.5pt;
              color: #555;
            }
            .doc-header {
              text-align: center;
              margin: 16px 0 18px;
            }
            .doc-header h2 {
              font-size: 13pt;
              font-weight: 800;
              color: #1a1612;
              margin: 0 0 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-header .doc-meta {
              font-size: 8.5pt;
              color: #777;
              font-weight: 600;
            }
            .terms-body h3 {
              font-size: 10.5pt;
              font-weight: 700;
              color: #8C6B1C;
              margin: 14px 0 4px;
            }
            .terms-body p {
              margin: 0 0 8px;
              font-size: ${baseSize};
              text-align: justify;
            }
            .terms-body ul, .terms-body ol {
              margin: 4px 0 8px 18px;
              padding: 0;
            }
            .terms-body li {
              margin-bottom: 4px;
            }
            .footer-note {
              margin-top: 24px;
              padding: 10px 14px;
              background: #FAF8F5;
              border-left: 3.5px solid #C9A24A;
              border-radius: 4px;
              font-size: 8pt;
              color: #555;
              font-style: italic;
            }
            .signature-box {
              margin-top: 28px;
              display: flex;
              justify-content: flex-end;
            }
            .sign-col {
              text-align: center;
              width: 220px;
              font-size: 8.5pt;
            }
            .sign-line {
              margin-top: 55px;
              border-top: 1px solid #333;
              padding-top: 3px;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <img src="/logo/logo-vertikal.webp" class="kop-logo" alt="Logo" />
            <div class="kop-text">
              <h1>${clinicName}</h1>
              <p>${clinicAddress}</p>
              <p>Telp: ${clinicPhone} | Email: ${clinicEmail} | WhatsApp: ${clinicWhatsapp}</p>
            </div>
          </div>

          <div class="doc-header">
            <h2>${docTitle}</h2>
            <div class="doc-meta">${docSubtitle} &bull; No: ${docVersion}</div>
          </div>

          <div class="terms-body">
            ${bodyHtml}
          </div>

          <div class="footer-note">
            <strong>Catatan Hukum:</strong> ${footerNote}
          </div>

          <div class="signature-box">
            <div class="sign-col">
              <div>Jakarta, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div>Manajemen Pelayanan Klinik</div>
              <div class="sign-line">${clinicName}</div>
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
        document.body.removeChild(printFrame);
      }, 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />
      <main className="pb-24 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F3EAD8] border-b border-[#EADBBD]/80 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C9A24A]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8C6B1C]/5 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#EADBBD] shadow-xs text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-[#C9A24A]" />
                Dokumen Resmi Klinik
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#2D2821] tracking-tight">
                {docTitle}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-[#6B5E4E] leading-relaxed max-w-2xl mx-auto">
                {docSubtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#8A7B6B]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#EADBBD]">
                  <Clock className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  Versi Dokumen: <strong className="text-[#4A3F35]">{docVersion}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#EADBBD]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Status: <strong className="text-emerald-700 font-semibold">Berlaku Resmi</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Official Document Paper Section */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-[#7A6E60]">
                <FileText className="w-4 h-4 text-[#8C6B1C]" />
                <span>Format Resmi Syarat dan Ketentuan Pasien</span>
              </div>
              <Button
                onClick={handlePrint}
                className="bg-white hover:bg-[#F5ECE0] text-[#8C6B1C] border border-[#EADBBD] shadow-xs rounded-xl text-xs font-bold h-9 px-4 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </Button>
            </div>

            {/* Document Sheet */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-md border border-[#E8DFC8] relative overflow-hidden">
              {/* Kop Surat Resmi */}
              <div className="text-center pb-6 border-b-2 border-[#8C6B1C] mb-8 space-y-1">
                <img
                  src="/logo/logo-vertikal.webp"
                  alt="Logo"
                  className="h-16 w-auto object-contain mx-auto mb-1.5"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/logo/Logo-vertikal.png";
                  }}
                />
                <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#8C6B1C] tracking-wide uppercase">
                  {clinicName}
                </h2>
                <p className="text-xs text-[#6B5E4E] mt-1 leading-relaxed">
                  {clinicAddress}
                </p>
                <p className="text-[11px] text-[#8A7B6B] mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
                  <span>Telp: {clinicPhone}</span>
                  <span>Email: {clinicEmail}</span>
                  <span>WhatsApp: {clinicWhatsapp}</span>
                </p>
              </div>

              {/* Title & Document Badge */}
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8C6B1C] uppercase block mb-1">
                  SURAT PERNYATAAN & KETENTUAN LAYANAN
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#2D2821]">
                  {docTitle}
                </h3>
                <p className="text-xs text-[#7A6E60] mt-1">
                  Nomor Arsip / Versi: {docVersion}
                </p>
              </div>

              {/* Terms Dynamic Content Body from Admin Settings */}
              {loading ? (
                <div className="py-12 text-center text-sm text-[#7A6E60] font-medium">
                  Memuat data syarat dan ketentuan resmi...
                </div>
              ) : (
                <div
                  className="terms-rendered-content text-[#3A332A] text-xs sm:text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              )}

              {/* Footer Note Box */}
              <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-l-4 border-[#C9A24A] border border-[#E8DFC8] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8C6B1C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wide mb-0.5">
                    Pernyataan Persetujuan Pasien
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#6B5E4E] leading-relaxed">
                    {footerNote}
                  </p>
                </div>
              </div>

              {/* Signature Endorsement */}
              <div className="mt-10 pt-6 border-t border-[#F0E6D3] flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A7B6B] block">Diterbitkan Oleh</span>
                    <span className="text-xs font-bold text-[#2D2821]">Manajemen {clinicName}</span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[11px] text-[#8A7B6B] block">
                    Disahkan di Jakarta
                  </span>
                  <span className="text-xs font-semibold text-[#8C6B1C]">
                    Dokumen Sah Sistem Elektronik
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Assistance Contact Card */}
            <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EA] border border-[#EADBBD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-xs">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2821]">
                    Memiliki Pertanyaan Seputar Syarat Layanan?
                  </h4>
                  <p className="text-xs text-[#7A6E60] mt-0.5">
                    Tim administrasi dan customer service kami siap membantu Anda.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/${clinicWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  "Halo Admin Aesthetic Pondok Indah, saya ingin menanyakan perihal syarat dan ketentuan layanan klinik."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
