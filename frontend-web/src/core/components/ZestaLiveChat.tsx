import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { MessageCircle, X } from "lucide-react";
import { getSession } from "@/core/auth/services/session";
import {
  initZestaWidget,
  toggleZestaChat,
  isZestaChatOpen,
  hideDefaultZestaButton,
} from "../services/zestaService";

export default function ZestaLiveChat() {
  const location = useLocation();
  const session = getSession();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize and sync Zesta session
  useEffect(() => {
    if (session) {
      const rawPhone = (session as any).whatsapp || (session as any).phone || "";
      const normalizedPhone = rawPhone
        ? (rawPhone.startsWith("+")
          ? rawPhone
          : (rawPhone.startsWith("0")
            ? `+62${rawPhone.slice(1)}`
            : (rawPhone.startsWith("62") ? `+${rawPhone}` : `+62${rawPhone}`)))
        : undefined;

      initZestaWidget({
        name: session.name,
        email: session.email,
        phone: normalizedPhone,
      });
    } else {
      initZestaWidget();
    }
  }, [session?.id, location.pathname]);

  // Show subtle greeting tooltip after 3 seconds, auto hide after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      const hideTimer = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Poll state to check if Zesta chat window was opened or closed internally
  useEffect(() => {
    const interval = setInterval(() => {
      hideDefaultZestaButton();
      const open = isZestaChatOpen();
      setIsOpen(open);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setShowTooltip(false);
    toggleZestaChat();
    setTimeout(() => {
      setIsOpen(isZestaChatOpen());
    }, 150);
  };

  // Only hide on active real-time doctor tele-consultation rooms or dev docs
  const isConsultationChat = location.pathname.includes("/konsultasi/guest/") || location.pathname.includes("/consultation/");
  const isDocsApi = location.pathname === "/docs-api" || location.pathname === "/doc-api";

  if (isConsultationChat || isDocsApi) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-4 sm:bottom-6 sm:right-6 z-[99999] flex items-end gap-2 pointer-events-auto">
      {/* Clean Textual Tooltip */}
      {!isOpen && (
        <div
          className={`relative mb-1.5 sm:mb-2 transition-all duration-500 ease-out ${
            showTooltip
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] text-white px-3 py-2 rounded-xl rounded-br-none shadow-xl shadow-[#C9A24A]/25 max-w-[170px] sm:max-w-[200px] border border-white/20">
            <p className="text-[11px] sm:text-xs font-semibold leading-snug">
              Ada yang bisa kami bantu? Chat langsung dengan tim kami.
            </p>
          </div>
          <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-4 sm:border-l-6 border-l-transparent border-t-4 sm:border-t-6 border-t-[#A67F3A] border-r-4 sm:border-r-6 border-r-transparent"></div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] hover:brightness-105 active:brightness-95 text-white rounded-full px-3.5 py-2.5 sm:px-4.5 sm:py-3 shadow-xl shadow-[#C9A24A]/30 border border-white/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        title="Buka Live Chat Zesta"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
          {isOpen ? (
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          )}
        </div>
        <span className="font-semibold text-xs sm:text-sm tracking-wide pr-1">
          {isOpen ? "Tutup Chat" : "Live Chat"}
        </span>
      </button>
    </div>
  );
}
