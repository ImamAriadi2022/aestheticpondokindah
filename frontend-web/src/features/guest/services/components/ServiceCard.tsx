import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router";
import type { ServiceDetail } from "../services/servicesService";

interface ServiceCardProps {
  service: ServiceDetail;
  onOpen: (serviceId: string) => void;
}

export function ServiceCard({ service, onOpen }: ServiceCardProps) {
  const isAvailable = Boolean(service.image);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-brand-gold/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
          }}
        />
        {!isAvailable && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Segera Hadir
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors">
          {service.title}
        </h3>

        <p className="text-brand-warm-gray text-sm leading-relaxed mb-6 line-clamp-3 flex-1 font-body">
          {service.intro}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-brand-gold/10 mt-auto gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpen(service.id)}
            className="text-brand-gold hover:text-brand-gold-dark hover:bg-brand-gold/5 font-semibold text-xs rounded-xl p-0 h-auto gap-1"
          >
            Detail <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Link
            to={`/booking/new?service=${encodeURIComponent(service.title)}`}
            className="inline-flex items-center gap-1 bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs font-semibold h-8 px-3 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" /> Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
