import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Bot, MessageCircle, X } from "lucide-react";
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

  // Show speech bubble tooltip after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Poll state to check if Zesta chat window was opened or closed internally
  useEffect(() => {
    const interval = setInterval(() => {
      hideDefaultZestaButton();
      const open = isZestaChatOpen();
      setIsOpen(open);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setShowTooltip(false);
    toggleZestaChat();
    setTimeout(() => {
      setIsOpen(isZestaChatOpen());
    }, 150);
  };

  // AESPI Bot is strictly for public visitors without login (guest web)
  // Hide completely for all logged-in actors (patient, doctor, clinic admin) and dashboard paths
  const isLoggedIn = Boolean(session) || Boolean(localStorage.getItem("apident:token"));
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isConsultation = location.pathname.startsWith("/konsultasi");
  const isDocsApi = location.pathname === "/docs-api" || location.pathname === "/doc-api";

  if (isLoggedIn || isDashboard || isConsultation || isDocsApi) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 flex items-end gap-1.5 sm:gap-2">
      {/* Speech Bubble Tooltip - Slides from button */}
      {!isOpen && (
        <div
          className={`relative mb-1.5 sm:mb-2 transition-all duration-500 ease-out ${
            showTooltip
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl rounded-br-none shadow-lg shadow-[#C9A24A]/25 max-w-[150px] sm:max-w-[190px] border border-white/20">
            <p className="text-[10px] sm:text-xs font-semibold leading-snug">
              Bingung mulai dari mana? AESPI Bot bisa bantu!
            </p>
          </div>
          <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-4 sm:border-l-6 border-l-transparent border-t-4 sm:border-t-6 border-t-[#B8943F] border-r-4 sm:border-r-6 border-r-transparent"></div>
        </div>
      )}

      {/* Floating Launcher Button with Old Version's Aesthetic Pill Style */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] hover:brightness-105 active:brightness-95 text-white rounded-full px-3 py-2 sm:px-4 sm:py-3 shadow-xl shadow-[#C9A24A]/30 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        title="Buka Chat Bantuan & Reservasi"
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
          {isOpen ? (
            <X className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white animate-pulse" />
          )}
        </div>
        <span className="font-bold text-[11px] sm:text-sm tracking-wide pr-0.5">
          {isOpen ? "Tutup Chat" : "AESPI Bot"}
        </span>
      </button>
    </div>
  );
}
