// Realtime Push Notification & Web Audio Chime Synthesizer
// Providing WhatsApp / Gojek-like instant notification experience

export interface PushNotificationPayload {
  id?: string;
  title: string;
  message: string;
  sender?: string;
  avatar?: string;
  role?: "admin" | "doctor" | "patient" | "guest" | "all";
  type?: "reservation_new" | "reservation_confirmed" | "reservation_cancelled" | "doctor_assigned" | "general";
  bookingCode?: string;
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
  dateStr?: string;
  timeStr?: string;
  url?: string;
  onClick?: () => void;
}

type PushListener = (payload: PushNotificationPayload) => void;
const listeners = new Set<PushListener>();

/**
 * Play a high-quality, pleasant two-tone notification chime using Web Audio API
 */
export function playNotificationChime(type: "new_booking" | "confirmed" | "general" = "new_booking") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === "new_booking") {
      // Pleasant dual bell chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.45, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.85);
    } else if (type === "confirmed") {
      // Bright ascending harp chime (G5 -> B5 -> E6)
      const notes = [783.99, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  } catch (e) {
    console.warn("[PushAudio] Audio synthesis error:", e);
  }
}

/**
 * Register Service Worker for Native Device Push Notifications
 */
let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .catch((err) => {
        console.warn("[ServiceWorker] Registration failed:", err);
        return null;
      });
  }

  return swRegistrationPromise;
}

// Automatically register service worker on load
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    getServiceWorkerRegistration();
  });
}

/**
 * Request notification permission from browser
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn("Could not request notification permission", e);
    }
  }
  return "denied";
}

/**
 * Dispatch notification directly into Android / iOS Notification Bar & Windows / macOS Action Center
 */
export function dispatchDeviceSystemNotification(payload: PushNotificationPayload) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[DeviceNotification] Notification API not supported in this browser.");
    return;
  }

  const targetUrl = payload.url || (
    payload.role === "doctor"
      ? "/#/dashboard/doctor?tab=reservasi"
      : payload.role === "admin"
      ? "/#/dashboard/clinic?tab=reservasi"
      : "/#/dashboard/user?tab=reservasi"
  );

  const origin = window.location.origin || "";
  const iconUrl = `${origin}/logo/logo.png`;
  const uniqueTag = payload.bookingCode
    ? `apig-${payload.bookingCode}-${Date.now()}`
    : `apig-notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const triggerActualNotifications = () => {
    // 1. Direct Native Window Desktop Notification (Instant Pop-up Banner on Windows/macOS)
    try {
      const notif = new Notification(payload.title, {
        body: payload.message,
        icon: iconUrl,
        badge: iconUrl,
        tag: uniqueTag,
        requireInteraction: true,
      } as any);

      notif.onclick = () => {
        window.focus();
        if (payload.onClick) payload.onClick();
        else if (payload.url) window.location.href = payload.url;
        notif.close();
      };
    } catch (e) {
      console.warn("[DeviceNotification] Window Notification constructor fallback:", e);
    }

    // 2. Service Worker Notification (Ensures Mobile Android Shade & PWA Tray delivery)
    try {
      getServiceWorkerRegistration().then((swReg) => {
        if (swReg && "showNotification" in swReg) {
          swReg.showNotification(payload.title, {
            body: payload.message,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [200, 100, 200],
            tag: uniqueTag,
            renotify: true,
            requireInteraction: true,
            data: {
              url: targetUrl,
              bookingCode: payload.bookingCode,
              time: Date.now()
            },
          } as any).catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("[DeviceNotification] ServiceWorker notification error:", e);
    }
  };

  if (Notification.permission === "granted") {
    triggerActualNotifications();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        triggerActualNotifications();
      }
    });
  }
}

/**
 * Trigger an app-like push notification banner + chime + browser notification
 */
export function triggerPushNotification(payload: PushNotificationPayload) {
  const soundType = payload.type === "reservation_confirmed" ? "confirmed" : "new_booking";
  playNotificationChime(soundType);

  // Save to persistent storage history
  try {
    const cached = localStorage.getItem("apig_recent_push_notifications");
    const list: PushNotificationPayload[] = cached ? JSON.parse(cached) : [];
    const updated = [
      {
        ...payload,
        id: payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        dateStr: payload.dateStr || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      },
      ...list.slice(0, 49),
    ];
    localStorage.setItem("apig_recent_push_notifications", JSON.stringify(updated));

    const currentUnread = Number(localStorage.getItem("apig_push_unread_count") || 0);
    localStorage.setItem("apig_push_unread_count", String(currentUnread + 1));
  } catch (e) {}

  // 1. Dispatch to all active in-app banner listeners
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (e) {
      console.warn("[PushNotification] Error in listener:", e);
    }
  });

  // 2. Dispatch to Native Device OS Notification Bar (Mobile Notification Shade & Desktop Action Center)
  dispatchDeviceSystemNotification(payload);
}

/**
 * Subscribe to in-app push notifications
 */
export function subscribeToPushNotifications(listener: PushListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
