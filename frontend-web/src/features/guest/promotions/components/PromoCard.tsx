import { Link } from "react-router";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { getStorageUrl } from "@/core/api/apiConfig";
import type { PromoItem } from "../services/promotionsService";

interface PromoCardProps {
  promo: PromoItem;
}

export function PromoCard({ promo }: PromoCardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-gold/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
        <img
          src={getStorageUrl(promo.image) || "/promo/promo1.jpg"}
          alt={promo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/promo/promo1.jpg";
          }}
        />
        {promo.badge && (
          <div className="absolute top-4 right-4 bg-brand-gold text-white px-3 py-1 rounded-full text-xs font-semibold">
            {promo.badge}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors">
          {promo.title}
        </h3>

        <p className="text-brand-warm-gray text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
          {promo.description}
        </p>

        <div className="space-y-4 pt-4 border-t border-brand-gold/10 mt-auto">
          {promo.validUntil && (
            <div className="flex items-center gap-2 text-xs text-brand-warm-gray">
              <Calendar className="w-3.5 h-3.5 text-brand-gold" />
              <span>Berlaku hingga: {promo.validUntil}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {promo.code ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 rounded-lg text-xs font-mono font-bold text-brand-gold">
                <Tag className="w-3 h-3" />
                {promo.code}
              </div>
            ) : <div />}

            <Link
              to={`/promo/${promo.slug || promo.id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
            >
              Lihat Detail
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
