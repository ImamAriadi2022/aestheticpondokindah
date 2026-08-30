import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { getSession } from "@/core/auth/services/session";
import { initZestaWidget } from "../services/zestaService";

export default function ZestaLiveChat() {
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    // When session is available, initialize with user info
    if (session) {
      const rawPhone = (session as any).whatsapp || (session as any).phone || "";
      const normalizedPhone = rawPhone
        ? (rawPhone.startsWith("+") ? rawPhone : (rawPhone.startsWith("0") ? `+62${rawPhone.slice(1)}` : (rawPhone.startsWith("62") ? `+${rawPhone}` : `+62${rawPhone}`)))
        : undefined;

      initZestaWidget({
        name: session.name,
        email: session.email,
        phone: normalizedPhone,
      });
    } else {
      // Unauthenticated visitor
      initZestaWidget();
    }
  }, [session?.id, location.pathname]);

  return null;
}
