import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Clock,
  Star,
  Search,
  Tag,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Award,
  Grid,
} from "lucide-react";

interface DesktopUserHomeProps {
  session?: any;
  consultations?: any[];
  publicSchedules?: any[];
  isMembership?: boolean;
  complaints?: any[];
  progress?: number;
}

export default function DesktopUserHome({
  session,
  consultations = [],
  publicSchedules = [],
}: DesktopUserHomeProps) {
  const navigate = useNavigate();

  // User details
  const userName = session?.name || "ROBIN";
  const userTier = (session?.membership_level || session?.membershipLevel || "bronze").toLowerCase();
  const memberId = session?.member_id || session?.memberId || `MEM-AESPI_${session?.id || "17"}`;
  const points = session?.membership_points ?? session?.points ?? 0;

  // Active appointment / consultation
  const activeAppointment = consultations && consultations.length > 0 ? consultations[0] : null;

  // Doctor list for carousel/display
  const featuredDoctor = {
    name: "drg. Yulita Dora",
    specialty: "Aesthetic Dentistry (Veneers)",
    education: "Faculty of Dentistry, Trisakti University",
    rating: "4.9",
    reviewsCount: "214",
    experience: "10+ Tahun Pengalaman",
    image: "/dokter/drg. Yulita Dora.webp",
  };

  // Popular Services
  const popularServices = [
    {
      id: "whitening",
      title: "Dental Whitening",
      image: "/layanan/Dental Whitening.webp",
    },
    {
      id: "implants",
      title: "Dental Implants",
      image: "/layanan/Dental Implants.webp",
    },
    {
      id: "braces",
      title: "Orthodontic Braces",
      image: "/layanan/Orthodontic Braces.webp",
    },
  ];

  // Tier emblem asset
  const getTierEmblem = (tier: string) => {
    switch (tier) {
      case "gold":
        return "/dashboard/gold.webp";
      case "platinum":
        return "/dashboard/platinum.webp";
      case "diamond":
        return "/dashboard/diamond.webp";
      case "bronze":
      default:
        return "/dashboard/bronze.webp";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "gold":
        return "GOLD MEMBER";
      case "platinum":
        return "PLATINUM MEMBER";
      case "diamond":
        return "DIAMOND MEMBER";
      case "bronze":
      default:
        return "BRONZE MEMBER";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto md:max-w-4xl space-y-5 px-3.5 py-2 sm:px-4 sm:py-4 text-left font-sans select-none">
      {/* 1. HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F2E8D5] border border-[#EADBBD] p-5 sm:p-6 shadow-sm">
        {/* Background 3D Tooth / Clinic Watermark Visual */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none flex items-center justify-end pr-2 opacity-90 sm:opacity-100">
          <img
            src="/dashboard/gigi.webp"
            alt="Dental Care Illustration"
            className="w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-xl translate-x-4 translate-y-2 select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
            }}
          />
        </div>

        <div className="relative z-10 max-w-[70%] sm:max-w-[65%] space-y-2.5">
          {/* Tag Pill */}
          <div className="inline-flex items-center px-3 py-0.5 rounded-full border border-[#C9A24A]/50 bg-white/80 backdrop-blur-xs">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#A8822D] uppercase tracking-wider">
              BOOKING SEKARANG
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2C2416] leading-tight tracking-tight">
            Atur Janji,<br />
            Senyum Lebih<br />
            Percaya Diri
          </h1>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs text-[#6B5D4D] leading-relaxed line-clamp-2">
            Booking konsultasi dengan dokter gigi terbaik kami dengan mudah dan cepat.
          </p>

          {/* Social Proof Row */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center -space-x-2">
              <img
                src="/dokter/drg. Yulita Dora.webp"
                alt="Doctor 1"
                className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-2xs"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
              />
              <img
                src="/dokter/drg. Achmad Riwandy.webp"
                alt="Doctor 2"
                className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-2xs"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
              />
              <img
                src="/dokter/drg. Della Sparringa.webp"
                alt="Doctor 3"
                className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-2xs"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
              />
            </div>
            <p className="text-[11px] text-[#6B5D4D]">
              <span className="font-bold text-[#A8822D]">{publicSchedules.length > 0 ? publicSchedules.length : "12"}</span> Dokter tersedia
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/user?tab=booking")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white text-xs font-bold shadow-md shadow-[#C9A24A]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Booking Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (3 CARDS) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Riwayat Reservasi */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/user?tab=riwayat")}
          className="bg-white rounded-2xl p-3.5 border border-[#F0E6D3] shadow-xs flex flex-col items-center justify-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] group-hover:bg-[#F3EAD5] transition-colors mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2C2416] text-center leading-tight">
            Riwayat<br />Reservasi
          </span>
        </button>

        {/* Card 2: Penawaran Spesial */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/user?tab=promo")}
          className="bg-white rounded-2xl p-3.5 border border-[#F0E6D3] shadow-xs flex flex-col items-center justify-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] group-hover:bg-[#F3EAD5] transition-colors mb-2">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2C2416] text-center leading-tight">
            Penawaran<br />Spesial
          </span>
        </button>

        {/* Card 3: Konsultasi Cepat */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/user?tab=konsultasi")}
          className="bg-white rounded-2xl p-3.5 border border-[#F0E6D3] shadow-xs flex flex-col items-center justify-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] group-hover:bg-[#F3EAD5] transition-colors mb-2">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2C2416] text-center leading-tight">
            Konsultasi<br />Cepat
          </span>
        </button>
      </div>

      {/* 3. LAYANAN POPULER (Vector Dental Icons) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2C2416]">Layanan Populer</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="text-xs font-bold text-[#C9A24A] hover:text-[#B8943F] hover:underline cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        {/* 3 Service Grid Cards with Line Art Dental Icons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Service 1: Dental Whitening */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="bg-white rounded-2xl p-3 border border-[#F0E6D3] shadow-xs flex flex-col items-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer text-center w-full group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] mb-2 group-hover:bg-[#F3EAD5] transition-colors">
              <svg className="w-7 h-7 text-[#C9A24A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 6 5 6 9c0 4 2 8 3 11 1 2 2 2 3 0 1 2 2 2 3 0 1-3 3-7 3-11 0-4-2-7-6-7z" fill="#FDF8F0" />
                <path d="M4 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="#C9A24A" stroke="none" />
                <path d="M19 12l.7 1.4 1.4.7-1.4.7-.7 1.4-.7-1.4-1.4-.7 1.4-.7.7-1.4z" fill="#C9A24A" stroke="none" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#2C2416] text-center line-clamp-2 leading-tight">
              Dental Whitening
            </span>
          </button>

          {/* Service 2: Dental Implants */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="bg-white rounded-2xl p-3 border border-[#F0E6D3] shadow-xs flex flex-col items-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer text-center w-full group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] mb-2 group-hover:bg-[#F3EAD5] transition-colors">
              <svg className="w-7 h-7 text-[#C9A24A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 6c0-2.2 2.2-4 5-4s5 1.8 5 4c0 3-1.5 5-3 6H10C8.5 11 7 9 7 6z" fill="#FDF8F0" />
                <line x1="9.5" y1="13" x2="14.5" y2="13" />
                <line x1="10" y1="16" x2="14" y2="16" />
                <line x1="10.5" y1="19" x2="13.5" y2="19" />
                <line x1="12" y1="12" x2="12" y2="22" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#2C2416] text-center line-clamp-2 leading-tight">
              Dental Implants
            </span>
          </button>

          {/* Service 3: Orthodontic Braces */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="bg-white rounded-2xl p-3 border border-[#F0E6D3] shadow-xs flex flex-col items-center hover:border-[#C9A24A]/40 hover:shadow-md transition-all active:scale-[0.97] cursor-pointer text-center w-full group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#C9A24A] mb-2 group-hover:bg-[#F3EAD5] transition-colors">
              <svg className="w-7 h-7 text-[#C9A24A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3C8 3 6 6 6 10c0 4 2 7 3 10 1 1.5 2 1.5 3 0 1 1.5 2 1.5 3 0 1-3 3-6 3-10 0-4-2-7-6-7z" fill="#FDF8F0" />
                <rect x="9.5" y="8.5" width="5" height="5" rx="1.5" fill="#FAF5EA" stroke="#C9A24A" strokeWidth="1.5" />
                <line x1="4" y1="11" x2="20" y2="11" stroke="#C9A24A" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#2C2416] text-center line-clamp-2 leading-tight">
              Orthodontic Braces
            </span>
          </button>
        </div>

        {/* Special Offer Banner Underneath with Gigi.webp */}
        <div
          onClick={() => navigate("/dashboard/user?tab=promo")}
          className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF5EA] to-[#F5EBD6] rounded-2xl p-4 border border-[#EADBBD] flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-[9px] font-extrabold text-[#A8822D] uppercase tracking-wider block">
              PENAWARAN SPESIAL
            </span>
            <p className="text-xs sm:text-sm font-black text-[#2C2416] leading-tight">
              20% OFF Pemutihan Gigi
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#6B5D4D]">
              Book now and get a brighter smile!
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/90 border border-[#EADBBD] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <img
              src="/dashboard/gigi.webp"
              alt="Promo Thumbnail"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. DOKTER SPESIALIS KAMI */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2C2416]">Dokter Spesialis Kami</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="text-xs font-bold text-[#C9A24A] hover:text-[#B8943F] hover:underline cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        {/* Featured Doctor Card */}
        <div className="bg-white rounded-3xl p-4 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-start gap-3.5">
            {/* Doctor Photo */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-[#FAF5EA] border border-[#F0E6D3] shadow-2xs shrink-0">
              <img
                src={featuredDoctor.image}
                alt={featuredDoctor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/hero/drg-yulita-dora.webp";
                }}
              />
            </div>

            {/* Doctor Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#2C2416] truncate">
                {featuredDoctor.name}
              </h3>

              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] text-[10px] font-bold">
                {featuredDoctor.specialty}
              </div>

              <p className="text-[10px] text-[#6B5D4D] flex items-center gap-1 line-clamp-1">
                <span>📍</span>
                <span>{featuredDoctor.education}</span>
              </p>

              <div className="flex items-center justify-between pt-1 text-[10px] text-[#6B5D4D]">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#C9A24A] fill-[#C9A24A]" />
                  <span className="font-bold text-[#2C2416]">{featuredDoctor.rating}</span>
                  <span className="text-gray-400">({featuredDoctor.reviewsCount})</span>
                </div>
                <span className="font-semibold text-gray-500">{featuredDoctor.experience}</span>
              </div>
            </div>
          </div>

          {/* Full-width CTA Button inside doctor card */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=booking")}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/25 flex items-center justify-center gap-1.5 cursor-pointer mt-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Lihat Profil</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <div className="w-6 h-1.5 bg-[#C9A24A] rounded-full transition-all" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* 5. JADWAL & KUNJUNGAN ANDA */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2C2416]">Jadwal & Kunjungan Anda</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=reservasi")}
            className="text-xs font-bold text-[#6B5D4D] hover:text-[#C9A24A] flex items-center gap-0.5 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Appointment Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs relative overflow-hidden">
          {/* Subtle calendar watermark */}
          <Calendar className="w-24 h-24 text-[#C9A24A]/10 absolute -right-3 -bottom-3 pointer-events-none" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C9A24A] text-white uppercase">
                {activeAppointment?.status || "DIBUK"}
              </span>
              <span className="text-[11px] font-semibold text-[#6B5D4D]">
                {activeAppointment?.date
                  ? `${activeAppointment.date} • ${activeAppointment.time || "15:18"}`
                  : "10 Agustus 2026 • 15:18"}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#2C2416]">
              {activeAppointment?.doctor_name || activeAppointment?.doctorName || "Dokter Jaga"}
            </h3>

            <p className="text-xs text-[#6B5D4D]">
              Layanan: {activeAppointment?.service || activeAppointment?.service_name || "Pemeriksaan Kesehatan & Estetik Gigi"}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/user?tab=reservasi")}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold text-xs shadow-md shadow-[#C9A24A]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Detail Reservasi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AESPI DIGITAL MEMBERSHIP CARD */}
      <div className="bg-white rounded-3xl p-5 border border-[#EADBBD] shadow-xs relative overflow-hidden space-y-4">
        {/* Header Label + Icon */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-extrabold text-[#8C8272] tracking-widest uppercase">
              AESPI DIGITAL
            </p>
            <p className="text-[10px] font-bold text-[#2C2416] tracking-wider uppercase">
              MEMBERSHIP CARD
            </p>
          </div>
          <Grid className="w-5 h-5 text-[#C9A24A]" />
        </div>

        {/* Tier & User Name Row with 3D Emblem */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-[#A8822D] uppercase tracking-wide">
              {getTierLabel(userTier)}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2C2416] tracking-tight uppercase">
              {userName}
            </h3>
            <p className="text-[10px] text-[#8C8272] font-mono tracking-wider pt-0.5">
              MEMBER ID {memberId}
            </p>
          </div>

          {/* 3D Tier Badge Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <img
              src={getTierEmblem(userTier)}
              alt="Membership Emblem"
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/dashboard/bronze.webp";
              }}
            />
          </div>
        </div>

        {/* 2 Info Cards: BERLAKU HINGGA & POIN SAAT INI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-[#F0E6D3]">
            <p className="text-[9px] font-bold uppercase text-[#8C8272] flex items-center gap-1">
              <span>📅</span>
              <span>BERLAKU HINGGA</span>
            </p>
            <p className="text-xs font-bold text-[#2C2416] mt-0.5">
              Seumur Hidup
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-[#F0E6D3]">
            <p className="text-[9px] font-bold uppercase text-[#8C8272] flex items-center gap-1">
              <span>🪙</span>
              <span>POIN SAAT INI</span>
            </p>
            <p className="text-xs font-bold text-[#2C2416] mt-0.5">
              {points} Pts
            </p>
          </div>
        </div>

        {/* Level Progress Box */}
        <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#F0E6D3] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#C9A24A]">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-[#8C8272]">LEVEL BERIKUTNYA</p>
                <p className="text-xs font-bold text-[#2C2416]">Gold Member</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/user?tab=akun")}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white text-[10px] font-bold shadow-xs cursor-pointer transition-all"
            >
              Upgrade
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-2 rounded-full bg-[#EADBBD]/70 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#C9A24A] to-[#B8943F] w-[60%]" />
            </div>
            <span className="text-[10px] text-[#8C8272] text-right font-semibold block mt-1">
              600 / 1.000 Pts
            </span>
          </div>
        </div>

        {/* Outline Button: Lihat Detail Membership */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/user?tab=akun")}
          className="w-full py-2.5 rounded-xl border border-[#EADBBD] bg-white hover:bg-[#FAF8F5] text-[#8C6B1C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <span>Lihat Detail Membership</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
