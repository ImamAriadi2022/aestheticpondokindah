export interface ZestaVisitorMetadata {
  "Pilih Layanan"?: string;
  "Pilih Dokter"?: string;
  "Pilih Jadwal"?: string;
  "Kode Reservasi"?: string;
  "Tanggal"?: string;
  "Nama Dokter"?: string;
  "last_visit_date"?: string;
  "nama_faskes"?: string;
  [key: string]: any;
}

export interface ZestaVisitor {
  name?: string;
  email?: string;
  phone?: string;
  metadata?: ZestaVisitorMetadata;
}

export interface ZestaConfig {
  channelId: string;
  primaryColor?: string;
  displayName?: string;
  welcomeMessage?: string;
  visitor?: ZestaVisitor;
}

declare global {
  interface Window {
    zestaConfig?: ZestaConfig;
    Zesta?: {
      open?: () => void;
      close?: () => void;
      toggle?: () => void;
      setVisitor?: (visitor: ZestaVisitor) => void;
      [key: string]: any;
    };
  }
}

export const ZESTA_DEFAULT_CHANNEL_ID = "573eb7f7-b6f0-4957-9778-daf531cd967c";
const ZESTA_WIDGET_SCRIPT_ID = "zesta-widget-script";

/**
 * Injects custom CSS to hide the default generic bubble button in Zesta's shadow DOM
 * and styles the chat window elegantly on both Desktop and Mobile viewports.
 */
export function hideDefaultZestaButton(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.getElementById("zesta-livechat-root");
  if (root && root.shadowRoot) {
    if (!root.shadowRoot.getElementById("zesta-custom-theme-style")) {
      const style = document.createElement("style");
      style.id = "zesta-custom-theme-style";
      style.textContent = `
        #zesta-widget-toggle-button {
          position: absolute !important;
          bottom: 0 !important;
          right: 0 !important;
          width: 1px !important;
          height: 1px !important;
          opacity: 0.01 !important;
          pointer-events: auto !important;
          overflow: hidden !important;
          z-index: -1 !important;
        }
        #zesta-chat-window {
          bottom: 5.5rem !important;
          right: 1.5rem !important;
          left: auto !important;
          width: 380px !important;
          max-width: calc(100vw - 2rem) !important;
          height: 540px !important;
          max-height: calc(100vh - 120px) !important;
          border-radius: 1.25rem !important;
          overflow: hidden !important;
          box-shadow: 0 25px 50px -12px rgba(201, 162, 74, 0.25), 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          z-index: 999999 !important;
        }
        /* Message list smooth scroll */
        #zesta-chat-window .zw-flex-1,
        #zesta-chat-window > div:nth-child(2) {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain !important;
        }
        /* Input bar styling */
        #zesta-input-area {
          display: block !important;
          flex-shrink: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
          border-top: 1px solid #f1f5f9 !important;
          background: #ffffff !important;
          padding: 0.5rem 0.75rem !important;
          z-index: 20 !important;
        }
        #zesta-input-area form {
          padding: 0 !important;
        }
        #zesta-chat-input {
          caret-color: #C9A24A !important;
          color: #1f2937 !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
        }
        #zesta-input-area button {
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        /* Hide Powered by Zesta footer branding */
        #zesta-chat-window a[href*="zesta.id"] {
          display: none !important;
          height: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        #zesta-chat-window .zw-py-1\\.5 {
          display: none !important;
          height: 0 !important;
          max-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        /* Mobile specific positioning */
        @media (max-width: 640px) {
          #zesta-chat-window {
            bottom: 5rem !important;
            right: 0.75rem !important;
            left: auto !important;
            width: calc(100vw - 1.5rem) !important;
            max-width: 390px !important;
            height: calc(100dvh - 7.5rem) !important;
            max-height: calc(100dvh - 7.5rem) !important;
          }
        }
      `;
      root.shadowRoot.appendChild(style);
    }
    return true;
  }
  return false;
}

/**
 * Toggle the Zesta Live Chat window.
 */
export function toggleZestaChat() {
  if (typeof document === "undefined") return;

  // 1. Try global method if available
  if (typeof window !== "undefined" && window.Zesta?.toggle) {
    try {
      window.Zesta.toggle();
      return;
    } catch {
      // fallback
    }
  }

  // 2. Try clicking inside shadow DOM with full event dispatch
  hideDefaultZestaButton();
  const root = document.getElementById("zesta-livechat-root");
  if (root && root.shadowRoot) {
    const toggleBtn = root.shadowRoot.getElementById("zesta-widget-toggle-button") as HTMLButtonElement | null;
    if (toggleBtn) {
      toggleBtn.click();
      try {
        toggleBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      } catch {
        // safe
      }
      return;
    }
  }

  // 3. Fallback: If widget not yet loaded, initialize and retry
  initZestaWidget();
  let attempts = 0;
  const retryInterval = setInterval(() => {
    attempts++;
    hideDefaultZestaButton();
    const r = document.getElementById("zesta-livechat-root");
    if (r && r.shadowRoot) {
      const btn = r.shadowRoot.getElementById("zesta-widget-toggle-button") as HTMLButtonElement | null;
      if (btn) {
        btn.click();
        try {
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        } catch {
          // safe
        }
        clearInterval(retryInterval);
      }
    }
    if (attempts > 25) clearInterval(retryInterval);
  }, 100);
}

/**
 * Checks if the Zesta Live Chat window is currently open.
 */
export function isZestaChatOpen(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.getElementById("zesta-livechat-root");
  if (root && root.shadowRoot) {
    const chatWin = root.shadowRoot.getElementById("zesta-chat-window");
    if (chatWin) {
      return chatWin.classList.contains("zw-scale-100") || (chatWin.classList.contains("zw-opacity-100") && !chatWin.classList.contains("zw-opacity-0"));
    }
  }
  return false;
}

/**
 * Initialize Zesta Live Chat Widget globally.
 */
export function initZestaWidget(visitor?: ZestaVisitor) {
  if (typeof window === "undefined") return;

  const currentVisitor = window.zestaConfig?.visitor || {};
  const mergedVisitor: ZestaVisitor = {
    ...currentVisitor,
    ...(visitor || {}),
    metadata: {
      "nama_faskes": "Aesthetic Pondok Indah Dental Clinic",
      ...(currentVisitor.metadata || {}),
      ...(visitor?.metadata || {}),
    },
  };

  window.zestaConfig = {
    channelId: ZESTA_DEFAULT_CHANNEL_ID,
    primaryColor: "#C9A24A",
    displayName: "Aesthetic Pondok Indah",
    welcomeMessage: "Halo, selamat datang di Aesthetic Pondok Indah Dental Clinic. Silakan tanyakan informasi seputar layanan, jadwal praktik dokter, atau bantuan reservasi.",
    visitor: mergedVisitor,
  };

  if (window.Zesta?.setVisitor) {
    try {
      window.Zesta.setVisitor(mergedVisitor);
    } catch {
      // safe fallback
    }
  }

  // Inject widget script if not already present
  if (!document.getElementById(ZESTA_WIDGET_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = ZESTA_WIDGET_SCRIPT_ID;
    script.src = "https://zesta.id/widget.js?v=1";
    script.async = true;
    document.body.appendChild(script);
  }

  // Continuously check & hide default button once shadow root attaches
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const hidden = hideDefaultZestaButton();
    if (hidden || attempts > 25) {
      clearInterval(interval);
    }
  }, 300);
}

/**
 * Updates Zesta visitor metadata with Reservation details.
 */
export function updateZestaReservationContext(data: {
  bookingCode?: string;
  serviceName?: string;
  doctorName?: string;
  date?: string;
  timeSlot?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  lastVisitDate?: string;
}) {
  if (typeof window === "undefined") return;

  const normalizedPhone = data.patientPhone
    ? (data.patientPhone.startsWith("+") ? data.patientPhone : (data.patientPhone.startsWith("0") ? `+62${data.patientPhone.slice(1)}` : (data.patientPhone.startsWith("62") ? `+${data.patientPhone}` : `+62${data.patientPhone}`)))
    : window.zestaConfig?.visitor?.phone;

  const metadata: ZestaVisitorMetadata = {
    ...(window.zestaConfig?.visitor?.metadata || {}),
    "nama_faskes": "Aesthetic Pondok Indah Dental Clinic",
    ...(data.bookingCode && { "Kode Reservasi": data.bookingCode }),
    ...(data.serviceName && { "Pilih Layanan": data.serviceName }),
    ...(data.doctorName && {
      "Pilih Dokter": data.doctorName,
      "Nama Dokter": data.doctorName,
    }),
    ...(data.date && { "Tanggal": data.date }),
    ...(data.timeSlot && { "Pilih Jadwal": data.timeSlot }),
    ...(data.lastVisitDate && { "last_visit_date": data.lastVisitDate }),
  };

  const visitor: ZestaVisitor = {
    name: data.patientName || window.zestaConfig?.visitor?.name,
    email: data.patientEmail || window.zestaConfig?.visitor?.email,
    phone: normalizedPhone,
    metadata,
  };

  window.zestaConfig = {
    channelId: ZESTA_DEFAULT_CHANNEL_ID,
    primaryColor: "#C9A24A",
    displayName: "Aesthetic Pondok Indah",
    welcomeMessage: "Halo, selamat datang di Aesthetic Pondok Indah Dental Clinic. Silakan tanyakan informasi seputar layanan, jadwal praktik dokter, atau bantuan reservasi.",
    visitor,
  };

  if (window.Zesta?.setVisitor) {
    try {
      window.Zesta.setVisitor(visitor);
    } catch {
      // safe
    }
  }
}
