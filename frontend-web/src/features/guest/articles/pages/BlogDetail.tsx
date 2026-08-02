import { Link, useParams } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/core/api/apiConfig";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/public/posts/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="py-10 sm:py-14 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors font-body"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Blog
              </Link>

              {loading ? (
                <div className="mt-10 text-center text-brand-warm-gray font-body">Memuat artikel...</div>
              ) : !post ? (
                <div className="mt-10 rounded-2xl bg-background/80 backdrop-blur ring-1 ring-foreground/10 p-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">
                    Artikel tidak ditemukan
                  </h1>
                  <p className="mt-2 text-brand-warm-gray font-body">
                    Silakan kembali ke halaman blog untuk memilih artikel lainnya.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <div className="inline-flex items-center px-3 py-1 bg-background/90 backdrop-blur text-brand-gold text-xs font-semibold rounded-full font-body ring-1 ring-foreground/10">
                      {post.category}
                    </div>

                    <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal">
                      {post.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-warm-gray font-body">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.reading_time_minutes ? `${post.reading_time_minutes} menit` : ""}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {post ? (
          <section className="py-10 sm:py-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-card">
                  <img
                    src={post.cover_image_url || "/blog/placeholder.jpg"}
                    alt={post.title}
                    className="w-full aspect-[16/9] object-cover"
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
                  dangerouslySetInnerHTML={{ __html: post.content_html || post.content || "" }}
                />

                <div className="mt-12 rounded-2xl bg-brand-cream ring-1 ring-foreground/10 p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">
                    Konsultasi & Jadwal Perawatan
                  </h2>
                  <p className="mt-2 text-brand-warm-gray font-body">
                    Ingin konsultasi terkait kondisi gigi Anda? Hubungi kami untuk jadwal pemeriksaan.
                  </p>
                  <div className="mt-5">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-gold text-white font-semibold font-body shadow-lg shadow-brand-gold/25"
                    >
                      Hubungi Kami
                    </Link>
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
