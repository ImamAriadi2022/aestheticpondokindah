import { Link } from "react-router";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "../services/articleService";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-3xl overflow-hidden border border-brand-gold/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
        <img
          src={post.image || "/blog/default.jpg"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/blog/default.jpg";
          }}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-brand-gold">
          {post.category}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs text-brand-warm-gray mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.publishDate || "Terbaru"}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-brand-charcoal mb-3 group-hover:text-brand-gold transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-brand-warm-gray text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <Link
          to={`/blog/${post.slug || post.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors mt-auto"
        >
          Baca Selengkapnya
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
