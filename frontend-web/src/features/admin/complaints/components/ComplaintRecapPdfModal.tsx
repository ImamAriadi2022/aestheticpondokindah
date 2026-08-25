import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Printer, Download, FileText, CheckCircle2, Building2, ShieldCheck, X } from "lucide-react";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";

interface ComplaintRecapPdfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaints: any[];
}

export default function ComplaintRecapPdfModal({
  open,
  onOpenChange,
  complaints,
}: ComplaintRecapPdfModalProps) {
  const [clinicSettings, setClinicSettings] = useState<any>(null);

  useEffect(() => {
    if (open) {
      getPublicClinicSettings()
        .then((data) => setClinicSettings(data))
        .catch(() => {});
    }
  }, [open]);

  const kop = clinicSettings?.pdf_terms_and_conditions?.kopSurat || {
    clinicName: "Aesthetic Pondok Indah Dental Clinic",
    phone: "+62 812-3456-7890",
    email: "info@aestheticpondokindah.id",
    address: "Jl. Metro Pondok Indah Blok TB No. 27, Pondok Indah, Jakarta Selatan 12310",
    logoUrl: "/logo/logo.webp",
    logoWidth: 75,
    logoHeight: 75,
  };

  const total = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const processingCount = complaints.filter((c) => c.status === "processing" || c.status === "in_progress").length;
  const pendingCount = complaints.filter((c) => c.status === "pending" || !c.status).length;
  const resolvedPercent = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

    const rowsHtml = complaints.map((c, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 10px;">
        <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 6px 8px; font-family: monospace; font-weight: bold; color: #8C6B1C;">#${c.id}</td>
        <td style="padding: 6px 8px;">${c.date || '-'}</td>
        <td style="padding: 6px 8px; font-weight: bold;">${c.user?.name || c.patient_name || 'Pasien'}</td>
        <td style="padding: 6px 8px;">${c.category || 'Umum'}</td>
        <td style="padding: 6px 8px;">
          <strong>${c.title || c.subject || ''}</strong><br/>
          <span style="color: #4b5563;">${(c.description || '').substring(0, 120)}${(c.description || '').length > 120 ? '...' : ''}</span>
        </td>
        <td style="padding: 6px 8px;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: ${c.status === 'resolved' ? '#dcfce7; color: #15803d;' : c.status === 'processing' ? '#fef3c7; color: #b45309;' : '#f3f4f6; color: #374151;'};">
            ${c.status === 'resolved' ? 'SELESAI' : c.status === 'processing' ? 'DIPROSES' : 'MENUNGGU'}
          </span>
        </td>
        <td style="padding: 6px 8px; color: #1e293b;">
          ${c.adminResponse || c.admin_response || '<em style="color: #9ca3af;">Belum ada tanggapan</em>'}
        </td>
      </tr>
    `).join('');

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Pengaduan Pasien - ${kop.clinicName}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b; margin: 0; padding: 0; }
            .header-container { display: flex; align-items: center; justify-content: center; gap: 15px; border-bottom: 3px double #111; padding-bottom: 10px; margin-bottom: 12px; }
            .header-logo { width: ${kop.logoWidth || 75}px; height: ${kop.logoHeight || 75}px; object-fit: contain; }
            .header-text { text-align: center; }
            .header-title { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; margin: 0 0 2px 0; color: #1e293b; }
            .header-contact { font-size: 10px; color: #475569; margin: 1px 0; }
            .doc-title { text-align: center; margin: 14px 0 6px 0; }
            .doc-title h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
            .doc-title p { font-size: 10px; color: #64748b; margin: 2px 0 0 0; }
            .summary-cards { display: flex; gap: 10px; margin-bottom: 14px; }
            .card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc; }
            .card-title { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .card-val { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: left; }
            td { border: 1px solid #e2e8f0; }
            .sign-container { margin-top: 25px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign-box { width: 200px; text-align: center; font-size: 10px; }
            .sign-line { margin-top: 50px; border-bottom: 1px solid #333; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-container">
            ${kop.logoUrl ? `<img src="${kop.logoUrl}" class="header-logo" alt="Logo" />` : ''}
            <div class="header-text">
              <div class="header-title">${kop.clinicName}</div>
              <div class="header-contact">Telp: ${kop.phone} | Email: ${kop.email}</div>
              <div class="header-contact">${kop.address}</div>
            </div>
          </div>

          <div class="doc-title">
            <h2>Laporan Rekapitulasi Pengaduan & Aspirasi Pasien</h2>
            <p>Dicetak pada: ${currentDateStr} | Dokumen Resmi Manajemen Layanan Klinik</p>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Pengaduan</div>
              <div class="card-val">${total} Kasus</div>
            </div>
            <div class="card">
              <div class="card-title">Selesai Ditangani</div>
              <div class="card-val" style="color: #16a34a;">${resolvedCount} Kasus</div>
            </div>
            <div class="card">
              <div class="card-title">Sedang Diproses</div>
              <div class="card-val" style="color: #d97706;">${processingCount} Kasus</div>
            </div>
            <div class="card">
              <div class="card-title">Tingkat Penyelesaian</div>
              <div class="card-val" style="color: #8C6B1C;">${resolvedPercent}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 60px;">Tiket</th>
                <th style="width: 70px;">Tanggal</th>
                <th style="width: 100px;">Nama Pasien</th>
                <th style="width: 75px;">Kategori</th>
                <th>Judul & Uraian Masalah</th>
                <th style="width: 65px;">Status</th>
                <th>Tanggapan & Solusi Klinik</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="sign-container">
            <div class="sign-box">
              <p>Dibuat Oleh,<br/><strong>Petugas Customer Care</strong></p>
              <div class="sign-line">( Staff Pelayanan Pasien )</div>
            </div>

            <div class="sign-box">
              <p>Mengetahui & Menyetujui,<br/><strong>Pimpinan / Direktur Klinik</strong></p>
              <div class="sign-line">( Direktur Utama Klinik )</div>
            </div>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#F0E6D3] bg-white">
        <DialogHeader className="pb-3 border-b border-[#F0E6D3] flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C9A24A]" />
              Rekap Laporan Pengaduan Pasien (Export PDF)
            </DialogTitle>
            <p className="text-xs text-[#8A7B6B] mt-0.5">
              Pratinjau dokumen laporan rekapitulasi pengaduan sebelum dicetak / diekspor ke PDF untuk atasan klinik.
            </p>
          </div>
        </DialogHeader>

        {/* Live Document Preview */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4 my-2 text-left">
          {/* Header Kop */}
          <div className="flex items-center justify-center gap-4 border-b-2 border-double border-gray-900 pb-3 text-center">
            {kop.logoUrl && (
              <img
                src={kop.logoUrl}
                alt="Logo"
                style={{ width: `${kop.logoWidth || 70}px`, height: `${kop.logoHeight || 70}px` }}
                className="object-contain shrink-0"
              />
            )}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{kop.clinicName}</h3>
              <p className="text-[11px] text-gray-600">Telp: {kop.phone} | Email: {kop.email}</p>
              <p className="text-[10px] text-gray-500">{kop.address}</p>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
              LAPORAN REKAPITULASI PENGADUAN & ASPIRASI PASIEN
            </h4>
            <p className="text-[10px] text-gray-500">Tanggal Rekap: {currentDateStr}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500">Total Masuk</p>
              <p className="text-sm font-black text-gray-900">{total}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-[10px] font-bold text-emerald-600">Selesai</p>
              <p className="text-sm font-black text-emerald-700">{resolvedCount}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-[10px] font-bold text-amber-600">Diproses</p>
              <p className="text-sm font-black text-amber-700">{processingCount}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-[10px] font-bold text-[#8C6B1C]">Tingkat Solusi</p>
              <p className="text-sm font-black text-[#8C6B1C]">{resolvedPercent}%</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 border-b border-gray-200 text-[10px] font-bold text-gray-700 uppercase">
                <tr>
                  <th className="p-2 text-center">No</th>
                  <th className="p-2">Tiket</th>
                  <th className="p-2">Pasien</th>
                  <th className="p-2">Kategori & Judul</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Tanggapan Klinik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {complaints.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td className="p-2 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="p-2 font-mono font-bold text-[#8C6B1C]">#{c.id}</td>
                    <td className="p-2 font-semibold text-gray-900">{c.user?.name || c.patient_name || "Pasien"}</td>
                    <td className="p-2">
                      <span className="font-bold text-gray-800">[{c.category}]</span> {c.title || c.subject}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600 line-clamp-1">
                      {c.adminResponse || c.admin_response || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-[#F0E6D3] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-200 h-10 px-5 text-xs font-semibold"
          >
            Tutup
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-bold rounded-xl h-10 px-6 text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak / Simpan PDF Rekapitulasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
