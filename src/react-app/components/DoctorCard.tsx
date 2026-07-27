import { useState } from "react";
import { Link } from "react-router";
import { Award, MapPin, MessageCircle, Stethoscope, ChevronRight } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/react-app/components/ui/dialog";

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
  const [isHovered, setIsHovered] = useState(false);

  // Parse long text to array if needed
  const schedule = doctor.schedule || [
    "Tuesday: 10:00 AM - 06:00 PM",
    "Wednesday: 10:00 AM - 06:00 PM",
    "Friday: 10:00 AM - 06:00 PM",
  ];

  const fellowship = doctor.fellowship || [
    "Penn Endodontic Global Symposium 2025 - Lecture session in the amount of 16 hours",
    "The Soul of Speaking 2023",
    "Micro Dentistry: Ceramic and Composite Restoration",
    "HDI Scientific Seminar 'The Future of Dentistry, Trends & Technologies' 2022",
    "Hands On Endo Like A Boss - The Protocol of Bulk Fill Resin Composite For Post-Endodontic Cavity 2022",
    "Endo Use Like A Boss 2022",
  ];

  const organization = doctor.organization || [
    "PDGI South Jakarta",
    "Lions Club",
  ];

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

              {/* Schedule */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">Schedule</h4>
                <div className="bg-[#f8f6f3] rounded-xl p-4 space-y-2">
                  {schedule.map((time, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-body">{time.split(':')[0]}</span>
                      <span className="text-gray-800 font-medium">{time.split(':').slice(1).join(':')}</span>
                    </div>
                  ))}
                </div>
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

              {/* Konsultasi Button */}
              <Link to="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold px-8 shadow-lg shadow-[#c9a24a]/20 hover:shadow-[#c9a24a]/30 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Konsultasi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
