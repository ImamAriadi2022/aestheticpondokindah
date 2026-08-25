import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/core/api/apiConfig";

export default function TestimonialsSection() {
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/public/testimonials`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => { setApiItems(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const testimonials = apiItems.map((t: any) => ({ name: t.name, image: t.photo_url || "/testi/placeholder.webp", content: t.quote, rating: t.rating }));

  const topRow = [...testimonials, ...testimonials];
  const bottomBase = [...testimonials].reverse();
  const bottomRow = [...bottomBase, ...bottomBase];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-brand-gold-light/30 to-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-brand-gold-light/60 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm mb-6">
            <Quote className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold text-brand-gold font-body">Testimoni</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
            Apa Kata
            <span className="text-gradient-gold"> Mereka?</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-warm-gray font-body">
            Kepercayaan ribuan pasien adalah bukti komitmen kami untuk memberikan pelayanan terbaik.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-brand-warm-gray">Memuat testimoni…</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-brand-warm-gray">Belum ada testimoni.</div>
        ) : (
        /* Testimonial Marquee */
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="marquee">
              <div className="marquee__track marquee__track--right">
                {topRow.map((t, idx) => (
                  <div
                    key={`${t.name}-${idx}`}
                    className="w-[320px] sm:w-[420px] bg-background rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/5 border border-brand-gold/10"
                  >
                    <div className="flex items-start gap-5">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-brand-gold-light">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-lg">
                          <Quote className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base sm:text-lg font-bold text-brand-charcoal truncate">{t.name}</h4>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm sm:text-base text-brand-charcoal leading-relaxed font-body line-clamp-4">
                          "{t.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marquee">
              <div className="marquee__track marquee__track--left">
                {bottomRow.map((t, idx) => (
                  <div
                    key={`${t.name}-${idx}`}
                    className="w-[320px] sm:w-[420px] bg-background rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/5 border border-brand-gold/10"
                  >
                    <div className="flex items-start gap-5">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-brand-gold-light">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-lg">
                          <Quote className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base sm:text-lg font-bold text-brand-charcoal truncate">{t.name}</h4>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm sm:text-base text-brand-charcoal leading-relaxed font-body line-clamp-4">
                          "{t.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
