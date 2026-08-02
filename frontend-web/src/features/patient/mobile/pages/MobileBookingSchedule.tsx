import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import NewMobileDashboardLayout from "@/core/layouts/NewMobileDashboardLayout";
import { Button } from "@/shared/ui/button";
import { 
  CalendarDays,
  Clock,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const days = [
  { date: 26, day: "Sen", fullDate: "2026-05-26" },
  { date: 27, day: "Sel", fullDate: "2026-05-27" },
  { date: 28, day: "Rab", fullDate: "2026-05-28" },
  { date: 29, day: "Kam", fullDate: "2026-05-29" },
  { date: 30, day: "Jum", fullDate: "2026-05-30" },
  { date: 31, day: "Sab", fullDate: "2026-05-31" },
];

const timeSlots = [
  { time: "09:00", available: true },
  { time: "09:30", available: false },
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: false },
  { time: "13:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: false },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: false },
  { time: "16:00", available: true },
];

const serviceNames: Record<string, string> = {
  konsultasi: "Konsultasi & Pemeriksaan",
  scaling: "Scaling / Pembersihan Karang Gigi",
  tambal: "Tambal Gigi",
  behel: "Behel (Orthodonti)",
  pembersihan: "Pembersihan Gigi",
  cabut: "Cabut Gigi",
};

const doctorNames: Record<string, string> = {
  "1": "drg. Jenny Wilson",
  "2": "drg. Alana Rusner",
  "3": "drg. Arvin Primera",
  "4": "drg. Sina Anrelia",
};

export default function MobileBookingSchedulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service") || "konsultasi";
  const doctorId = searchParams.get("doctor") || "1";
  
  const [selectedDate, setSelectedDate] = useState(days[0].fullDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedTime) {
      navigate(`/dashboard/user?tab=booking&step=konfirmasi&service=${serviceId}&doctor=${doctorId}&date=${selectedDate}&time=${selectedTime}`);
    }
  };

  const selectedDay = days.find(d => d.fullDate === selectedDate);

  return (
    <NewMobileDashboardLayout role="user" hideBottomNav>
      {/* Progress Steps */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-green-600">Layanan</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-green-600">Dokter</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#c9a24a] text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-xs font-medium text-[#c9a24a]">Jadwal</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <span className="text-xs font-medium text-gray-400">Konfirmasi</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Selected Info */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-600">{serviceNames[serviceId]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#c9a24a] rounded-full" />
            <span className="text-xs text-gray-600">{doctorNames[doctorId]}</span>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Pilih Jadwal</h1>
          <p className="text-sm text-gray-500">
            Pilih tanggal dan waktu yang tersedia
          </p>
        </div>

        {/* Date Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Mei 2026</h2>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day) => {
              const isSelected = selectedDate === day.fullDate;
              
              return (
                <button
                  key={day.fullDate}
                  onClick={() => setSelectedDate(day.fullDate)}
                  className={`flex flex-col items-center min-w-[56px] p-3 rounded-xl transition-all ${
                    isSelected 
                      ? "bg-[#c9a24a] text-white shadow-md" 
                      : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className={`text-xs mb-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                    {day.day}
                  </span>
                  <span className={`text-lg font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>
                    {day.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Pilih Waktu</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              
              return (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                    !slot.available
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#c9a24a] text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#c9a24a]"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#c9a24a] rounded" />
            <span className="text-gray-600">Dipilih</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded" />
            <span className="text-gray-600">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-100 rounded" />
            <span className="text-gray-600">Tidak tersedia</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto z-50">
        <Button
          onClick={handleContinue}
          disabled={!selectedTime}
          className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedTime ? "Lanjutkan" : "Pilih Waktu Terlebih Dahulu"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </NewMobileDashboardLayout>
  );
}
