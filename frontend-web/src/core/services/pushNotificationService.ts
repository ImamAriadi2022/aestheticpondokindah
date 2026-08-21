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
 * No external .mp3 download required; works reliably in modern browsers.
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
      osc1.frequency.setValueAtTime(587.33, now); // D5
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
      osc2.frequency.setValueAtTime(880.0, now + 0.12); // A5
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

    // Optional device vibration pattern (100ms vibrate, 50ms pause, 100ms vibrate)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  } catch (e) {
    console.warn("[PushAudio] Audio synthesis not permitted yet by user interaction", e);
  }
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

  // 2. Dispatch to Native Browser Notification API if permitted
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const notif = new Notification(payload.title, {
        body: payload.message,
        icon: payload.avatar || "/logo/logo.png",
        badge: "/logo/logo.png",
        tag: payload.bookingCode || `apig-notif-${Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        if (payload.onClick) payload.onClick();
        else if (payload.url) window.location.href = payload.url;
        notif.close();
      };
    } catch (e) {
      console.warn("[PushNotification] Browser notification error:", e);
    }
  }
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
