import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import DoctorCard from "@/features/guest/doctors/components/DoctorCard";
import { Award, GraduationCap, MessageCircle } from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "drg. Yulita Dora",
    role: "Aesthetic Dentistry (Veneers)",
    image: "/dokter/drg. Yulita Dora.jpeg",
    education: "Faculty of Dentistry, Trisakti University",
    description: "Spesialis dalam perawatan estetika gigi dan veneer untuk senyum sempurna.",
  },
  {
    id: 2,
    name: "drg. Della Sparringa",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Della Sparringa.jpeg",
    education: "Faculty of Dentistry, Airlangga University",
    description: "Ahli dalam perawatan estetika gigi dan kesehatan gigi anak.",
  },
  {
    id: 3,
    name: "drg. Ryan Jusuf",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Ryan Jusuf.jpeg",
    education: "Faculty of Dentistry, Andalas University",
    description: "Spesialis estetika dan perawatan gigi anak dengan pendekatan gentle.",
  },
  {
    id: 4,
    name: "drg. Nona Lolita T",
    role: "Aesthetic Dentistry",
    image: "/dokter/drg. Nona Lolita T.jpeg",
    education: "Faculty of Dentistry, Airlangga University",
    description: "Fokus pada perawatan estetika gigi untuk senyum yang menawan.",
  },
  {
    id: 5,
    name: "drg. Melati Putri, Sp. Pros",
    role: "Prosthodontist, Full Mouth Rehabilitations, Aesthetic Dentistry",
    image: "/dokter/drg. Melati Putri, Sp. Pros.jpeg",
    education: "Faculty of Dentistry, Trisakti University & Prosthodontics Specialist Faculty of Dentistry, University of Indonesia",
    description: "Spesialis rehabilitasi mulut penuh dan estetika gigi tingkat lanjut.",
  },
  {
    id: 6,
    name: "drg. Shilvy",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Shilvy.jpeg",
    education: "Faculty of Dentistry, University of Indonesia & Professional Doctor of Dentistry Education",
    description: "Kombinasi keahlian estetika dan perawatan gigi anak yang komprehensif.",
  },
  {
    id: 7,
    name: "drg. Achmad Riwandy",
    role: "Full Denture, Partial Denture, Prosthodontist, Full Mouth Rehabilitations",
    image: "/dokter/drg. Achmad Riwandy.jpeg",
    education: "Faculty of Dentistry, Lambung Mangkurat & Prosthodontics Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam pembuatan gigi tiruan lengkap dan rehabilitasi mulut kompleks.",
  },
  {
    id: 8,
    name: "drg. Ramayani Ramli",
    role: "Cosmetic Dentistry",
    image: "/dokter/drg. Ramayani Ramli.jpeg",
    education: "Faculty of Dentistry, Hasanuddin University",
    description: "Spesialis dalam perawatan kosmetik gigi untuk tampilan yang memukau.",
  },
  {
    id: 9,
    name: "drg. Sharah Syam, Sp. Ort",
    role: "Orthodontist",
    image: "/dokter/drg. Sharah Syam, Sp. Ort.jpeg",
    education: "Faculty of Dentistry, University of Indonesia & Orthodontist Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam koreksi gigitan dan perawatan kawat gigi untuk semua usia.",
  },
  {
    id: 10,
    name: "drg. Eric Sulistio, Sp. Perio",
    role: "Periodontist, Full Mouth Rehabilitation, Crown Lengthening, Frenectomy",
    image: "/dokter/drg. Eric Sulistio, Sp. Perio.jpeg",
    education: "Faculty of Dentistry, University Pasundan Bandung & Periodontist Specialist Faculty of Dentistry, University of Indonesia",
    description: "Spesialis perawatan gusi dan jaringan pendukung gigi tingkat lanjut.",
  },
  {
    id: 11,
    name: "drg. Pramodanti Jiwanakusuma, Sp.KG",
    role: "Root Canal Treatment & Conservation",
    image: "/dokter/drg. Pramodanti Jiwanakusuma, Sp.KG.jpeg",
    education: "Faculty of Dentistry, University of Indonesia & Dental Conservation Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam perawatan saluran akar dan konservasi gigi.",
  },
  {
    id: 12,
    name: "drg. Riesta Paluvi, Sp.KG",
    role: "Oral Examination, Oral Health Education, Preventive Restoration, Resin infiltration, in office / home / walking bleaching, Root Canal Treatment, Micro Dentistry Services, Microsurgery endodontic, Retreatment endodontic, minimally invasive restoration",
    image: "/dokter/drg. Riesta Paluvi, Sp.KG.jpeg",
    education: "Bachelor of Dentistry, Faculty of Dentistry Trisakti University, Profession Dentistry Program, Faculty of Dentistry Trisakti University, Postgraduate Dental Specialist of Conservative Dentistry, Faculty of Dentistry Trisakti University",
    description: "Spesialis konservasi gigi komprehensif dengan teknik mikroskopik canggih.",
  },
  {
    id: 13,
    name: "drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)",
    role: "Oral Surgeon Consultant",
    image: "/dokter/drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K).jpeg",
    education: "Bachelor of Dentistry, Faculty of Dentistry Airlangga University, Program in Dental Surgery Specialty (PPDGS) in Oral and Maxillofacial Surgery, University of Indonesia, Oral and Maxillofacial Surgeon Faculty of Dentistry, University of Indonesia, Doctor of Dental Medicine, Faculty of Dentistry University of Indonesia",
    description: "Konsultan ahli bedah mulut dan maksilofasial untuk kasus kompleks.",
  },
];

export default function DoctorsPage() {
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
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Our Doctors */}
        <section className="py-14 sm:py-20 bg-brand-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Menggunakan Peralatan Modern
                <span className="text-gradient-gold"> & Berstandar Internasional</span>
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
                <p className="text-sm text-brand-warm-gray font-body">Setiap pasien mendapat perhatian individual untuk hasil yang optimal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
