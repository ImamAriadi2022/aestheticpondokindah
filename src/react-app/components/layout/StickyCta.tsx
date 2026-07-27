import { Link, useLocation } from "react-router";
import { MessageCircle, Calendar } from "lucide-react";
import { submitPublicReservation } from "@/react-app/lib/reservationApi";

export default function StickyCta() {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSettings = location.pathname === "/settings";
  const isHelp = location.pathname === "/help";
  const isLogin = location.pathname === "/login" || location.pathname === "/klinik";

  if (isDashboard || isSettings || isHelp || isLogin) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-border bg-background/95 backdrop-blur shadow-lg shadow-black/10 p-2 flex gap-2">
          <Link
            to="/booking/new"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold text-white font-semibold h-11 text-sm"
          >
            <Calendar className="w-4 h-4" />
            Booking
          </Link>
          <button
            type="button"
            onClick={() => void submitPublicReservation({
              name: "User dari Sticky CTA",
              phone: "08x",
              complaint: "Tanya jadwal dan booking",
              source: "sticky_cta_whatsapp",
            })}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background text-brand-charcoal font-semibold h-11 text-sm"
          >
            <MessageCircle className="w-4 h-4 text-brand-gold" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
