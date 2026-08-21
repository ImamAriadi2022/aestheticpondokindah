import React, { useEffect, useState } from "react";
import {
  Bell,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Building2,
} from "lucide-react";
import {
  subscribeToPushNotifications,
  type PushNotificationPayload,
} from "@/core/services/pushNotificationService";

export default function PushNotificationBanner() {
  const [currentNotif, setCurrentNotif] = useState<PushNotificationPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications((payload) => {
      setCurrentNotif(payload);
      setIsVisible(true);

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000);

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (!currentNotif || !isVisible) return null;

  const handleClick = () => {
    if (currentNotif.onClick) {
      currentNotif.onClick();
    } else if (currentNotif.url) {
      window.location.href = currentNotif.url;
    }
    setIsVisible(false);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[94vw] max-w-lg animate-in slide-in-from-top-6 duration-300 pointer-events-auto">
      <div
        onClick={handleClick}
        className="relative overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-[#8C6B1C] shadow-2xl rounded-2xl sm:rounded-3xl p-4 cursor-pointer hover:shadow-brand-gold/30 hover:scale-[1.01] transition-all group text-left"
      >
        {/* Glowing Gold Accent Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6B1C] via-[#C9A24A] to-[#8C6B1C]" />

        <div className="flex items-start gap-3.5">
          {/* Avatar / App Icon */}
          <div className="w-11 h-11 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {currentNotif.type === "reservation_confirmed" ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : currentNotif.type === "doctor_assigned" ? (
              <Stethoscope className="w-6 h-6 text-[#8C6B1C]" />
            ) : (
              <Bell className="w-6 h-6 text-[#8C6B1C] animate-bounce" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                {currentNotif.sender || "Aesthetic Pondok Indah"}
              </span>
              <span className="text-[10px] text-[#8C8272]">Baru Saja</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-[#2C2416] line-clamp-1 group-hover:text-[#8C6B1C] transition-colors">
              {currentNotif.title}
            </h4>

            <p className="text-[11px] sm:text-xs text-[#5C5546] leading-relaxed line-clamp-2">
              {currentNotif.message}
            </p>

            {currentNotif.bookingCode && (
              <div className="pt-1 flex items-center gap-2 text-[10px] font-semibold text-[#8C6B1C]">
                <span>Kode: {currentNotif.bookingCode}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 underline">
                  <span>Lihat Detail</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#EDE5D6] text-[#7C7365] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
