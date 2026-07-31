import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Award, Users, MessageCircle, Target } from "lucide-react";

export default function AboutPage() {
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
                About The Company
                <span className="text-gradient-gold"> Aesthetic Pondok Indah</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.
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
                  Professional Care that
                  <span className="text-gradient-gold"> Feels Like Home</span>
                </h2>
                <div className="space-y-4 text-brand-warm-gray font-body leading-relaxed">
                  <p>
                    As one of Jakarta’s top dental clinics, we combine expertise with a welcoming environment that feels like home. Our experienced team is dedicated to restoring dental function, improving oral health, and creating natural, beautiful smiles.
                  </p>
                  <p>
                    Invest in your health and appearance with care that delivers lasting results. A brighter, healthier smile starts here.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    "Professional dental solutions",
                    "Smile & confidence focused",
                    "Long-term oral health",
                    "Natural, beautiful results"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
                      <span className="text-sm font-medium text-brand-charcoal font-body">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-14 sm:py-20 bg-brand-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Why Choose Us
                <span className="text-gradient-gold"> </span>
              </h2>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body">
                We deliver care designed to elevate aesthetics, improve function, and support wellness-focused dental health.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-brand-gold/10 shadow-2xl shadow-black/10 bg-black aspect-video">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/Ai4_AWeHYok?autoplay=1&mute=0&loop=1&playlist=Ai4_AWeHYok&controls=1&modestbranding=1&rel=0"
                    title="Aesthetic Pondok Indah Dental"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-charcoal leading-tight">
                  Mengapa Memilih
                  <span className="text-gradient-gold"> Aesthetic Pondok Indah</span>?
                </h3>

                <div className="space-y-5">
                  {[
                    {
                      title: "Lengkap & Terpercaya",
                      desc: "Layanan komprehensif dengan tim berpengalaman untuk membantu kebutuhan perawatan gigi Anda.",
                      icon: Users,
                    },
                    {
                      title: "Kualitas Terbaik",
                      desc: "Standar perawatan premium dengan teknologi modern dan tim ahli berpengalaman untuk hasil senyum yang sempurna.",
                      icon: Award,
                    },
                    {
                      title: "Teknologi Terkini",
                      desc: "Fasilitas modern untuk hasil yang presisi, nyaman, dan maksimal.",
                      icon: CheckCircle2,
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-brand-charcoal">{item.title}</p>
                        <p className="text-brand-warm-gray font-body leading-relaxed mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold-light rounded-full mb-6">
                <Target className="w-4 h-4 text-brand-gold" />
                <span className="text-sm font-semibold text-brand-gold font-body">Vision</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                To be the most trusted
                <span className="text-gradient-gold"> dental clinic in Jakarta</span>
              </h2>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body">
                To be the most trusted dental clinic in Jakarta, recognized for delivering innovative dental solutions that enhance smiles, build confidence, and drive long-term value for our patients. We aim to become the pioneers of veneers and wellness-focused dental health care, setting new trends in Jakarta and across Indonesia.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Preview */}
        <section id="testimonials" className="py-14 sm:py-20 bg-brand-cream relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold-light/60 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Mission
                <span className="text-brand-gold"> </span>
              </h2>
              <p className="text-brand-warm-gray font-body">
                To deliver world-class dental care through advanced techniques and cutting-edge technology, empowering patients with healthier, more confident smiles that make a lasting impression.
              </p>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background/80 backdrop-blur-sm border border-brand-gold/10 rounded-2xl p-6 shadow-lg shadow-black/5">
                  <h3 className="text-brand-charcoal font-bold text-lg mb-3">Clinical Excellence</h3>
                  <div className="space-y-3">
                      {[
                        "Advanced techniques and cutting-edge technology",
                        "Top-quality veneer solutions that enhance aesthetics and functionality",
                        "Wellness-focused dental health care as part of overall well-being",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                          <p className="text-brand-warm-gray font-body leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm border border-brand-gold/10 rounded-2xl p-6 shadow-lg shadow-black/5">
                  <h3 className="text-brand-charcoal font-bold text-lg mb-3">Patient Experience</h3>
                  <div className="space-y-3">
                      {[
                        "Empower patients with healthier, more confident smiles",
                        "Position dental care as a long-term investment in health and appearance",
                        "Create a professional yet welcoming environment that feels like home",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                          <p className="text-brand-warm-gray font-body leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="relative bg-brand-gold-light rounded-[2.5rem] p-8 md:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
                  Siap Memulai Perjalanan Menuju Senyum Sempurna?
                </h2>
                <p className="text-brand-warm-gray max-w-2xl mx-auto mb-8 font-body">
                  Jadwalkan konsultasi gratis dengan tim dokter spesialis kami hari ini.
                </p>
                <a href="https://wa.me/6281990114949" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-background text-brand-gold hover:bg-brand-cream font-semibold px-8 rounded-xl shadow-xl h-14 text-base font-body">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Konsultasi Gratis
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
