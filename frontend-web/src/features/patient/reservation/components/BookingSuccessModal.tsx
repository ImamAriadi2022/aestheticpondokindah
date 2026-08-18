import React from "react";
import { Check, User, Sparkles, Calendar, Clock, ArrowRight } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADBBD] text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Top Success Badge */}
        <div className="flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF5EA] border-4 border-[#F2E8CF] flex items-center justify-center text-[#8C6B1C] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#8C6B1C] text-white flex items-center justify-center shadow-md">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Heading & Subheading */}
        <div className="space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-[#2C2416]">
            Booking Berhasil!
          </h3>
          <p className="text-xs sm:text-sm text-[#7C7365]">
            Jadwal konsultasi Anda telah berhasil dikonfirmasi.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-4 sm:p-5 text-left space-y-3.5 divide-y divide-[#EDE5D6]">
          {/* Doctor Info */}
          <div className="flex items-start gap-3 pt-0">
            <div className="w-8 h-8 rounded-full bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider">
                Dokter
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#2C2416]">
                {bookingData.doctorName || "Dokter Spesialis Gigi"}
              </p>
            </div>
          </div>

          {/* Service Info */}
          <div className="flex items-start gap-3 pt-3">
            <div className="w-8 h-8 rounded-full bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider">
                Layanan
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#2C2416]">
                {bookingData.serviceName || "Konsultasi & Perawatan Gigi"}
              </p>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="flex items-start justify-between gap-2 pt-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EFE9DC] text-[#8C6B1C] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider">
                  Tanggal
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#2C2416]">
                  {bookingData.displayDate || bookingData.date}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-medium text-[#8C8272] uppercase tracking-wider">
                Waktu
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#8C6B1C]">
                {bookingData.time} WIB
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            onClick={onViewETicket}
            className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-semibold text-sm sm:text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Lihat E-Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onGoHome}
            className="w-full h-12 rounded-xl border border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#8C6B1C]/10 font-semibold text-sm sm:text-base transition-all"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
