import { useState, useEffect } from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, Award, Users, MessageCircle, Target } from "lucide-react";
import { fetchPublicAbout, type ClinicAboutData, ABOUT_STATS, ABOUT_VALUES } from "../services/aboutService";

export default function AboutPage() {
  const [about, setAbout] = useState<ClinicAboutData>({
    hero_title: "About The Company Aesthetic Pondok Indah",
    hero_subtitle: "At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.",
    story_title: "Professional Care that Puts You First",
    story_paragraphs: [
      "Aesthetic Pondok Indah Dental Clinic didirikan dengan visi menghadirkan perawatan gigi berstandar tinggi yang mengutamakan kenyamanan, estetika alami, dan kesehatan jangka panjang.",
      "Dengan tim dokter spesialis berpengalaman dan teknologi modern, kami berkomitmen memberikan perawatan yang personal dan presisi untuk setiap pasien.",
    ],
    stats: ABOUT_STATS,
    values: ABOUT_VALUES,
  });

  useEffect(() => {
    fetchPublicAbout().then((data) => setAbout(data));
  }, []);

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
                {about.hero_title}
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                {about.hero_subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-gold rounded-3xl rotate-3 scale-[0.97] opacity-20"></div>
                <img
                  src="/about/tentang3.jpg"
                  alt="Klinik Aesthetic Pondok Indah"
                  className="relative rounded-3xl shadow-2xl shadow-black/10 w-full object-cover aspect-[6/5]"
                />
                <div className="absolute -bottom-6 -right-6 bg-background rounded-2xl p-6 shadow-xl border border-brand-gold/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-brand-charcoal">Top</p>
                      <p className="text-sm text-brand-warm-gray font-body">Dental Clinic in Jakarta</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold-light rounded-full">
                  <span className="text-sm font-semibold text-brand-gold font-body">Cerita Kami</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal">
                  {about.story_title}
                </h2>
                <div className="space-y-4 text-brand-warm-gray font-body leading-relaxed text-sm sm:text-base">
                  {about.story_paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <a
                    href="https://wa.me/6281990114949"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gradient-gold hover:opacity-90 text-white rounded-full px-8 py-6 font-semibold font-body shadow-lg shadow-brand-gold/20 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Konsultasi WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-14 sm:py-20 bg-brand-cream/30 border-y border-brand-gold/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {about.stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <p className="text-4xl sm:text-5xl font-bold text-gradient-gold font-heading">{stat.value}</p>
                  <p className="text-lg font-semibold text-brand-charcoal font-heading">{stat.label}</p>
                  <p className="text-sm text-brand-warm-gray font-body">{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold-light rounded-full mb-4">
                <span className="text-sm font-semibold text-brand-gold font-body">Nilai Kami</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
                Standar Pelayanan Terbaik
              </h2>
              <p className="text-base text-brand-warm-gray font-body">
                Prinsip yang memandu kami dalam memberikan perawatan gigi berkualitas kepada setiap pasien.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {about.values.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-card p-8 rounded-3xl border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    {idx === 0 ? <Users className="w-6 h-6" /> : idx === 1 ? <Target className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold text-brand-charcoal">{val.title}</h3>
                  <p className="text-sm text-brand-warm-gray font-body leading-relaxed">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
