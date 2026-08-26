import { Link } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { updateMetaTags, resetMetaTags } from "@/features/guest/seo/services/metaTags";

export default function PromoPage() {
  const [promos, setPromos] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_public_promos");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(promos.length === 0);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        let data: any = null;
        try {
          const res = await fetch(`${API_BASE}/promos`, { headers: { Accept: "application/json" } });
          if (res.ok) data = await res.json();
        } catch {}

        if (!data || (Array.isArray(data) && data.length === 0)) {
          try {
            const res = await fetch(`${API_BASE}/public/promos`, { headers: { Accept: "application/json" } });
            if (res.ok) data = await res.json();
          } catch {}
        }

        const rawList = Array.isArray(data) ? data : data?.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const activeList = rawList.filter((p: any) => p.is_active !== false && p.enabled !== false);
          setPromos(activeList);
          try {
            localStorage.setItem("apig_cached_public_promos", JSON.stringify(activeList));
          } catch {}
        }
      } catch (err) {
        console.warn("Failed fetching promos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();

    updateMetaTags({
      title: "Promo Spesial Aesthetic Pondok Indah Dental Clinic",
      description:
        "Dapatkan penawaran menarik untuk perawatan gigi estetik. Jangan lewatkan kesempatan untuk senyum lebih percaya diri.",
      image: `${window.location.origin}/logo/logo.png`,
      url: `${window.location.origin}/promo`,
    });

    return () => resetMetaTags();
  }, []);

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
                Promo Spesial
                <span className="text-gradient-gold"> Aesthetic Dental</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Dapatkan penawaran menarik untuk perawatan gigi estetik Anda.
                Jangan lewatkan kesempatan untuk senyum lebih percaya diri.
              </p>
            </div>
          </div>
        </section>

        {/* Promo Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12 text-brand-warm-gray font-body">
                Memuat promo...
              </div>
            ) : promos.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-2xl bg-background/80 backdrop-blur ring-1 ring-foreground/10 p-8 max-w-lg mx-auto">
                  <Tag className="w-10 h-10 text-brand-gold mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-brand-charcoal">
                    Belum ada promo
                  </h2>
                  <p className="mt-2 text-brand-warm-gray font-body">
                    Nantikan promo menarik dari kami segera.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promos.map((promo: any) => (
                  <article key={promo.id} className="group">
                    <Link to={`/promo/${promo.slug}`} className="block">
                      <div className="relative overflow-hidden rounded-2xl mb-4">
                        <img
                          src={getStorageUrl(promo.image_url) || "/blog/placeholder.jpg"}
                          alt={promo.title}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-3 py-1 bg-gradient-gold text-white text-xs font-semibold rounded-full font-body">
                            Promo
                          </span>
                        </div>
                        {promo.category && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur text-brand-charcoal text-xs font-semibold rounded-full font-body">
                              {promo.category}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-brand-warm-gray mb-3 font-body">
                        {promo.ends_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Berlaku sampai{" "}
                            {new Date(promo.ends_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                        {promo.title}
                      </h2>
                      <p className="text-brand-warm-gray font-body line-clamp-2 mb-4">
                        {promo.description}
                      </p>

                      <span className="inline-flex items-center text-brand-gold font-semibold text-sm font-body group-hover:gap-2 transition-all">
                        Lihat Detail <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
