import { MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const mapsUrl = "https://maps.app.goo.gl/DDRkJMn5S1M5fqYC7";

  return (
    <section className="py-14 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative bg-brand-gold-light rounded-[2.5rem] p-6 sm:p-8 md:p-16 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          {/* Tooth decoration */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
            <svg viewBox="0 0 100 120" className="w-48 h-48" fill="currentColor">
              <path d="M50 0C35 0 25 12 22 24c-3 12-1 26 3 40 3 10 7 20 10 30 2 7 5 14 7 18 3 5 8 8 8 8s5-3 8-8c2-4 5-11 7-18 3-10 7-20 10-30 4-14 6-28 3-40C75 12 65 0 50 0z"/>
            </svg>
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-brand-charcoal space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Siap untuk Senyum
                <span className="block">yang Lebih Indah?</span>
              </h2>
              <p className="text-base sm:text-lg text-brand-warm-gray leading-relaxed max-w-md font-body">
                Jadwalkan konsultasi gratis dengan dokter spesialis kami dan temukan solusi terbaik untuk kesehatan gigi Anda.
              </p>
              
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                <a href="https://wa.me/6281990114949" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-background text-brand-gold hover:bg-brand-cream font-semibold px-6 sm:px-8 rounded-xl shadow-xl h-12 sm:h-14 text-sm sm:text-base font-body focus-visible:ring-0"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp Sekarang
                  </Button>
                </a>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-brand-charcoal/20 text-brand-charcoal hover:bg-background/40 font-semibold px-6 sm:px-8 rounded-xl h-12 sm:h-14 text-sm sm:text-base font-body focus-visible:ring-0"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Kunjungi Kami
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Content - Map Preview */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-4 border border-background/10 hover:bg-background/15 transition-colors">
                <div className="relative w-full overflow-hidden rounded-xl aspect-[16/10] bg-background/10">
                  <iframe
                    title="Lokasi Aesthetic Pondok Indah"
                    src="https://www.google.com/maps?q=Pondok%20Indah%2C%20Jakarta%20Selatan&output=embed"
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
