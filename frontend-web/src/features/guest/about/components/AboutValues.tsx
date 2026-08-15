import { CheckCircle2 } from "lucide-react";
import { ABOUT_VALUES } from "../services/aboutService";

export function AboutValues() {
  return (
    <section className="py-14 sm:py-20 bg-brand-cream/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold-light rounded-full mb-4">
            <span className="text-sm font-semibold text-brand-gold font-body">Nilai-Nilai Kami</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            Standar Pelayanan Terbaik untuk Anda
          </h2>
          <p className="text-brand-warm-gray font-body">
            Komitmen kami untuk memberikan pengalaman perawatan gigi yang aman, nyaman, dan memuaskan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {ABOUT_VALUES.map((val, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-brand-gold/10 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-gold rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-charcoal mb-3">{val.title}</h3>
              <p className="text-brand-warm-gray font-body leading-relaxed text-sm">{val.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
