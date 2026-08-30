import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  X,
  Printer,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface TermsPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (name?: string) => void;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialSignature?: string | null;
  isAgreed?: boolean;
  showAcceptButton?: boolean;
  readOnly?: boolean;
}

export default function TermsPdfModal({
  isOpen,
  onClose,
  onAccept,
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  initialSignature,
  isAgreed = false,
  showAcceptButton = true,
  readOnly,
}: TermsPdfModalProps) {
  const isReadOnly = readOnly || !onAccept || !showAcceptButton;
  const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [customTerms, setCustomTerms] = useState<any>(null);

  // In-modal form state (Checkbox & Name only)
  const [fullName, setFullName] = useState(initialName);
  const [agreed, setAgreed] = useState(isAgreed);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialName) setFullName(initialName);
    setAgreed(isAgreed);
  }, [initialName, isAgreed]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      getPublicClinicSettings()
        .then((settings: any) => {
          if (settings.pdf_terms_and_conditions) {
            setCustomTerms(settings.pdf_terms_and_conditions);
          }
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSubmitAgreement = () => {
    if (!agreed) {
      setErrorMessage("Harap centang kotak persetujuan Syarat dan Ketentuan.");
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage("Harap lengkapi nama Anda.");
      return;
    }

    if (onAccept) {
      onAccept(fullName.trim());
    }
    onClose();
  };

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
          <title>Syarat dan Ketentuan - Aesthetic Pondok Indah</title>
          <style>
            @page {
              size: letter portrait;
              margin: 15mm 15mm;
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
              gap: 14px;
              padding-bottom: 10px;
              margin-bottom: 14px;
              border-bottom: 3px double #000;
              text-align: center;
            }
            .kop-logo {
              width: 50px;
              height: 50px;
              object-fit: contain;
            .kop-header {
              text-align: center;
              border-bottom: 2.5px solid #000;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .kop-logo {
              height: 48px;
              width: auto;
              margin: 0 auto 6px auto;
              display: block;
            }
            .kop-title {
              font-size: 13pt;
              font-weight: 800;
              color: #000;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin: 0;
            }
            .kop-address {
              font-size: 7.5pt;
              color: #333;
              margin-top: 4px;
              line-height: 1.35;
            }
            .doc-header {
              text-align: center;
              margin-bottom: 16px;
            }
            .doc-title {
              font-size: 13pt;
              font-weight: 800;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .doc-sub {
              font-size: 8.5pt;
              color: #555;
              margin-top: 4px;
            }
            .clause {
              margin-bottom: 12px;
            }
            .clause-title {
              font-size: 9.5pt;
              font-weight: 700;
              color: #000;
              margin-bottom: 3px;
            }
            .clause-text {
              font-size: 9pt;
              color: #222;
              line-height: 1.45;
              text-align: justify;
              margin: 0;
            }
            .clause-list {
              margin: 4px 0 0 0;
              padding-left: 18px;
              font-size: 9pt;
              color: #222;
            }
            .clause-list li {
              margin-bottom: 2px;
            }
            .signature-section {
              margin-top: 24px;
              padding-top: 14px;
              border-top: 1px solid #ccc;
            }
            .sig-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .sig-name {
              font-weight: 700;
              text-decoration: underline;
              margin-top: 6px;
              font-size: 9pt;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <img src="/logo/logo-vertikal.webp" class="kop-logo" alt="Logo" />
            <div class="kop-title">Aesthetic Pondok Indah</div>
            <div class="kop-address">
              Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310<br/>
              Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com
            </div>
          </div>

          <div class="doc-header">
            <h1 class="doc-title">Syarat dan Ketentuan</h1>
            <div class="doc-sub">Harap baca dan kirim konfirmasi persetujuan Anda di bawah...</div>
          </div>

          <div class="clause">
            <div class="clause-title">1. Penerimaan Persyaratan</div>
            <p class="clause-text">Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">2. Deskripsi Layanan</div>
            <p class="clause-text">Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan.</p>
          </div>

          <div class="clause">
            <div class="clause-title">3. Akun Pengguna</div>
            <p class="clause-text">Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda.</p>
          </div>

          <div class="clause">
            <div class="clause-title">4. Perilaku Pengguna</div>
            <p class="clause-text">Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:</p>
            <ul class="clause-list">
              <li>Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain</li>
              <li>Melanggar hak pihak ketiga</li>
              <li>Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik</li>
              <li>Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya</li>
            </ul>
          </div>

          <div class="clause">
            <div class="clause-title">5. Hak Kekayaan Intelektual</div>
            <p class="clause-text">Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya.</p>
          </div>

          <div class="clause">
            <div class="clause-title">6. Batasan Tanggung Jawab</div>
            <p class="clause-text">Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">7. Ganti Rugi</div>
            <p class="clause-text">Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.</p>
          </div>

          <div class="clause">
            <div class="clause-title">8. Hukum yang Mengatur</div>
            <p class="clause-text">Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.</p>
          </div>

          <div class="clause">
            <div class="clause-title">9. Perubahan Syarat dan Ketentuan</div>
            <p class="clause-text">Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru.</p>
          </div>

          <div class="signature-section">
            <div class="sig-row">
              <div style="font-size: 8.5pt; color: #444;">
                Status: <strong>✓ Disetujui Secara Digital (Ceklis Persetujuan Pasien)</strong><br/>
                Waktu: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
              </div>
              <div style="text-align: right;">
                <div style="font-size: 8pt; color: #555;">Disetujui oleh:</div>
                <div class="sig-name">${fullName || "Pasien"}</div>
              </div>
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
    }, 350);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-black leading-tight">
                Syarat dan Ketentuan
              </h3>
              <p className="text-[11px] text-gray-500">
                Dokumen Resmi Syarat dan Ketentuan Layanan Pasien
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrint}
              className="h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100 shadow-xs cursor-pointer"
              title="Cetak / Simpan Dokumen"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all shadow-xs cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Body - Letter Size Proportion, Pure B&W Letter Style */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5] overscroll-contain">
          <div className="max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans">
            {/* Formal Letterhead (Header Kop Surat) with Centered Clinic Logo */}
            <div className="border-b-2 border-black pb-3.5 text-center space-y-1" style={{ borderBottom: "3px double #000" }}>
              <img
                src="/logo/logo-vertikal.webp"
                alt="Aesthetic Pondok Indah"
                className="h-14 sm:h-16 w-auto object-contain mx-auto mb-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo/Logo-vertikal.png";
                }}
              />
              <h1 className="text-base sm:text-lg font-bold text-black tracking-wider uppercase leading-tight">
                Aesthetic Pondok Indah
              </h1>
              <p className="text-[10px] text-gray-700 leading-snug pt-0.5">
                Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310<br />
                Telepon: 021-7695948 | WhatsApp: 0812-3456-7890 | Email: aesthetic.pondokindah@gmail.com
              </p>
            </div>

            {/* Document Title Header */}
            <div className="text-center space-y-0.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Syarat dan Ketentuan
              </h2>
              <p className="text-xs text-gray-600">
                Harap baca dan berikan tanda centang persetujuan Anda di bawah ini
              </p>
            </div>

            {/* Standard Letter Clauses 1 - 9 */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left">
              {/* 1 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  1. Penerimaan Persyaratan
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, Anda tidak boleh mengakses atau menggunakan layanan kami.
                </p>
              </div>

              {/* 2 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  2. Deskripsi Layanan
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Layanan kami meliputi pemeriksaan klinis, konsultasi medis, dan tindakan perawatan gigi estetik maupun spesialis. Kami berhak mengubah, menangguhkan, atau menghentikan setiap aspek layanan kami kapan saja, dengan atau tanpa pemberitahuan.
                </p>
              </div>

              {/* 3 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  3. Akun Pengguna
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Anda mungkin diminta membuat akun atau melengkapi data identitas untuk mengakses fitur layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan data serta membatasi akses ke akun Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di akun Anda.
                </p>
              </div>

              {/* 4 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  4. Perilaku Pengguna
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Anda setuju untuk tidak menggunakan layanan kami untuk tujuan yang melanggar hukum atau dengan cara apa pun yang melanggar Persyaratan dan Ketentuan ini. Anda juga setuju untuk tidak:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-xs sm:text-[13px] text-gray-800 pt-0.5">
                  <li>Mengganggu, menyalahgunakan, atau menyakiti pengguna atau staf medis lain</li>
                  <li>Melanggar hak pihak ketiga</li>
                  <li>Mengganggu atau mengacaukan pengoperasian sistem dan layanan klinik</li>
                  <li>Menggunakan layanan kami untuk tujuan komersial tanpa persetujuan tertulis kami sebelumnya</li>
                </ul>
              </div>

              {/* 5 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  5. Hak Kekayaan Intelektual
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Semua konten dan materi yang tersedia di layanan kami, termasuk namun tidak terbatas pada teks, grafik, logo, gambar, rekam medis digital, dan perangkat lunak, adalah milik Aesthetic Pondok Indah atau pemberi lisensinya dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya.
                </p>
              </div>

              {/* 6 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  6. Batasan Tanggung Jawab
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Sejauh diizinkan oleh hukum, Aesthetic Pondok Indah tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.
                </p>
              </div>

              {/* 7 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  7. Ganti Rugi
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Anda setuju untuk mengganti kerugian dan membebaskan Aesthetic Pondok Indah, afiliasinya, pejabatnya, direkturnya, karyawannya, dan agennya dari dan terhadap segala tuntutan, kewajiban, kerusakan, kerugian, atau biaya yang timbul dari atau dengan cara apa pun terkait dengan penggunaan layanan kami.
                </p>
              </div>

              {/* 8 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  8. Hukum yang Mengatur
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Syarat dan Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.
                </p>
              </div>

              {/* 9 */}
              <div className="space-y-1">
                <h3 className="font-bold text-black text-xs sm:text-sm">
                  9. Perubahan Syarat dan Ketentuan
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-800 text-justify">
                  Kami berhak memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan layanan kami secara terus-menerus setelah perubahan tersebut merupakan bentuk penerimaan Anda terhadap Syarat dan Ketentuan yang baru.
                </p>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="pt-6 border-t-2 border-gray-300 space-y-4">
              {isReadOnly ? (
                /* READ-ONLY / HISTORY PREVIEW MODE */
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Status Persetujuan Ketentuan
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span>Syarat & Ketentuan Layanan Telah Disetujui</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Terverifikasi
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={onClose}
                      className="w-full h-11 rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95"
                    >
                      <span>Tutup</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* EDITABLE / NEW BOOKING APPROVAL MODE */
                <>
                  {/* Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        setErrorMessage(null);
                      }}
                      className="mt-0.5 w-4 h-4 rounded border-gray-400 text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-gray-900 leading-snug">
                      Saya telah membaca, memahami, dan menyetujui seluruh <strong className="underline">Syarat dan Ketentuan Layanan Pasien</strong> klinik Aesthetic Pondok Indah di atas. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Nama Lengkap Pasien <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Button (Ceklis / Setujui S&K) */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleSubmitAgreement}
                      className="w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Saya Menyetujui Syarat & Ketentuan</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
