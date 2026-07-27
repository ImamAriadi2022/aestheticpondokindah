import { useState } from "react";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Alamat Klinik",
      details: ["Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310"],
    },
    {
      icon: Phone,
      title: "Telepon",
      details: ["021-7695948"],
      link: "tel:0217695948",
    },
    {
      icon: Phone,
      title: "WhatsApp",
      details: ["0819-9011-4949 (hanya menerima pesan)"],
      link: "https://wa.me/6281990114949",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["aesthetic.pondokindah@gmail.com"],
      link: "mailto:aesthetic.pondokindah@gmail.com",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      details: ["Senin - Sabtu: 10:00 - 18:00 WIB", "Minggu: Tutup"],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Kami Siap
                <span className="text-gradient-gold"> Membantu Anda</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Punya pertanyaan atau ingin menjadwalkan konsultasi? 
                Hubungi kami melalui form di bawah atau langsung via WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-charcoal mb-4">Informasi Kontak</h2>
                  <p className="text-brand-warm-gray font-body">
                    Jangan ragu untuk menghubungi kami. Tim kami siap membantu menjawab pertanyaan Anda.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-brand-gold-light rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-brand-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-charcoal mb-1">{item.title}</h3>
                        {item.details.map((detail, i) => (
                          item.link ? (
                            <a key={i} href={item.link} className="block text-brand-warm-gray hover:text-brand-gold transition-colors font-body">
                              {detail}
                            </a>
                          ) : (
                            <p key={i} className="text-brand-warm-gray font-body">{detail}</p>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick WhatsApp */}
                <div className="bg-gradient-gold rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Butuh Respon Cepat?</h3>
                  <p className="text-white/90 text-sm mb-4 font-body">
                    Hubungi kami langsung via WhatsApp untuk respon lebih cepat.
                  </p>
                  <a href="https://wa.me/6281990114949" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-background text-brand-gold hover:bg-brand-cream font-semibold rounded-xl font-body">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat via WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-brand-cream rounded-3xl p-8 md:p-10">
                  <h2 className="text-2xl font-bold text-brand-charcoal mb-6">Kirim Pesan</h2>
                  
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-brand-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-brand-gold" />
                      </div>
                      <h3 className="text-xl font-bold text-brand-charcoal mb-2">Pesan Terkirim!</h3>
                      <p className="text-brand-warm-gray font-body">
                        Terima kasih telah menghubungi kami. Tim kami akan segera merespon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-brand-charcoal mb-2 font-body">
                            Nama Lengkap
                          </label>
                          <Input
                            type="text"
                            placeholder="Nama Anda"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 font-body"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-charcoal mb-2 font-body">
                            Email
                          </label>
                          <Input
                            type="email"
                            placeholder="email@anda.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 font-body"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-brand-charcoal mb-2 font-body">
                            Nomor Telepon
                          </label>
                          <Input
                            type="tel"
                            placeholder="+62 xxx xxxx xxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 font-body"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-charcoal mb-2 font-body">
                            Subjek
                          </label>
                          <Input
                            type="text"
                            placeholder="Perihal pesan Anda"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="h-12 font-body"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-2 font-body">
                          Pesan
                        </label>
                        <Textarea
                          placeholder="Tulis pesan Anda di sini..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="min-h-[150px] font-body"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-gold hover:opacity-90 text-white font-semibold h-14 rounded-xl shadow-lg shadow-brand-gold/25 font-body"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Kirim Pesan
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-14 sm:py-20 bg-brand-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
                Lokasi
                <span className="text-gradient-gold"> Klinik</span>
              </h2>
              <p className="text-brand-warm-gray font-body">
                Kunjungi klinik kami di Pondok Indah, Jakarta Selatan.
              </p>
            </div>

            <div className="bg-background rounded-3xl overflow-hidden shadow-xl shadow-black/5">
              <a
                href="https://maps.app.goo.gl/DDRkJMn5S1M5fqYC7"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <iframe
                  src="https://www.google.com/maps?q=Klinik+Gigi+Aesthetic+Pondok+Indah&output=embed"
                  width="100%"
                  height="450"
                  style={{ border: 0, pointerEvents: "none" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Aesthetic Pondok Indah"
                />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
