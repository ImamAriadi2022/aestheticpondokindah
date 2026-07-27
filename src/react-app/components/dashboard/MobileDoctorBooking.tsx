import { useState } from "react";
import {
  ChevronLeft,
  Share2,
  Star,
  Check,
  Calendar,
  Clock,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Users,
  Award,
} from "lucide-react";

interface MobileDoctorBookingProps {
  doctorName: string;
  doctorTitle?: string;
  specialty?: string;
  rating?: number;
  patientsHelped?: string;
  doctorImage?: string;
  onBack?: () => void;
  onBook?: (date: Date, time: string) => void;
  onShare?: () => void;
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function MobileDoctorBooking({
  doctorName = "drg. Amanda S.",
  doctorTitle = "Sp.KG",
  specialty = "Dokter Gigi",
  rating = 4.9,
  patientsHelped = "190+",
  doctorImage = "/dokter/dokter1.jpeg",
  onBack,
  onBook,
  onShare,
}: MobileDoctorBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate a simple 7-day calendar starting from a reference date
  const generateCalendarDays = () => {
    const days: { date: Date; dayName: string; dayNum: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        date: d,
        dayName: DAYS[d.getDay()],
        dayNum: d.getDate(),
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const timeSlots = [
    "08:00", "09:00", "09:30", "10:00",
    "10:30", "11:00", "13:00", "14:00",
    "15:00", "16:00",
  ];

  const handleBook = () => {
    if (selectedDate && selectedTime && onBook) {
      onBook(selectedDate, selectedTime);
    }
  };

  const isFormValid = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={onShare}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Doctor Profile */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#C9A24A]/20 bg-gray-100 shrink-0">
            {doctorImage ? (
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-[#E8C547] fill-[#E8C547]" />
              <span className="text-sm font-bold text-gray-900">{rating}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {doctorName} <span className="text-sm font-semibold text-gray-600">{doctorTitle}</span>
            </h2>
            <p className="text-xs text-[#C9A24A] font-medium mt-0.5">{specialty}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{patientsHelped} Pasien Terbantu</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FDF8F0] rounded-full border border-[#C9A24A]/10">
            <Check className="w-3 h-3 text-[#C9A24A]" />
            <span className="text-[10px] font-medium text-[#5C4A32]">Ramah & Professional</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FDF8F0] rounded-full border border-[#C9A24A]/10">
            <Award className="w-3 h-3 text-[#C9A24A]" />
            <span className="text-[10px] font-medium text-[#5C4A32]">Berpengalaman</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FDF8F0] rounded-full border border-[#C9A24A]/10">
            <Star className="w-3 h-3 text-[#C9A24A]" />
            <span className="text-[10px] font-medium text-[#5C4A32]">Rating Tinggi</span>
          </div>
        </div>
      </div>

      {/* Date Picker */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#C9A24A]" />
          <h3 className="text-sm font-bold text-gray-900">Pilih Tanggal</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <p className="text-sm font-bold text-gray-900">
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
            <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {calendarDays.map((day, i) => {
              const isSelected =
                selectedDate &&
                day.date.toDateString() === selectedDate.toDateString();
              const isWeekend = day.dayName === "Min";
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center gap-1 min-w-[44px] py-2 rounded-xl transition-all ${
                    isSelected
                      ? "bg-[#C9A24A] text-white shadow-lg shadow-[#C9A24A]/25"
                      : isWeekend
                      ? "bg-gray-50 text-gray-400"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-[10px] font-medium">{day.dayName}</span>
                  <span className="text-sm font-bold">{day.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Picker */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A24A]" />
            <h3 className="text-sm font-bold text-gray-900">Pilih Waktu</h3>
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Waktu Tersedia • {timeSlots.length} Slot
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`relative py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#C9A24A] text-white shadow-md shadow-[#C9A24A]/20"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  {time}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Free Consultation Banner */}
      <div className="px-4 mb-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Gratis konsultasi awal</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              Dapatkan saran awal tanpa biaya tambahan
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Ringkasan Janji</h3>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Dokter</p>
              <p className="text-xs font-semibold text-gray-900">{doctorName}, {doctorTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Tanggal</p>
              <p className="text-xs font-semibold text-gray-900">
                {selectedDate
                  ? selectedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Waktu</p>
              <p className="text-xs font-semibold text-gray-900">{selectedTime || "-"} WIB</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Jenis</p>
              <p className="text-xs font-semibold text-gray-900">Konsultasi Cepat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
            <img
              src="/dashboard/sapadokter.png"
              alt="Support"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900">Butuh Bantuan?</p>
            <p className="text-[10px] text-gray-500">Chat dengan tim kami jika ada pertanyaan.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Book Button */}
      <div className="px-4 pb-8 pt-2">
        <button
          onClick={handleBook}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            isFormValid
              ? "bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white shadow-lg shadow-[#C9A24A]/25 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Booking Janji Sekarang</span>
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <ShieldCheck className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] text-gray-400">Aman & data Anda terlindungi</p>
        </div>
      </div>
    </div>
  );
}
