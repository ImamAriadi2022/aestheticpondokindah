import React from "react";
import { Check, User, Sparkles, Calendar, Clock, ArrowRight, MapPin, Ticket, X } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewETicket: () => void;
  onGoHome: () => void;
  bookingData: {
    code?: string;
    doctorName: string;
    serviceName: string;
    date: string;
    displayDate?: string;
    time: string;
    branchName?: string;
    patientName?: string;
    totalAmount?: string | number;
  };
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  onViewETicket,
  onGoHome,
  bookingData,
}: BookingSuccessModalProps) {
  if (!isOpen) return null;

  const formattedCode =
    bookingData.code ||
    `#RSV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md lg:max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADBBD] text-center space-y-5 animate-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6DECB] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all cursor-pointer shadow-2xs"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Success Badge */}
        <div className="flex justify-center pt-1">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#FAF5EA] border-4 border-[#F2E8CF] flex items-center justify-center text-[#8C6B1C] shadow-sm">
            <div className="w-11 h-11 rounded-full bg-[#8C6B1C] text-white flex items-center justify-center shadow-md">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Heading & Subheading */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-[#2C2416]">
            Reservasi Berhasil Dibuat!
          </h3>
          <p className="text-xs sm:text-sm text-[#7C7365]">
            Jadwal konsultasi Anda telah resmi terdaftar di sistem klinik.
          </p>
        </div>

        {/* Booking Code Banner */}
        <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#8C6B1C] font-semibold">
            <Ticket className="w-3.5 h-3.5" />
            <span>Kode Booking:</span>
          </div>
          <span className="font-mono text-sm font-bold text-[#2C2416] tracking-wider">
            {formattedCode}
          </span>
        </div>

        {/* Summary Card */}
        <div className="bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-4 sm:p-5 text-left space-y-3 divide-y divide-[#EDE5D6]">
          {/* Doctor Info */}
          <div className="flex items-start gap-3 pt-0">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Dokter Spesialis
              </p>
              <p className="text-sm font-bold text-[#2C2416]">
                {bookingData.doctorName || "Dokter Gigi Spesialis"}
              </p>
            </div>
          </div>

          {/* Service Info */}
          <div className="flex items-start gap-3 pt-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Layanan
              </p>
              <p className="text-sm font-bold text-[#2C2416]">
                {bookingData.serviceName || "Konsultasi & Perawatan Gigi"}
              </p>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="flex items-start justify-between gap-2 pt-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                  Tanggal
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#2C2416]">
                  {bookingData.displayDate || bookingData.date}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Waktu
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#8C6B1C]">
                {bookingData.time} WIB
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-start gap-3 pt-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Lokasi Klinik
              </p>
              <p className="text-xs font-bold text-[#2C2416]">
                Aesthetic Pondok Indah
              </p>
              <p className="text-[11px] text-[#7C7365]">
                Jl. Metro Pondok Indah Blok TB No. 12, Jakarta Selatan
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Button
            type="button"
            onClick={onViewETicket}
            className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lihat E-Tiket Reservasi</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onGoHome}
            className="w-full h-11 rounded-xl border border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Kembali ke Dashboard Utama
          </Button>
        </div>
      </div>
    </div>
  );
}
