import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Award,
  MapPin,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  Calendar,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export interface DoctorScheduleSlot {
  id: string;
  date: string | null;
  time_range: string;
  location: string;
  available_slots: number;
}

export interface Doctor {
  id: number | string;
  name: string;
  role: string;
  image: string;
  education: string;
  description: string;
  strNumber?: string | null;
  sipNumber?: string | null;
  experienceYears?: number;
  primaryBranch?: string | null;
  schedules?: DoctorScheduleSlot[];
  fellowship?: string[];
  organization?: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
}

function formatScheduleDate(iso: string | null): string {
  if (!iso) return "Jadwal Rutin";
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3) return iso;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(dt);
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const schedules = Array.isArray(doctor.schedules) ? doctor.schedules : [];
  const fellowship = Array.isArray(doctor.fellowship) && doctor.fellowship.length > 0 ? doctor.fellowship : null;
  const organization = Array.isArray(doctor.organization) && doctor.organization.length > 0 ? doctor.organization : null;

  const handleBookingRedirect = () => {
    const params = new URLSearchParams();
    params.set("doctor", doctor.name);
    navigate(`/booking/new?${params.toString()}`);
  };

  return (
    <Dialog>
      <div
        className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(201,162,74,0.15)] border border-gray-100/80 hover:border-[#c9a24a]/20 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#c9a24a]/5 via-[#e8d4a2]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-3 sm:p-6 flex gap-3 sm:gap-6 relative">
          {/* Image Container */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-24 h-28 sm:w-32 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8f4ed] to-[#e8d4a2]/20 p-1 transition-all duration-500 ${isHovered ? "scale-105" : ""}`}
            >
              <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/dashboard/sapadokter.webp";
                  }}
                  className={`w-full h-full object-cover object-top transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#c9a24a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-white rounded-full p-0.5 sm:p-1 shadow-lg">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center">
                <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[100px] sm:min-h-[160px] min-w-0">
            <div className="mb-1.5 sm:mb-3">
              <div className="flex flex-wrap items-center gap-1.5 mb-1 sm:mb-2">
                <Badge
                  variant="outline"
                  className="px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-semibold tracking-wider uppercase bg-[#c9a24a]/10 text-[#c9a24a] border-[#c9a24a]/20 rounded-full"
                >
                  Dental Profile
                </Badge>
                {doctor.experienceYears ? (
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#8A6B2B] bg-[#FAF4E8] px-2 py-0.5 rounded-full">
                    {doctor.experienceYears}+ Thn
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-[#c9a24a] leading-tight group-hover:text-[#b8923f] transition-colors duration-300">
                {doctor.name}
              </h3>
            </div>

            <div className="flex items-start gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#c9a24a]" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-700 font-medium leading-relaxed line-clamp-2">
                {doctor.role}
              </span>
            </div>

            <div className="flex items-start gap-1.5 sm:gap-2.5 mb-2 sm:mb-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#c9a24a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#c9a24a]" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">
                {doctor.education}
              </span>
            </div>

            {schedules.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mb-3">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Jadwal terdekat: {formatScheduleDate(schedules[0].date)} ({schedules[0].time_range})
                </span>
              </div>
            )}

            <div className="flex-grow" />

            <div className="flex items-center gap-2 sm:gap-3">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#c9a24a]/40 text-[#c9a24a] hover:bg-[#c9a24a] hover:text-white hover:border-[#c9a24a] font-body text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 h-auto transition-all duration-300 group/btn"
                >
                  <span className="hidden sm:inline">Lihat Profil</span>
                  <span className="sm:hidden">Profil</span>
                  <ChevronRight className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </Button>
              </DialogTrigger>
              <Button
                size="sm"
                onClick={handleBookingRedirect}
                className="flex-1 rounded-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-body text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-2 h-auto transition-all duration-300 shadow-lg shadow-[#c9a24a]/20 hover:shadow-[#c9a24a]/30"
              >
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Buat Janji</span>
                <span className="sm:hidden">Booking</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#c9a24a] to-[#e8d4a2] group-hover:w-full transition-all duration-500" />
      </div>

      {/* Modal Detail Profil & Kompetensi Dokter */}
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl p-0 max-h-[calc(100vh-2rem)] overflow-y-auto lg:overflow-hidden rounded-3xl border-0">
        <div className="h-full overflow-y-auto">
          <div className="grid lg:grid-cols-2">
            <div className="bg-gradient-to-br from-[#f8f4ed] to-[#e8d4a2]/30">
              <img
                src={doctor.image}
                alt={doctor.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/dashboard/sapadokter.webp";
                }}
                className="h-full w-full object-cover object-top aspect-[4/3] lg:aspect-auto min-h-[280px] lg:min-h-full"
              />
            </div>

            <div className="p-6 sm:p-10 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8f4ed] rounded-full mb-4">
                <span className="text-xs font-semibold text-[#c9a24a] font-body tracking-wider uppercase">
                  Aesthetic Pondok Indah
                </span>
              </div>

              <DialogTitle asChild>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#c9a24a]">
                  {doctor.name}
                </h3>
              </DialogTitle>

              {/* Kredensial STR / SIP / Pengalaman */}
              {(doctor.strNumber || doctor.sipNumber || doctor.experienceYears) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {doctor.experienceYears ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF4E8] text-[#8A6B2B]">
                      <Clock className="w-3.5 h-3.5" />
                      Pengalaman {doctor.experienceYears}+ tahun
                    </span>
                  ) : null}
                  {doctor.strNumber ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      STR: {doctor.strNumber}
                    </span>
                  ) : null}
                  {doctor.sipNumber ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SIP: {doctor.sipNumber}
                    </span>
                  ) : null}
                </div>
              )}

              <div className="h-px bg-[#c9a24a]/25 my-5" />

              <div className="mb-4">
                <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-1.5">
                  Spesialisasi &amp; Kompetensi
                </h4>
                <p className="text-sm text-gray-700 font-body leading-relaxed">{doctor.role}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-1.5">
                  Pendidikan
                </h4>
                <p className="text-sm text-gray-600 font-body leading-relaxed">{doctor.education}</p>
              </div>

              {doctor.description && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-1.5">
                    Profil Singkat
                  </h4>
                  <p className="text-sm text-gray-600 font-body leading-relaxed">{doctor.description}</p>
                </div>
              )}

              {/* Jadwal Praktik Aktif */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">
                  Jadwal Praktik Aktif
                </h4>
                {schedules.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {schedules.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] text-xs"
                      >
                        <p className="font-bold text-[#2C2416]">{formatScheduleDate(slot.date)}</p>
                        <p className="text-[#5C5546] mt-0.5">{slot.time_range}</p>
                        <p className="text-[11px] text-[#8A7B6B] truncate mt-0.5">{slot.location}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Jadwal praktik tersedia berdasarkan perjanjian (appointment). Klik tombol di bawah untuk memilih tanggal.
                  </p>
                )}
              </div>

              {fellowship && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">
                    Pelatihan &amp; Fellowship
                  </h4>
                  <ul className="space-y-1.5">
                    {fellowship.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a24a] mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {organization && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-[#c9a24a] font-body uppercase tracking-wider mb-2">
                    Organisasi Profesi
                  </h4>
                  <ul className="space-y-1.5">
                    {organization.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a24a] mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleBookingRedirect}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold px-8 shadow-lg shadow-[#c9a24a]/20 hover:shadow-[#c9a24a]/30 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Buat Janji Temu
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
