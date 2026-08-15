import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { ContactItem } from "../services/contactService";

interface ContactInfoCardProps {
  item: ContactItem;
}

export function ContactInfoCard({ item }: ContactInfoCardProps) {
  const getIcon = () => {
    switch (item.iconName) {
      case "MapPin":
        return <MapPin className="w-6 h-6 text-white" />;
      case "Phone":
        return <Phone className="w-6 h-6 text-white" />;
      case "Mail":
        return <Mail className="w-6 h-6 text-white" />;
      case "Clock":
        return <Clock className="w-6 h-6 text-white" />;
      default:
        return <MapPin className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white border border-brand-gold/10 shadow-sm hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-gradient-gold rounded-2xl flex items-center justify-center shrink-0">
        {getIcon()}
      </div>
      <div>
        <h3 className="font-bold text-brand-charcoal mb-1">{item.title}</h3>
        {item.details.map((detail, idx) => (
          <p key={idx} className="text-sm text-brand-warm-gray font-body leading-relaxed">
            {item.link ? (
              <a href={item.link} className="hover:text-brand-gold transition-colors">
                {detail}
              </a>
            ) : (
              detail
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
