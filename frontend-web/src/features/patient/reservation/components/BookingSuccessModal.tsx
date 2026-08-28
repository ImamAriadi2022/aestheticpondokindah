import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, User, Sparkles, Calendar, Clock, ArrowRight, MapPin, Ticket, X, MessageCircle } from "lucide-react";
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
  bookingData,
}: BookingSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedCode =
    bookingData.code ||
    `#RSV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md lg:max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADBBD] text-center space-y-4 animate-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E6DECB] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all cursor-pointer shadow-2xs"
          title="Tutup & Ke Riwayat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Success Badge */}
        <div className="flex justify-center pt-1">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#FAF5EA] border-4 border-[#F2E8CF] flex items-center justify-center text-[#8C6B1C] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#8C6B1C] text-white flex items-center justify-center shadow-md">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Heading & Subheading */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#2C2416]">
            Reservasi Berhasil Dibuat!
          </h3>
          <p className="text-xs text-[#7C7365]">
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

        {/* WhatsApp Notice Box */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-emerald-900">
          <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Format pesan konfirmasi otomatis telah diteruskan ke <strong>WhatsApp Admin Klinik</strong> untuk verifikasi jadwal.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-4 text-left space-y-2.5 divide-y divide-[#EDE5D6] text-xs">
          {/* Doctor Info */}
          <div className="flex items-start gap-3 pt-0">
            <div className="w-7 h-7 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Dokter Spesialis
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#2C2416]">
                {bookingData.doctorName || "Dokter Gigi Spesialis"}
              </p>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="flex items-start justify-between gap-2 pt-2.5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                  Tanggal
                </p>
                <p className="text-xs font-bold text-[#2C2416]">
                  {bookingData.displayDate || bookingData.date}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Waktu
              </p>
              <p className="text-xs font-bold text-[#8C6B1C]">
                {bookingData.time} WIB
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-start gap-3 pt-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5 border border-[#D9D0BC]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8C8272] uppercase tracking-wider">
                Lokasi Klinik
              </p>
              <p className="text-xs font-bold text-[#2C2416]">
                Aesthetic Pondok Indah, Jakarta Selatan
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={onViewETicket}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Lihat Detail Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] font-semibold text-xs transition-all cursor-pointer"
          >
            Lihat Riwayat Reservasi Saya
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

