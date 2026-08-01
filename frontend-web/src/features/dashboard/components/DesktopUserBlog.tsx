import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_BASE } from "@/shared/lib/apiConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Search,
} from "lucide-react";

export default function DesktopUserBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/public/posts`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-8 text-white border border-[#c9a24a]/30 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#c9a24a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a24a]/20 text-[#e8c547] text-xs font-semibold border border-[#c9a24a]/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Edukasi & Artikel Kesehatan Gigi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tips Senyum Sehat & Perawatan Gigi
            </h1>
            <p className="text-sm text-[#d4c5b0] max-w-xl">
              Informasi terpercaya seputar kesehatan mulut, perawatan estetik, dan panduan gigi dari dokter spesialis Aesthetic Pondok Indah.
            </p>
          </div>

          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel..."
                className="pl-10 h-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl text-xs focus:border-[#c9a24a]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Memuat artikel...</div>
      ) : filteredPosts.length === 0 ? (
        <Card className="rounded-2xl border-gray-100 shadow-sm p-8 text-center bg-white space-y-3">
          <BookOpen className="w-12 h-12 text-[#c9a24a] mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-gray-900">Belum Ada Artikel</h2>
          <p className="text-xs text-gray-500">
            Nantikan artikel edukasi kesehatan gigi terbaru dari tim dokter kami.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {post.cover_image_url ? (
                  <div className="w-full h-44 overflow-hidden bg-gray-100">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-[#c9a24a]/20 to-amber-100/50 flex items-center justify-center text-[#c9a24a]">
                    <BookOpen className="w-10 h-10 opacity-60" />
                  </div>
                )}

                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full font-semibold">
                      {post.category || "Edukasi"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#c9a24a]" />
                      {post.reading_time_minutes ? `${post.reading_time_minutes} mnt` : "3 mnt"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {post.excerpt || post.description}
                  </p>

                  {post.published_at && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="px-5 pb-5 pt-0">
                <button
                  onClick={() => navigate(`/dashboard/user?tab=blog-detail&slug=${post.slug}`)}
                  className="w-full py-2 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
