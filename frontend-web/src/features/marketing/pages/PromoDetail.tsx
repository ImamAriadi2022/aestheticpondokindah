import { Link, useParams } from "react-router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE, getStorageUrl } from "@/lib/apiConfig";
import { Button } from "@/components/ui/button";
import { updateMetaTags, resetMetaTags } from "@/lib/metaTags";

const WA_NUMBER = "6281990114949";

export default function PromoDetailPage() {
  const { slug } = useParams();
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/public/promos/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setPromo(data);
        setLoading(false);

        if (data) {
          const imageUrl = getStorageUrl(data.image_url) || "https://aestheticpondokindah.web.id/logo/logo.png";
          updateMetaTags({
            title: `${data.title} | Aesthetic Pondok Indah`,
            description:
              data.description || "Dapatkan penawaran menarik untuk perawatan gigi estetik.",
            image: imageUrl,
            url: `${window.location.origin}/promo/${data.slug}`,
          });
        }
      })
      .catch(() => setLoading(false));

    return () => resetMetaTags();
  }, [slug]);

  const contactWhatsApp = promo?.contact_whatsapp || WA_NUMBER;
  const waMessage = `Halo Admin Aesthetic Pondok Indah, saya ingin klaim promo: ${promo?.title || ""}`;
  const waLink = `https://wa.me/${contactWhatsApp.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="py-10 sm:py-14 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/promo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors font-body"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Promo
              </Link>

              {loading ? (
                <div className="mt-10 text-center text-brand-warm-gray font-body">
                  Memuat promo...
                </div>
              ) : !promo ? (
                <div className="mt-10 rounded-2xl bg-background/80 backdrop-blur ring-1 ring-foreground/10 p-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">
                    Promo tidak ditemukan
                  </h1>
                  <p className="mt-2 text-brand-warm-gray font-body">
                    Silakan kembali ke halaman promo untuk melihat promo lainnya.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center px-3 py-1 bg-gradient-gold text-white text-xs font-semibold rounded-full font-body">
                        Promo Spesial
                      </div>
                      {promo.category && (
                        <div className="inline-flex items-center px-3 py-1 bg-brand-cream text-brand-charcoal text-xs font-semibold rounded-full font-body">
                          {promo.category}
                        </div>
                      )}
                    </div>

                    <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal">
                      {promo.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-warm-gray font-body">
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
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {promo ? (
          <section className="py-10 sm:py-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-card">
                  <img
                    src={getStorageUrl(promo.image_url) || "/blog/placeholder.jpg"}
                    alt={promo.title}
                    className="w-full aspect-square object-cover"
                  />
                </div>

                <div
                  className="mt-8 text-brand-charcoal font-body leading-relaxed text-[15px] sm:text-base
                    [&_p]:my-4 [&_p]:text-brand-warm-gray
                    [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-brand-charcoal
                    [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-brand-charcoal
                    [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:text-brand-warm-gray
                    [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:text-brand-warm-gray
                    [&_li]:my-1.5
                    [&_strong]:text-brand-charcoal"
                  dangerouslySetInnerHTML={{
                    __html: promo.content_html || promo.description || "",
                  }}
                />

                <div className="mt-12 rounded-2xl bg-brand-cream ring-1 ring-foreground/10 p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">
                    Tertarik dengan promo ini?
                  </h2>
                  <p className="mt-2 text-brand-warm-gray font-body">
                    Hubungi admin kami sekarang untuk klaim promo dan jadwalkan
                    konsultasi Anda.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-gradient-gold hover:opacity-90 text-white font-semibold font-body shadow-lg shadow-brand-gold/25 rounded-xl px-5 py-3 h-auto">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {promo.button_label || "Hubungi Admin"}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
