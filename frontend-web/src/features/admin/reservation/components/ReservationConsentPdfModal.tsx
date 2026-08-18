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

  useEffect(() => {
    if (isOpen) {
      getPublicClinicSettings()
        .then((settings) => {
          if (settings.booking_terms && settings.booking_terms.trim().length > 0) {
            setAdminTerms(settings.booking_terms);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : `${dateStr}, ${timeStr}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-left">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5] shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-xs">
              <FileText className="w-4 h-4 text-[#8C6B1C]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#2C2416]">
                Dokumen Persetujuan & Syarat Ketentuan Reservasi
              </h3>
              <p className="text-[11px] text-[#7C7365]">
                Surat Informed Consent Resmi Pasien #{bookingCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              className="h-8 px-3 rounded-xl border-[#D9D0BC] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              title="Cetak Dokumen"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Formal PDF Document Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-[#2C2416] print:border-none print:shadow-none print:p-0">
            {/* Official Letterhead Header */}
            <div className="border-b-2 border-[#2C2416] pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-[#8C6B1C] font-bold text-xs uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>Aesthetic Pondok Indah Dental Clinic</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-[#2C2416]">
                SURAT PERSETUJUAN & KEBIJAKAN RESERVASI KLINIK
              </h2>
              <p className="text-[11px] text-[#7C7365]">
                Jl. Metro Pondok Indah Kav. IV, Jakarta Selatan, 12310 • Telp: (021) 750-1234 / WhatsApp: +62 819-9011-4949
              </p>
              <div className="text-[10px] text-[#8C8272] pt-1 flex items-center justify-center gap-4">
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
                  <span className="text-[10px] px-1.5 py-0.2 bg-white rounded border border-[#D9D0BC] text-[#8C6B1C]">
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
              <div className="space-y-2 text-xs text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-4">
                <div className="font-bold text-[#8C6B1C] text-[11px] uppercase tracking-wider">
                  Ketentuan Khusus Operasional:
                </div>
                <p className="bg-[#FAF9F6] p-3 rounded-lg border border-[#EDE5D6]">{adminTerms}</p>
              </div>
            )}

            {/* Standard Legal Clauses */}
            <div className="space-y-3.5 text-xs text-[#443E33] leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-[#2C2416]">
                  1. Ketentuan Kedatangan & Registrasi Pasien
                </h4>
                <p>
                  Pasien diwajibkan hadir di klinik sekurang-kurangnya <strong>15 (lima belas) menit</strong> sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#2C2416]">
                  2. Kebijakan Keterlambatan & Penjadwalan Ulang (Reschedule)
                </h4>
                <p>
                  Apabila pasien mengalami keterlambatan lebih dari 15 menit dari jadwal yang telah ditentukan tanpa pemberitahuan sebelumnya, pihak klinik berhak mengalihkan antrean kepada pasien berikutnya atau menjadwalkan ulang demi kenyamanan bersama.
                </p>
                <p>
                  Permintaan perubahan jadwal (reschedule) dapat dilakukan bebas biaya dengan menghubungi petugas administrasi selambat-lambatnya <strong>1 x 24 jam</strong> sebelum jadwal tindakan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#2C2416]">
                  3. Persetujuan Tindakan Medis (Informed Consent)
                </h4>
                <p>
                  Dengan membubuhkan tanda tangan digital pada lembar ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#2C2416]">
                  4. Kerahasiaan Rekam Medis & Privasi Pasien
                </h4>
                <p>
                  Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.
                </p>
              </div>
            </div>

            {/* Official Digital Signature & Validation Block */}
            <div className="pt-6 border-t-2 border-[#2C2416] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
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

                <div className="w-full h-24 bg-white border border-[#D9D0BC] rounded-xl flex items-center justify-center p-2 shadow-inner">
                  {signatureData ? (
                    <img
                      src={signatureData}
                      alt={`Tanda Tangan ${patientName}`}
                      className="max-h-full max-w-full object-contain"
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
        <div className="p-4 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-2.5 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
