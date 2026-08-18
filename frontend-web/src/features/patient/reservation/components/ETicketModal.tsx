import React from "react";
import {
  ArrowLeft,
  X,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Receipt,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Printer,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ETicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAgain: () => void;
  ticketData: {
    id?: string | number;
    code?: string;
    status: string; // 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'Selesai' | 'Baru'
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
  if (!isOpen) return null;

  const rawStatus = (ticketData.status || "confirmed").toLowerCase();
  const isCompleted = rawStatus === "selesai" || rawStatus === "completed";
  const isConfirmed = rawStatus === "dikonfirmasi" || rawStatus === "confirmed";
  const isCancelled = rawStatus === "dibatalkan" || rawStatus === "cancelled";

  const statusBadge = isCompleted ? (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8C6B1C] text-white">
      Selesai
    </span>
  ) : isConfirmed ? (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      Confirmed
    </span>
  ) : isCancelled ? (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
      Dibatalkan
    </span>
  ) : (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Menunggu
    </span>
  );

  const formattedId =
    ticketData.code ||
    (ticketData.id
      ? `#APP-${String(ticketData.id).padStart(6, "0")}`
      : "#APP-20261015-01");

  const formattedPrice =
    typeof ticketData.totalAmount === "number"
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(ticketData.totalAmount)
      : ticketData.totalAmount || "Rp 650.000";

  const handleDownloadInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#2C2416] hover:bg-[#EFE9DC] transition-all"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h3 className="text-lg sm:text-xl font-bold font-display text-[#2C2416]">
            Detail Riwayat
          </h3>

          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="w-9 h-9 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#8C6B1C] hover:bg-[#EFE9DC] transition-all"
            title="Cetak / Download"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
          {/* ID & Status Card */}
          <div className="bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider">
                ID Kunjungan
              </p>
              <p className="text-sm sm:text-base font-bold text-[#2C2416]">
                {formattedId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider mb-1">
                Status
              </p>
              {statusBadge}
            </div>
          </div>

          {/* Detail Kunjungan Card */}
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <h4 className="text-sm sm:text-base font-bold text-[#2C2416] border-b border-[#EDE5D6] pb-2">
              Detail Kunjungan
            </h4>

            <div className="space-y-3">
              {/* Doctor */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C8272]">Dokter</p>
                  <p className="text-sm font-semibold text-[#2C2416]">
                    {ticketData.doctorName}
                  </p>
                  {ticketData.specialization && (
                    <p className="text-xs text-[#8C6B1C]">
                      {ticketData.specialization}
                    </p>
                  )}
                </div>
              </div>

              {/* Service */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C8272]">Layanan</p>
                  <p className="text-sm font-semibold text-[#2C2416]">
                    {ticketData.serviceName}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C8272]">Lokasi Klinik</p>
                  <p className="text-sm font-semibold text-[#2C2416]">
                    {ticketData.locationName || "Pondok Indah Main Branch"}
                  </p>
                  <p className="text-xs text-[#7C7365]">
                    {ticketData.locationAddress ||
                      "Jl. Metro Pondok Indah Kav. IV, Jakarta Selatan"}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C8272]">Waktu</p>
                  <p className="text-sm font-semibold text-[#2C2416]">
                    {ticketData.displayDate || ticketData.date},{" "}
                    {ticketData.time} WIB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hasil Pemeriksaan (Rekam Medis Singkat) */}
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
            <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
              Hasil Pemeriksaan
            </h4>
            <div className="bg-[#FAF8F5] border border-[#EDE5D6] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#5C5546] leading-relaxed">
              {ticketData.examinationResult || (
                <>
                  Pasien datang untuk keluhan karang gigi ringan. Telah dilakukan
                  tindakan scaling secara menyeluruh pada rahang atas dan bawah.
                  Gusi tampak sehat, tidak ada indikasi gingivitis berat.
                  Disarankan untuk menggunakan pasta gigi khusus gigi sensitif
                  selama 3 hari ke depan dan menjaga rutinitas sikat gigi 2x
                  sehari.
                </>
              )}
            </div>
          </div>

          {/* Tagihan & Invoice Card */}
          <div className="bg-white border border-[#E6DECB] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
              Tagihan & Invoice
            </h4>

            <div className="flex items-center justify-between border-b border-[#EDE5D6] pb-3">
              <span className="text-xs sm:text-sm text-[#7C7365]">
                Total Biaya
              </span>
              <span className="text-base sm:text-lg font-bold text-[#8C6B1C]">
                {formattedPrice}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadInvoice}
              className="w-full h-11 rounded-xl border border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#8C6B1C]/10 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </Button>
          </div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="p-4 border-t border-[#EDE5D6] bg-white">
          <Button
            type="button"
            onClick={onBookAgain}
            className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-semibold text-sm sm:text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Booking Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
