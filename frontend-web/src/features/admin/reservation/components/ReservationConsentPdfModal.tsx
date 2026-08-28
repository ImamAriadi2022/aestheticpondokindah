import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  X,
  Printer,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface ReservationConsentPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  isGuest?: boolean;
  serviceName?: string;
  doctorName?: string;
  dateStr?: string;
  timeStr?: string;
  signatureData?: string | null;
  acceptedAt?: string | null;
  onSaveSignature?: (signatureDataUrl: string) => void;
  onAccept?: (signatureDataUrl: string) => void;
}

export default function ReservationConsentPdfModal({
  isOpen,
  onClose,
  bookingCode = "API-REG",
  patientName = "Pasien",
  patientPhone = "",
  patientEmail = "",
  isGuest = false,
  serviceName = "Pemeriksaan & Konsultasi Gigi",
  doctorName = "Dokter Spesialis Gigi",
  dateStr = "Hari Ini",
  timeStr = "10:00",
  signatureData: initialSignatureData = null,
  acceptedAt,
  onSaveSignature,
  onAccept,
}: ReservationConsentPdfModalProps) {
  const [adminTerms, setAdminTerms] = useState<string | null>(null);
  const [customConsent, setCustomConsent] = useState<any>(null);

  // In-modal form state
  const [fullName, setFullName] = useState(patientName);
  const [phoneOrEmail, setPhoneOrEmail] = useState(patientPhone || patientEmail);
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-modal canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignatureData));
  const [currentSignature, setCurrentSignature] = useState<string | null>(initialSignatureData || null);

  useEffect(() => {
    if (patientName) setFullName(patientName);
    if (patientPhone || patientEmail) setPhoneOrEmail(patientPhone || patientEmail);
    if (initialSignatureData) {
      setCurrentSignature(initialSignatureData);
      setHasDrawn(true);
    }
  }, [patientName, patientPhone, patientEmail, initialSignatureData]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
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

      // Initialize canvas if editable
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

        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (initialSignatureData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            setHasDrawn(true);
          };
          img.src = initialSignatureData;
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialSignatureData]);

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

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setErrorMessage(null);
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
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setCurrentSignature(null);
  };

  const handleSubmitAgreement = () => {
    if (!fullName.trim()) {
      setErrorMessage("Harap lengkapi nama pasien / wali sah.");
      return;
    }
    if (!hasDrawn && !currentSignature) {
      setErrorMessage("Harap bubuhkan tanda tangan digital Anda pada area tanda tangan.");
      return;
    }

    let finalSig: string | undefined;
    if (canvasRef.current && hasDrawn) {
      finalSig = canvasRef.current.toDataURL("image/png");
    } else if (currentSignature) {
      finalSig = currentSignature;
    }

    if (onSaveSignature && finalSig) {
      onSaveSignature(finalSig);
    }
    if (onAccept && finalSig) {
      onAccept(finalSig);
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
          <title>Surat Persetujuan Pasien (Informed Consent) - Aesthetic Pondok Indah</title>
          <style>
            @page { size: letter portrait; margin: 15mm 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 0; font-size: 9.5pt; background: #fff; }
            .kop-header { display: flex; align-items: center; justify-content: center; gap: 14px; padding-bottom: 10px; margin-bottom: 14px; border-bottom: 3px double #000; text-align: center; }
            .kop-logo { width: 50px; height: 50px; object-fit: contain; flex-shrink: 0; }
            .kop-details { text-align: center; }
            .kop-title { font-size: 12.5pt; font-weight: 900; color: #000; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
            .kop-sub { font-size: 8.5pt; font-weight: 700; color: #222; margin: 2px 0 0 0; }
            .kop-address { font-size: 7.5pt; color: #333; margin-top: 3px; line-height: 1.3; }
            .doc-header { text-align: center; margin-bottom: 16px; }
            .doc-title { font-size: 12pt; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
            .doc-sub { font-size: 8.5pt; color: #555; margin-top: 4px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 8.5pt; border: 1px solid #333; }
            .meta-table td { padding: 5px 8px; border: 1px solid #333; }
            .clause { margin-bottom: 11px; }
            .clause-title { font-size: 9.5pt; font-weight: 700; color: #000; margin-bottom: 3px; }
            .clause-text { font-size: 9pt; color: #222; line-height: 1.45; text-align: justify; margin: 0; }
            .signature-section { margin-top: 24px; padding-top: 14px; border-top: 1px solid #ccc; }
            .sig-row { display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-box { text-align: center; width: 220px; }
            .sig-img { max-height: 60px; max-width: 180px; object-fit: contain; margin: 6px auto; display: block; }
            .sig-name { font-weight: 700; text-decoration: underline; margin-top: 6px; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <div class="kop-details">
              <div class="kop-title">Aesthetic Pondok Indah Dental Clinic</div>
              <div class="kop-sub">PT NAVENA INTERNATIONAL GROUP</div>
              <div class="kop-address">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br/>
                Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890
              </div>
            </div>
          </div>
          <div class="doc-header">
            <h1 class="doc-title">Surat Pernyataan & Persetujuan Pasien (Informed Consent)</h1>
            <div class="doc-sub">No. Registrasi: API-CONSENT-${bookingCode}</div>
          </div>
          <table class="meta-table">
            <tr>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Nama Pasien</td>
              <td style="width: 30%;">${patientName}</td>
              <td style="width: 20%; font-weight: bold; background: #f8f8f8;">Layanan</td>
              <td style="width: 30%;">${serviceName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; background: #f8f8f8;">No. WhatsApp</td>
              <td>${patientPhone || "-"}</td>
              <td style="font-weight: bold; background: #f8f8f8;">Dokter</td>
              <td>${doctorName}</td>
            </tr>
          </table>
          <div class="clause">
            <div class="clause-title">1. Persetujuan Pemeriksaan & Tindakan Medis Gigi</div>
            <p class="clause-text">Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis.</p>
          </div>
          <div class="clause">
            <div class="clause-title">2. Keterbukaan Riwayat Kesehatan & Anamnesis</div>
            <p class="clause-text">Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya.</p>
          </div>
          <div class="clause">
            <div class="clause-title">3. Kerahasiaan Data & Rekam Medis Elektronik</div>
            <p class="clause-text">Seluruh data rekam medis, dokumentasi intraoral, dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI.</p>
          </div>
          <div class="signature-section">
            <div class="sig-row">
              <div style="font-size: 8.5pt; color: #444;">
                Status: <strong>✓ Disetujui Secara Digital</strong><br/>
                Waktu: ${formattedDate}
              </div>
              <div class="sig-box">
                <div style="font-size: 8pt; font-weight: bold; color: #222;">Tanda Tangan Pasien:</div>
                ${hasDrawn ? `<img src="${canvasRef.current?.toDataURL("image/png")}" class="sig-img" alt="Tanda Tangan" />` : (initialSignatureData ? `<img src="${initialSignatureData}" class="sig-img" alt="Tanda Tangan" />` : '<div style="height: 45px;"></div>')}
                <div class="sig-name">${fullName || patientName}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[94vh] flex flex-col p-0 rounded-3xl bg-[#F5F5F5] border border-[#D9D0BC] shadow-2xl text-left">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white border-b border-gray-200 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center border border-gray-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-black leading-tight">
                Surat Persetujuan Pasien (Informed Consent)
              </DialogTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handlePrint} className="h-9 w-9 rounded-xl bg-white border-gray-300 text-gray-800 hover:bg-gray-100">
              <Printer className="w-4 h-4" />
            </Button>
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECEAE5]">
          <div className="max-w-[680px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-300 text-black space-y-6 font-sans">
            <div className="border-b-2 border-black pb-4 text-center space-y-1" style={{ borderBottom: "3px double #000" }}>
              <div className="flex items-center justify-center gap-3">
                <img
                  src="/logo/logo.webp"
                  alt="Aesthetic Pondok Indah"
                  className="h-12 w-auto object-contain shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="text-left">
                  <h1 className="text-base sm:text-lg font-black text-black tracking-wider uppercase leading-tight">
                    AESTHETIC PONDOK INDAH DENTAL CLINIC
                  </h1>
                  <p className="text-[11px] font-bold text-gray-800">
                    PT NAVENA INTERNATIONAL GROUP
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-gray-700 leading-snug pt-1">
                Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310<br />
                Telepon: (021) 765-4321 | WhatsApp: 0812-3456-7890 | Email: info@aestheticpondokindah.id
              </p>
            </div>

            <div className="text-center space-y-0.5 pt-1">
              <h2 className="text-lg font-bold text-black uppercase">Surat Pernyataan & Persetujuan Pasien (Informed Consent)</h2>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
                <div className="p-3 space-y-1 bg-gray-50/50">
                  <p><strong className="text-black">Nama:</strong> {patientName}</p>
                  <p><strong className="text-black">No. WA:</strong> {patientPhone || "-"}</p>
                </div>
                <div className="p-3 space-y-1 bg-gray-50/50">
                  <p><strong className="text-black">Layanan:</strong> {serviceName}</p>
                  <p><strong className="text-black">Dokter:</strong> {doctorName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed text-left">
              {[
                { title: "1. Persetujuan Pemeriksaan & Tindakan Medis Gigi", text: "Saya memberikan persetujuan penuh kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan fisik rongga mulut, diagnostik klinis, serta tindakan perawatan gigi sesuai prosedur medis yang disepakati." },
                { title: "2. Keterbukaan Riwayat Kesehatan & Anamnesis", text: "Saya menyatakan telah memberikan informasi riwayat kesehatan, penyakit bawaan, alergi obat, atau kondisi kesehatan yang sebenarnya." },
                { title: "3. Ketentuan Penjadwalan & Waktu Kedatangan", text: "Saya memahami kewajiban hadir di klinik minimal 15 (lima belas) menit sebelum waktu reservasi. Keterlambatan lebih dari 15 menit dapat mengakibatkan penyesuaian durasi atau penjadwalan ulang." },
                { title: "4. Kerahasiaan Data & Rekam Medis Elektronik", text: "Seluruh data rekam medis dan hasil rontgen dilindungi kerahasiaannya sesuai peraturan perundang-undangan kesehatan RI." },
                { title: "5. Kebijakan Pembayaran & Pembatalan", text: "Saya bersedia menyelesaikan kewajiban pembayaran tindakan sesuai tarif resmi yang disetujui sebelum tindakan dilakukan." }
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <h3 className="font-bold text-black text-xs sm:text-sm">{c.title}</h3>
                  <p className="text-xs sm:text-[13px] text-gray-800 text-justify">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t-2 border-gray-300 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800">
                  Nama Pasien / Wali Sah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap pasien / wali sah"
                  className="w-full h-10 px-3.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Tanda Tangan Digital Pasien <span className="text-red-500">*</span>
                  </label>
                  {(hasDrawn || currentSignature) && (
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="text-[11px] font-semibold text-gray-500 hover:text-red-600 underline cursor-pointer"
                    >
                      Clear / Ganti Tanda Tangan
                    </button>
                  )}
                </div>
                <div className="relative border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  {!hasDrawn && !isDrawing && !currentSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs">
                      <span>Sign Here (Goreskan tanda tangan Anda di sini)</span>
                    </div>
                  )}
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
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <Button
                type="button"
                onClick={handleSubmitAgreement}
                className="w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00914c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Kirim & Simpan Tanda Tangan</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
