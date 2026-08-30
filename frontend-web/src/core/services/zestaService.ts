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
      setVisitor?: (visitor: ZestaVisitor) => void;
      [key: string]: any;
    };
  }
}

export const ZESTA_DEFAULT_CHANNEL_ID = "573eb7f7-b6f0-4957-9778-daf531cd967c";
const ZESTA_WIDGET_SCRIPT_ID = "zesta-widget-script";

/**
 * Injects custom CSS to hide the default generic round yellow bubble button in Zesta's shadow DOM
 * so our custom gold styled AESPI launcher button is used seamlessly.
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
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
        }
        #zesta-chat-window {
          bottom: 5.5rem !important;
          right: 1.25rem !important;
          border-radius: 1.25rem !important;
          box-shadow: 0 25px 50px -12px rgba(201, 162, 74, 0.25), 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
        /* Remove Powered by Zesta footer */
        #zesta-chat-window a[href*="zesta.id"],
        #zesta-chat-window a[href*="zesta.id"] *,
        #zesta-chat-window .zw-py-1\\.5,
        #zesta-chat-window > div:last-child {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          max-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          pointer-events: none !important;
        }
        @media (max-width: 640px) {
          #zesta-chat-window {
            bottom: 4.75rem !important;
            right: 0.75rem !important;
            left: 0.75rem !important;
            width: auto !important;
            max-width: calc(100vw - 1.5rem) !important;
          }
        }
      `;
      root.shadowRoot.appendChild(style);
    }

    // Direct DOM fallback removal of branding element
    try {
      const brandingLinks = root.shadowRoot.querySelectorAll('a[href*="zesta.id"]');
      brandingLinks.forEach((link) => {
        const parentDiv = link.closest("div");
        if (parentDiv) {
          parentDiv.style.display = "none";
          parentDiv.style.height = "0px";
          parentDiv.style.padding = "0px";
          parentDiv.style.margin = "0px";
          parentDiv.style.visibility = "hidden";
        }
      });
    } catch {
      // safe
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
  hideDefaultZestaButton();
  const root = document.getElementById("zesta-livechat-root");
  if (root && root.shadowRoot) {
    const toggleBtn = root.shadowRoot.getElementById("zesta-widget-toggle-button") as HTMLButtonElement | null;
    if (toggleBtn) {
      toggleBtn.click();
    }
  }
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
      return chatWin.classList.contains("zw-scale-100");
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
    displayName: "AESPI Live Chat",
    welcomeMessage: "Halo! Selamat datang di Aesthetic Pondok Indah Dental Clinic. Ada yang bisa kami bantu seputar reservasi, jadwal dokter spesialis, atau perawatan gigi?",
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
  }, 400);
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
    displayName: "AESPI Live Chat",
    welcomeMessage: "Halo! Selamat datang di Aesthetic Pondok Indah Dental Clinic. Ada yang bisa kami bantu seputar reservasi, jadwal dokter spesialis, atau perawatan gigi?",
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
