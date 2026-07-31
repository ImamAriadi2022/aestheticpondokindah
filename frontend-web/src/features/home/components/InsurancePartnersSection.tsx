import { useState } from "react";
import { MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";

type Partner = {
  name: string;
  src: string;
};

const partners: Partner[] = [
  { name: "AdMedika", src: "/partner/Logo-Admedika-NEWW.png" },
  { name: "Asuransi Jasindo", src: "/partner/Jasindo.png" },
  { name: "FWD Insurance", src: "/partner/FWD.png" },
  { name: "BNI Life", src: "/partner/BNI-life.png" },
  { name: "BRI Life", src: "/partner/BRI-life.png" },
  { name: "Sompo Insurance", src: "/partner/Sompo.png" },
  { name: "Pertamina", src: "/partner/Pertamina.png" },
  { name: "Takaful Keluarga", src: "/partner/Takaful.png" },
];

export default function InsurancePartnersSection() {
  const row = [...partners, ...partners];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-brand-gold-light/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm mb-6 border border-border">
            <span className="text-sm font-semibold text-brand-gold font-body">Insurance Partner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
            Insurance
            <span className="text-gradient-gold"> Partner</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-warm-gray font-body">
            Kami bekerja sama dengan berbagai asuransi untuk memudahkan perawatan Anda.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="marquee">
            <div className="marquee__track marquee__track--left !gap-2 sm:!gap-3 lg:!gap-4">
              {row.map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  className="w-[140px] sm:w-[180px] md:w-[200px] h-[80px] sm:h-[95px] flex items-center justify-center px-2 sm:px-3"
                >
                  <PartnerLogo name={p.name} src={p.src} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp CTA for Insurance Benefits */}
        <div className="mt-10 sm:mt-14 flex justify-center">
          <a
            href="https://wa.me/6281990114949?text=Halo%20Aesthetic%2C%20Saya%20mau%20cek%20dental%20benefit%20asuransi%20saya"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-xl shadow-brand-gold/25 hover:shadow-brand-gold/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm text-white/80 font-medium">Cek Benefit Asuransi Anda</p>
              <p className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat WhatsApp Sekarang
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ name, src }: Partner) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="text-sm font-semibold text-brand-charcoal text-center leading-snug">
        {name}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="max-h-[56px] sm:max-h-[64px] w-auto object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
