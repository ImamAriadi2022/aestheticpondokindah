import { useEffect, useState } from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import DoctorCard, { type Doctor } from "@/features/guest/doctors/components/DoctorCard";
import DoctorScheduleSection from "@/features/guest/doctors/components/DoctorScheduleSection";
import { CLINIC_DOCTORS } from "@/features/guest/doctors/services/doctorsService";
import { API_BASE } from "@/core/api/apiConfig";
import { Award, GraduationCap, MessageCircle, Search } from "lucide-react";

const FALLBACK_DOCTORS: Doctor[] = CLINIC_DOCTORS.map((d) => ({
  id: d.id,
  name: d.name,
  role: d.role,
  image: d.image,
  education: d.education,
  description: d.description,
}));

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const cached = localStorage.getItem("apig_public_cached_doctors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return FALLBACK_DOCTORS;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/public/doctors`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        const list = Array.isArray(payload) ? payload : payload.doctors || payload.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped: Doctor[] = list.map((d: any) => ({
            id: d.id ?? d.userId,
            name: d.name || "Dokter Spesialis",
            role: d.specialization || d.job || "Dokter Gigi Spesialis",
            image: d.photo || d.avatar || `/dokter/${d.name}.webp`,
            education: d.education || d.university || "Universitas Indonesia",
            description:
              d.bio ||
              `Dokter gigi berpengalaman di bidang ${d.specialization || "perawatan estetika gigi"}.`,
            strNumber: d.str_number ?? null,
            sipNumber: d.sip_number ?? null,
            experienceYears: d.experience_years ?? d.experienceYears ?? undefined,
            primaryBranch: d.primary_branch ?? null,
            schedules: Array.isArray(d.schedules) ? d.schedules : [],
          }));
          setDoctors(mapped);
          try {
            localStorage.setItem("apig_public_cached_doctors", JSON.stringify(mapped));
          } catch {
            // Ignore quota error
          }
        }
      })
      .catch(() => {
        // Keep cached/fallback doctors gracefully
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.role.toLowerCase().includes(q) ||
      doc.education.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold-light/40 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Tim Dokter
                <span className="text-gradient-gold"> Profesional Kami</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Dipimpin oleh tim dokter gigi spesialis berpengalaman dengan dedikasi tinggi untuk memberikan perawatan gigi terbaik dan hasil estetika yang natural.
              </p>

              {/* Search Doctor */}
              <div className="mt-8 max-w-md mx-auto relative">
                <Search className="w-4 h-4 text-[#8A7B6B] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dokter atau spesialisasi..."
                  className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white border border-[#E8DFC8] text-sm text-[#2C2416] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C59E3F]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-[#7A6E60]">
              <span>
                Menampilkan <strong className="text-[#2C2416]">{filteredDoctors.length}</strong> dokter aktif
              </span>
              {loading && <span className="text-[#A37E28]">Menyinkronkan jadwal terbaru...</span>}
            </div>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-[#FAF8F5] rounded-2xl border border-[#F0E6D3]">
                <p className="text-sm font-semibold text-[#2C2416]">Dokter tidak ditemukan</p>
                <p className="text-xs text-[#7A6E60] mt-1">Coba ubah kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Jadwal Dokter Mingguan (Senin - Sabtu) */}
        <DoctorScheduleSection doctors={doctors} />

        {/* Why Choose Our Doctors */}
        <section className="py-14 sm:py-20 bg-brand-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Menggunakan Peralatan Modern
                <span className="text-gradient-gold"> &amp; Berstandar Internasional</span>
              </h2>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body">
                Tim dokter kami menggunakan teknologi terbaru dan teknik internasional untuk memberikan hasil terbaik.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-background rounded-2xl p-6 text-center shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-brand-charcoal mb-2">Bersertifikat Internasional</h3>
                <p className="text-sm text-brand-warm-gray font-body">Dokter kami memiliki sertifikasi dari berbagai asosiasi dental internasional.</p>
              </div>
              <div className="bg-background rounded-2xl p-6 text-center shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-brand-charcoal mb-2">Pengalaman Luas</h3>
                <p className="text-sm text-brand-warm-gray font-body">Rata-rata pengalaman 10+ tahun dalam bidang spesialisasi masing-masing.</p>
              </div>
              <div className="bg-background rounded-2xl p-6 text-center shadow-lg shadow-black/5">
                <div className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-brand-charcoal mb-2">Pendekatan Personal</h3>
                <p className="text-sm text-brand-warm-gray font-body">Konsultasi mendalam untuk memahami kebutuhan dan harapan setiap pasien.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
