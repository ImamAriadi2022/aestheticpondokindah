import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Award, MapPin, MessageCircle, Stethoscope, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPublicDoctorSchedules, type PublicDoctorScheduleItem } from "@/features/doctors/services/publicDoctorScheduleApi";

interface Doctor {
  id: number;
  name: string;
  role: string;
  image: string;
  education: string;
  description: string;
  schedule?: string[];
  fellowship?: string[];
  organization?: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [liveSchedules, setLiveSchedules] = useState<PublicDoctorScheduleItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PublicDoctorScheduleItem | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingSchedule(true);
    getPublicDoctorSchedules()
      .then((items) => {
        if (!mounted) return;
        // Filter slots matching doctor name
        const doctorNameClean = doctor.name.toLowerCase().trim();
        const matched = items.filter(
          (s) =>
            s.doctorName &&
            (s.doctorName.toLowerCase().includes(doctorNameClean) ||
              doctorNameClean.includes(s.doctorName.toLowerCase()))
        );
        setLiveSchedules(matched.length > 0 ? matched : items.slice(0, 3));
        setLoadingSchedule(false);
      })
      .catch(() => {
        if (mounted) setLoadingSchedule(false);
      });

    return () => {
      mounted = false;
    };
  }, [doctor.name]);

  const fellowship = doctor.fellowship || [
    "Penn Endodontic Global Symposium 2025 - Lecture session",
    "Micro Dentistry: Ceramic and Composite Restoration",
    "HDI Scientific Seminar 'The Future of Dentistry'",
  ];

  const organization = doctor.organization || ["PDGI South Jakarta", "Lions Club"];

  const handleBookingRedirect = () => {
    const params = new URLSearchParams();
    params.set("doctor", doctor.name);
    if (selectedSlot) {
      params.set("date", selectedSlot.date);
      params.set("slot", selectedSlot.timeRange);
    }
    navigate(`/booking/new?${params.toString()}`);
  };

  return (
    <Dialog>
      <div
        className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(201,162,74,0.15)] border border-gray-100/80 hover:border-[#c9a24a]/20 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#c9a24a]/5 via-[#e8d4a2]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-3 sm:p-6 flex gap-3 sm:gap-6 relative">
          {/* Image Container - Modern with subtle effects */}
          <div className="relative flex-shrink-0">
            <div 
              className={`w-24 h-28 sm:w-32 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8f4ed] to-[#e8d4a2]/20 p-1 transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}
            >
              <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className={`w-full h-full object-cover object-top transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#c9a24a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-white rounded-full p-0.5 sm:p-1 shadow-lg">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center">
                <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[100px] sm:min-h-[160px]">
            {/* Name with elegant styling */}
            <div className="mb-1.5 sm:mb-3">
              <Badge 
                variant="outline" 
                className="mb-1 sm:mb-2 px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-semibold tracking-wider uppercase bg-[#c9a24a]/10 text-[#c9a24a] border-[#c9a24a]/20 rounded-full"
              >
                Dental Profile
              </Badge>
              <h3 className="text-sm sm:text-lg font-bold text-[#c9a24a] leading-tight group-hover:text-[#b8923f] transition-colors duration-300">
                {doctor.name}
              </h3>
            </div>

            {/* Specialization with icon */}
            <div className="flex items-start gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#c9a24a]" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-700 font-medium leading-relaxed">{doctor.role}</span>
            </div>

            {/* Education with icon */}
            <div className="flex items-start gap-1.5 sm:gap-2.5 mb-2 sm:mb-4">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#c9a24a]" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">{doctor.education}</span>
            </div>

            {/* Spacer to push buttons to bottom */}
            <div className="flex-grow" />

            {/* Buttons - Modern styling */}
            <div className="flex items-center gap-2 sm:gap-3">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#c9a24a]/40 text-[#c9a24a] hover:bg-[#c9a24a] hover:text-white hover:border-[#c9a24a] font-body text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 h-auto transition-all duration-300 group/btn"
                >
                  <span className="hidden sm:inline">Learn More</span>
                  <span className="sm:hidden">More</span>
                  <ChevronRight className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </Button>
              </DialogTrigger>
              <Link
                to="/login"
                className="flex-1"
              >
                <Button
                  size="sm"
                  className="w-full rounded-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-body text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 h-auto transition-all duration-300 shadow-lg shadow-[#c9a24a]/20 hover:shadow-[#c9a24a]/30"
                >
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Konsultasi</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#c9a24a] to-[#e8d4a2] group-hover:w-full transition-all duration-500" />
      </div>

      {/* Modal Content - Same structure as Service Modal */}
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl p-0 max-h-[calc(100vh-2rem)] overflow-y-auto lg:overflow-hidden rounded-3xl border-0">
        <div className="h-full overflow-y-auto">
          <div className="grid lg:grid-cols-2">
            {/* Doctor Image - Left Side */}
            <div className="bg-gradient-to-br from-[#f8f4ed] to-[#e8d4a2]/30">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-full w-full object-cover object-top aspect-[4/3] lg:aspect-auto min-h-[300px] lg:min-h-full"
              />
            </div>

            {/* Content - Right Side */}
            <div className="p-6 sm:p-10 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8f4ed] rounded-full mb-5">
                <span className="text-xs font-semibold text-[#c9a24a] font-body tracking-wider uppercase">Aesthetic Pondok Indah</span>
              </div>

              {/* Doctor Name */}
              <DialogTitle asChild>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#c9a24a]">
                  {doctor.name}
                </h3>
              </DialogTitle>

              {/* Divider */}
              <div className="h-px bg-[#c9a24a]/25 my-6" />

              {/* Specialty */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">Specialty</h4>
                <p className="text-sm text-gray-700 font-body leading-relaxed">{doctor.role}</p>
              </div>

              {/* Education */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">Education</h4>
                <p className="text-sm text-gray-600 font-body leading-relaxed">{doctor.education}</p>
              </div>

              {/* Live Schedule & Available Slots */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jadwal & Kuota Praktik
                </h4>
                {loadingSchedule ? (
                  <div className="text-xs text-gray-500 py-2">Memuat jadwal dokter...</div>
                ) : liveSchedules.length === 0 ? (
                  <div className="text-xs text-gray-500 py-2 bg-[#f8f6f3] rounded-xl p-3">
                    Belum ada jadwal tersedia untuk dokter ini.
                  </div>
                ) : (
                  <div className="bg-[#f8f6f3] rounded-xl p-3 sm:p-4 space-y-2">
                    {liveSchedules.map((slot) => {
                      const disabled = slot.isFull || slot.slotsLeft <= 0;
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-all flex justify-between items-center ${
                            disabled
                              ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed text-gray-400"
                              : isSelected
                              ? "bg-[#c9a24a]/15 border-[#c9a24a] ring-1 ring-[#c9a24a]"
                              : "bg-white border-gray-200 hover:border-[#c9a24a]/50 text-gray-700"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-gray-800">
                              {slot.displayDate || slot.date} ({slot.location})
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#c9a24a]" />
                              <span>{slot.timeRange}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {disabled ? (
                              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">
                                Penuh
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                {slot.slotsLeft} slot tersisa
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Fellowship */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">Fellowship</h4>
                <ul className="space-y-2">
                  {fellowship.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c9a24a] mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organization */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">Organization</h4>
                <ul className="space-y-2">
                  {organization.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c9a24a] mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buat Janji / Konsultasi Button */}
              <Button
                size="lg"
                onClick={handleBookingRedirect}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold px-8 shadow-lg shadow-[#c9a24a]/20 hover:shadow-[#c9a24a]/30 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {selectedSlot ? `Pilih Jadwal ${selectedSlot.displayDate}` : "Pilih Jadwal & Booking"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
