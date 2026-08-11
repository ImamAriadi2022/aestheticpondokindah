import { Link } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/core/api/apiConfig";

const categories = ["Semua", "Estetika", "Tips", "Ortodonti", "Anak", "Restoratif", "Informasi"] as const;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [apiPosts, setApiPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/public/posts`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setApiPosts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const posts = apiPosts;
  const filteredPosts = activeCategory === "Semua"
    ? posts
    : posts.filter((post: any) => post.category === activeCategory);

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
                Tips & Informasi
                <span className="text-gradient-gold"> Kesehatan Gigi</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Dapatkan informasi terbaru seputar kesehatan gigi, tips perawatan, 
                dan berbagai artikel edukatif dari tim dokter kami.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all font-body ${
                    activeCategory === category
                      ? "bg-gradient-gold text-white shadow-lg shadow-brand-gold/25"
                      : "bg-brand-cream text-brand-charcoal hover:bg-brand-gold-light"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12 text-brand-warm-gray font-body">Memuat artikel...</div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post: any) => (
                <article key={post.id} className="group">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="relative overflow-hidden rounded-2xl mb-4">
                      <img
                        src={post.cover_image_url || "/blog/placeholder.jpg"}
                        alt={post.title}
                        className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-background/90 backdrop-blur text-brand-gold text-xs font-semibold rounded-full font-body">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-brand-warm-gray mb-3 font-body">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.reading_time_minutes ? `${post.reading_time_minutes} menit` : ""}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-brand-warm-gray font-body line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <span className="inline-flex items-center text-brand-gold font-semibold text-sm font-body group-hover:gap-2 transition-all">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
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
