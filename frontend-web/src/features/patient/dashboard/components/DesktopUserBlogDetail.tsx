import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { API_BASE } from "@/core/api/apiConfig";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Share2,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export default function DesktopUserBlogDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");

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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 text-center text-gray-500 font-medium">
        Memuat isi artikel...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/user")}
          className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <Card className="rounded-2xl border-gray-100 shadow-sm p-8 text-center bg-white space-y-3">
          <BookOpen className="w-12 h-12 text-[#c9a24a] mx-auto opacity-70" />
          <h2 className="text-xl font-bold text-gray-900">Artikel Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500">
            Artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
          Edukasi & Tips Kesehatan Gigi
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="rounded-xl text-xs text-gray-600 hover:bg-amber-50 hover:text-[#c9a24a]"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Bagikan
        </Button>
      </div>

      {/* Main Article Content Card */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="w-full h-72 sm:h-96 overflow-hidden bg-gray-100 relative">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 bg-[#c9a24a] text-white rounded-full text-xs font-bold shadow-md uppercase tracking-wider">
                {post.category || "Edukasi"}
              </span>
            </div>
          </div>
        )}

        <CardContent className="p-6 sm:p-10 space-y-6">
          {/* Category & Title */}
          {!post.cover_image_url && (
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category || "Edukasi"}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pb-6 border-b border-gray-100">
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#c9a24a]" />
                <span>
                  {new Date(post.published_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#c9a24a]" />
              <span>{post.reading_time_minutes ? `${post.reading_time_minutes} mnt baca` : "3 mnt baca"}</span>
            </div>
          </div>

          {/* Article Excerpt */}
          {post.excerpt && (
            <p className="text-sm font-semibold text-[#8b7355] italic bg-amber-50/60 p-4 rounded-2xl border border-amber-100/80 leading-relaxed">
              "{post.excerpt}"
            </p>
          )}

          {/* Article HTML Body */}
          <div
            className="text-gray-800 text-sm sm:text-base leading-relaxed space-y-4
              [&_p]:my-4 [&_p]:text-gray-700
              [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900
              [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900
              [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:text-gray-700
              [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:text-gray-700
              [&_li]:my-1.5
              [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.content_html || post.content || post.excerpt || "" }}
          />

          {/* In-App CTA Box */}
          <div className="mt-8 bg-gradient-to-br from-[#1a1612] via-[#2a2319] to-[#1a1612] rounded-2xl p-6 text-white border border-[#c9a24a]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-white text-base flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[#e8c547]" />
                Ingin Periksa Kesehatan Gigi Anda?
              </h4>
              <p className="text-xs text-[#d4c5b0]">
                Jadwalkan konsultasi rutin atau perawatan dengan dokter spesialis di Aesthetic Pondok Indah Clinic.
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard/user?tab=reservasi")}
              className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl px-5 h-10 text-xs shadow-md shrink-0"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Booking Jadwal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
