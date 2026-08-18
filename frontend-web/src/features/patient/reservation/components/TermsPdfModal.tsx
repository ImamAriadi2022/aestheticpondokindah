import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  Printer,
  Download,
  ShieldCheck,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-left">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                Syarat & Ketentuan Reservasi
              </h3>
              <p className="text-[11px] text-[#7C7365]">
                Dokumen Resmi Informed Consent & Kebijakan Klinik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#8C6B1C] hover:bg-[#EFE9DC] transition-all shadow-xs"
              title="Cetak / Simpan PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
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

        {/* Scrollable Formal PDF Document View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-50">
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-[#2C2416]">
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
              <div className="text-[10px] text-[#8C8272] pt-1">
                Ref. Dokumen: <span className="font-mono font-semibold">SK-CONSENT-2026/REV-03</span>
              </div>
            </div>

            {/* Admin Dynamic Terms Content if Present */}
            {adminTerms ? (
              <div className="space-y-4 text-xs sm:text-sm text-[#443E33] leading-relaxed whitespace-pre-line border-b border-[#EDE5D6] pb-5">
                <div className="font-semibold text-[#8C6B1C] text-xs uppercase tracking-wider">
                  Ketentuan Khusus Operasional:
                </div>
                {adminTerms}
              </div>
            ) : null}

            {/* Standard Legal & Clinical Clauses */}
            <div className="space-y-4 text-xs sm:text-sm text-[#443E33] leading-relaxed">
              {/* Pasal 1 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#2C2416]">
                  1. Ketentuan Kedatangan & Registrasi Pasien
                </h4>
                <p>
                  Pasien diwajibkan hadir di klinik sekurang-kurangnya <strong>15 (lima belas) menit</strong> sebelum waktu jadwal reservasi yang telah disepakati untuk keperluan verifikasi identitas, registrasi ulang, dan anamnesis awal.
                </p>
              </div>

              {/* Pasal 2 */}
              <div className="space-y-1.5">
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

              {/* Pasal 3 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#2C2416]">
                  3. Persetujuan Tindakan Medis (Informed Consent)
                </h4>
                <p>
                  Dengan menandatangani lembar persetujuan digital ini, pasien memberikan persetujuan kepada dokter gigi spesialis Aesthetic Pondok Indah untuk melakukan pemeriksaan klinis, tindakan diagnostik (termasuk foto rontgen gigi bila diperlukan), serta prosedur perawatan yang telah dijelaskan manfaat dan risikonya.
                </p>
              </div>

              {/* Pasal 4 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#2C2416]">
                  4. Kerahasiaan Rekam Medis & Privasi Pasien
                </h4>
                <p>
                  Seluruh data rekam medis elektronik (EMR), riwayat kesehatan, dan hasil pemeriksaan gigi pasien dilindungi kerahasiaannya sesuai dengan peraturan perundang-undangan kesehatan yang berlaku di Republik Indonesia.
                </p>
              </div>

              {/* Pasal 5 */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-[#2C2416]">
                  5. Pembayaran & Kebijakan Pembatalan
                </h4>
                <p>
                  Pembayaran biaya tindakan dapat dilakukan secara tunai, kartu debit/kredit, QRIS, atau transfer perbankan yang telah diverifikasi oleh kasir klinik. Pembatalan sepihak saat hari H tanpa alasan medis darurat dapat memengaruhi kuota prioritas booking berikutnya.
                </p>
              </div>
            </div>

            {/* Official Seal / Footer Note */}
            <div className="pt-4 border-t border-[#EDE5D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7C7365]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen Digital Tersertifikasi & Sah Secara Hukum Medikolegal</span>
              </div>
              <span className="text-[#A0988A]">Terakhir diperbarui: Agustus 2026</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold"
          >
            Tutup
          </Button>

          <Button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Saya Telah Membaca & Setuju</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
