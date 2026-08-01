import { useState, useEffect } from "react";
import { Link } from "react-router";
import { API_BASE } from "@/shared/lib/apiConfig";
import {
  Calendar,
  Stethoscope,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

// Welcome Hero Section with Elegant Modern Design
function WelcomeHero({ userName }: { userName: string; isMembership?: boolean }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#C9A24A]/20 via-[#FDF8F0] to-[#F5E9D8]/50 rounded-3xl p-3 md:p-0 border border-[#C9A24A]/10 shadow-sm">
      {/* Elegant Background Decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#C9A24A]/10 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#E8C547]/10 to-transparent rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23C9A24A%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Floating accent elements */}
      <div className="absolute top-4 right-1/3 w-2 h-2 bg-[#C9A24A]/40 rounded-full animate-pulse" />
      <div className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-[#E8C547]/50 rounded-full animate-pulse delay-300" />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left - Welcome Text */}
        <div className="flex-1 min-w-10 pl-6">
          <div className="mb-2">
            <span className="text-sm md:text-base text-[#8B7355] font-medium">Selamat datang kembali,</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#5C4A32] via-[#8B7355] to-[#5C4A32] bg-clip-text text-transparent tracking-tight mt-1">
              {userName}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[#8B7355]">
            <div className="w-1 h-1 rounded-full bg-[#C9A24A]" />
            <span className="italic">Semoga harimu menyenangkan!</span>
            <div className="w-1 h-1 rounded-full bg-[#C9A24A]" />
          </div>
          
          {/* Quick Stats Row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#C9A24A]/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A24A]/20 to-[#E8C547]/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#C9A24A]" />
              </div>
              <div>
                <p className="text-[10px] text-[#8B7355]">Hari Ini</p>
                <p className="text-xs font-semibold text-[#5C4A32]">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-[#C9A24A]/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A24A]/20 to-[#E8C547]/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-[#C9A24A]" />
              </div>
              <div>
                <p className="text-[10px] text-[#8B7355]">Status</p>
                <p className="text-xs font-semibold text-[#5C4A32]">Siap Konsultasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Doctor Image + Promo Card */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 -ml-6">
          <div className="w-48 h-52 relative shrink-0 -ml-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#C9A24A]/10 to-[#E8C547]/5 blur-xl" />
            </div>
            <div className="absolute -bottom-2 w-40 h-4 bg-gradient-to-r from-transparent via-[#C9A24A]/20 to-transparent rounded-full blur-sm" />
            <img 
              src="/dashboard/sapadokter.png" 
              alt="Dokter" 
              className="w-full h-full object-contain object-bottom drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="shrink-0 -ml-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-[#5C4A32]">Promo Spesial Untuk Anda</p>
              <div className="w-5 h-5 rounded-full bg-[#C9A24A]/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
              </div>
            </div>
            
            <p className="text-xs text-[#8B7355] mb-0">Dapatkan diskon hingga</p>
            
            <div className="flex items-start justify-between -mt-2">
              <div className="pt-4">
                <p className="text-4xl font-bold text-[#C9A24A]">25%</p>
                <p className="text-xs text-[#8B7355]">untuk semua perawatan</p>
                <Link
                  to="/dashboard/user?tab=promo"
                  className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-[10px] font-semibold rounded-full hover:shadow-lg hover:shadow-[#C9A24A]/25 hover:scale-105 transition-all"
                >
                  <span>Cek Promo</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <img 
                src="/dashboard/gigi.png" 
                alt="Promo" 
                className="w-28 h-28 object-contain -mr-5 -mt-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesktopUserHome({
  consultations = [],
  publicSchedules,
  isMembership = false,
  session,
  complaints,
  progress,
}: {
  consultations?: any[];
  publicSchedules?: any[];
  isMembership?: boolean;
  session?: any;
  complaints?: any[];
  progress?: number;
}) {
  const userName = session?.name || "Pengguna";
  void publicSchedules;
  void isMembership;
  void complaints;
  void progress;

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/public/posts`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {});
  }, []);

  const latestConsultation = consultations && consultations.length > 0 ? consultations[0] : null;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Welcome Hero with Stats */}
      <WelcomeHero userName={userName} />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Konsultasi Cepat */}
        <Link
          to="/dashboard/user?tab=konsultasi&view=quick"
          className="relative overflow-hidden bg-white rounded-3xl p-6 border border-[#C9A24A]/10 hover:border-[#C9A24A]/30 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mb-4 group-hover:bg-[#F5E9D8] transition-colors">
                <MessageCircle className="w-7 h-7 text-[#C9A24A]" />
              </div>
              <h4 className="font-bold text-[#5C4A32] text-lg mb-1">Konsultasi Cepat</h4>
              <p className="text-sm text-[#8B7355] mb-4">Chat langsung dengan dokter gigi</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-sm font-semibold rounded-full group-hover:shadow-lg group-hover:shadow-[#C9A24A]/25 transition-all">
                <span>Mulai Chat</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src="/dashboard/gigi.png"
                alt="Konsultasi"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </Link>

        {/* Booking Jadwal */}
        <Link
          to="/dashboard/user?tab=konsultasi&view=schedule"
          className="relative overflow-hidden bg-white rounded-3xl p-6 border border-[#C9A24A]/10 hover:border-[#C9A24A]/30 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mb-4 group-hover:bg-[#F5E9D8] transition-colors">
                <Calendar className="w-7 h-7 text-[#C9A24A]" />
              </div>
              <h4 className="font-bold text-[#5C4A32] text-lg mb-1">Booking Jadwal</h4>
              <p className="text-sm text-[#8B7355] mb-4">Atur janji dengan dokter pilihan</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-sm font-semibold rounded-full group-hover:shadow-lg group-hover:shadow-[#C9A24A]/25 transition-all">
                <span>Atur Jadwal</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src="/dashboard/kalender.png"
                alt="Booking"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* SECTION 1: Status Janji Temu / Kunjungan Terbaru (Backend API Data) */}
      <div className="bg-white rounded-3xl p-6 border border-[#C9A24A]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#5C4A32] text-base">Jadwal & Kunjungan Anda</h3>
              <p className="text-xs text-[#8B7355]">Status reservasi dan riwayat pemeriksaan terdekat</p>
            </div>
          </div>
          <Link
            to="/dashboard/user?tab=reservasi"
            className="text-xs font-semibold text-[#C9A24A] hover:text-[#b8923f] flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestConsultation ? (
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A24A] text-white">
                  {latestConsultation.status || "Aktif"}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {latestConsultation.date || "Terjadwal"}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">
                {latestConsultation.doctorName || "Dr. Aris S.Sp.KG - Spesialis Konservasi Gigi"}
              </h4>
              <p className="text-xs text-gray-600">
                Layanan: {latestConsultation.service || "Pemeriksaan Kesehatan & Estetik Gigi"}
              </p>
            </div>

            <Link
              to="/dashboard/user?tab=reservasi"
              className="px-4 py-2 bg-[#C9A24A] hover:bg-[#b8923f] text-white text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0"
            >
              Detail Reservasi
            </Link>
          </div>
        ) : (
          <div className="bg-[#FDF8F0]/70 p-5 rounded-2xl border border-[#C9A24A]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A24A]/15 flex items-center justify-center text-[#C9A24A] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#5C4A32] text-sm">Belum Ada Janji Temu Mendatang</h4>
                <p className="text-xs text-[#8B7355]">
                  Jadwalkan pemeriksaan berkala setiap 6 bulan sekali untuk menjaga kesehatan dan kilau senyum Anda.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/user?tab=reservasi"
              className="px-5 py-2.5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0"
            >
              Jadwalkan Periksa
            </Link>
          </div>
        )}
      </div>

      {/* SECTION 2: Edukasi & Artikel Kesehatan Gigi (Live Backend API GET /api/public/posts) */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A24A]/10 flex items-center justify-center text-[#C9A24A]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#5C4A32] text-base">Edukasi & Tips Senyum Sehat</h3>
                <p className="text-xs text-[#8B7355]">Panduan perawatan gigi harian dari tim dokter spesialis kami</p>
              </div>
            </div>
            <Link
              to="/dashboard/user?tab=blog"
              className="text-xs font-semibold text-[#C9A24A] hover:text-[#b8923f] flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posts.slice(0, 3).map((art) => (
              <div
                key={art.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full font-semibold">
                      {art.category || "Edukasi"}
                    </span>
                    <span>{art.reading_time_minutes ? `${art.reading_time_minutes} mnt baca` : "3 mnt baca"}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {art.excerpt || art.description}
                  </p>
                </div>

                <Link
                  to={`/dashboard/user?tab=blog-detail&slug=${art.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C9A24A] hover:text-[#b8923f] pt-2"
                >
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
