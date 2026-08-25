import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function FeaturesSection() {
  return (
    <section className="py-14 sm:py-20 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-brand-gold-light/40 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-3xl bg-brand-gold/10" />
            <div className="absolute -top-2 left-10 w-10 h-10 rounded-2xl bg-brand-gold/15" />
            <div className="grid grid-cols-[1.25fr_1fr] gap-5 items-end">
              <div className="relative overflow-hidden rounded-[2.25rem] bg-brand-cream border border-border shadow-xl shadow-black/5">
                <img
                  src="/about/tentang1.webp"
                  alt="Dokter"
                  className="w-full h-[340px] object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-[2.25rem] bg-brand-cream border border-border shadow-xl shadow-black/5">
                <img
                  src="/about/tentang2.webp"
                  alt="Perawatan"
                  className="w-full h-[260px] object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 left-10">
              <div className="bg-background rounded-2xl border border-border shadow-xl shadow-black/10 px-6 py-4 flex items-center gap-3">
                <img src="/logo/logo.webp" alt="Aesthetic Pondok Indah" className="h-10 w-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-sm font-semibold text-brand-gold tracking-wide">ABOUT US</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal leading-tight">
              15 Years of Expertise
              <span className="block">in Dental Care</span>
            </h2>
            <p className="text-brand-warm-gray font-body leading-relaxed">
              Kami menghadirkan pengalaman perawatan gigi yang nyaman, modern, dan aman dengan tim dokter profesional.
            </p>

            <div className="space-y-3">
              {[
                "Modern Dental Service You Can Trust",
                "Award-winning Dental Care",
                "Affordable Dental Care for Everyone",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                  </div>
                  <span className="text-brand-charcoal font-body">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button className="bg-gradient-gold hover:opacity-90 text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 font-body">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
