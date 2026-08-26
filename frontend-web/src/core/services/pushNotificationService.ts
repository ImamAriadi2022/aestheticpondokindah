// Realtime Push Notification & Web Audio Chime Synthesizer
// Providing WhatsApp / Gojek-like instant notification experience with strict anti-spam deduplication

export interface PushNotificationPayload {
  id?: string;
  title: string;
  message: string;
  sender?: string;
  avatar?: string;
  role?: "admin" | "doctor" | "patient" | "guest" | "all";
  type?: "reservation_new" | "reservation_confirmed" | "reservation_cancelled" | "doctor_assigned" | "general" | string;
  bookingCode?: string;
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
  dateStr?: string;
  timeStr?: string;
  url?: string;
  receivedAt?: string;
  createdAt?: string;
  isRead?: boolean;
  onClick?: () => void;
}

type PushListener = (payload: PushNotificationPayload) => void;
const listeners = new Set<PushListener>();

// -------------------------------------------------------------------------
// ANTI-SPAM DEDUPLICATION & READ-STATE ENGINE
// -------------------------------------------------------------------------
const SEEN_NOTIFS_KEY = "apid_seen_notification_keys";
const READ_NOTIFS_KEY = "apid_read_notification_keys";

function getStoredKeys(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveStoredKeys(key: string, set: Set<string>) {
  try {
    const arr = Array.from(set).slice(-300); // Keep last 300 to prevent growth
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

export function generateNotificationKey(payload: PushNotificationPayload): string {
  if (payload.id && String(payload.id).trim().length > 0) {
    return `id_${payload.id}`;
  }
  const code = (payload.bookingCode || "").trim().toLowerCase();
  const type = (payload.type || "gen").trim().toLowerCase();
  const title = (payload.title || "").trim().toLowerCase();
  if (code) {
    return `code_${type}_${code}`;
  }
  return `text_${type}_${title}_${(payload.message || "").substring(0, 30)}`;
}

export function isNotificationAlreadyDelivered(key: string): boolean {
  const seen = getStoredKeys(SEEN_NOTIFS_KEY);
  const read = getStoredKeys(READ_NOTIFS_KEY);
  return seen.has(key) || read.has(key);
}

export function isNotificationRead(payload: PushNotificationPayload): boolean {
  if (payload.isRead) return true;
  const key = generateNotificationKey(payload);
  const read = getStoredKeys(READ_NOTIFS_KEY);
  return read.has(key);
}

export function markNotificationAsDelivered(key: string) {
  const seen = getStoredKeys(SEEN_NOTIFS_KEY);
  seen.add(key);
  saveStoredKeys(SEEN_NOTIFS_KEY, seen);
}

export function markNotificationAsRead(key: string) {
  const read = getStoredKeys(READ_NOTIFS_KEY);
  read.add(key);
  saveStoredKeys(READ_NOTIFS_KEY, read);
}

export function clearNotificationHistory() {
  try {
    localStorage.removeItem(SEEN_NOTIFS_KEY);
    localStorage.removeItem(READ_NOTIFS_KEY);
    localStorage.removeItem("apig_recent_push_notifications");
    localStorage.setItem("apig_push_unread_count", "0");
  } catch {}
}

/**
 * Play pleasant Web Audio chime once
 */
export function playNotificationChime(type: "new_booking" | "confirmed" | "general" = "new_booking") {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem("apident:notifications_sound_enabled") === "false") {
      return;
    }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === "new_booking") {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {}
    }
  } catch (e) {
    console.warn("[PushAudio] Audio error:", e);
  }
}

/**
 * Register Service Worker for Native Push
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

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    getServiceWorkerRegistration();
  });
}

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
 * Dispatch OS notification to Windows Action Center / Android Notification Shade with Anti-Duplicate Tag
 */
export function dispatchDeviceSystemNotification(payload: PushNotificationPayload, notifKey: string) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  try {
    if (typeof localStorage !== "undefined") {
      if (localStorage.getItem("apident:notifications_enabled") === "false") {
        return;
      }
      if (payload.type === "reservation_new" && localStorage.getItem("apident:notifications_booking_enabled") === "false") {
        return;
      }
      if (payload.type === "consultation" && localStorage.getItem("apident:notifications_consultation_enabled") === "false") {
        return;
      }
      if (payload.type === "complaint" && localStorage.getItem("apident:notifications_complaints_enabled") === "false") {
        return;
      }
    }
  } catch {}

  const targetUrl = payload.url || (
    payload.role === "doctor"
      ? "/#/dashboard/doctor?tab=reservasi"
      : payload.role === "admin"
      ? "/#/dashboard/clinic?tab=reservasi"
      : "/#/dashboard/user?tab=reservasi"
  );

  const origin = window.location.origin || "";
  const iconUrl = `${origin}/logo/logo.png`;
  // Stable tag without timestamp so the OS collapses/replaces identical items
  const stableTag = `apid_${notifKey}`;

  const triggerActualNotifications = async () => {
    try {
      const swReg = await getServiceWorkerRegistration();
      if (swReg && "showNotification" in swReg) {
        // Preferred: ServiceWorker Notification
        await swReg.showNotification(payload.title, {
          body: payload.message,
          icon: iconUrl,
          badge: iconUrl,
          vibrate: [200, 100, 200],
          tag: stableTag,
          renotify: false, // DO NOT spam sound/renotify if tag is identical
          requireInteraction: false,
          data: {
            url: targetUrl,
            bookingCode: payload.bookingCode,
          },
        } as any);
        return;
      }
    } catch {}

    // Fallback: Direct Window Notification (Only if SW is not ready)
    try {
      const notif = new Notification(payload.title, {
        body: payload.message,
        icon: iconUrl,
        badge: iconUrl,
        tag: stableTag,
      } as any);

      notif.onclick = () => {
        window.focus();
        if (payload.onClick) payload.onClick();
        else if (payload.url) window.location.href = payload.url;
        notif.close();
      };
    } catch (e) {
      console.warn("[DeviceNotification] Notification fallback error:", e);
    }
  };

  if (Notification.permission === "granted") {
    triggerActualNotifications();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") triggerActualNotifications();
    });
  }
}

/**
 * Trigger Realtime Push Notification (With Strict Spam Protection)
 */
export function triggerPushNotification(payload: PushNotificationPayload) {
  if (!payload.receivedAt) {
    payload.receivedAt = new Date().toISOString();
  }
  payload.isRead = false;
  const notifKey = generateNotificationKey(payload);

  // 1. Anti-Spam Check: If already seen/read, DO NOT re-trigger!
  if (isNotificationAlreadyDelivered(notifKey)) {
    return;
  }

  // 2. Mark as delivered immediately to block duplicate concurrent events
  markNotificationAsDelivered(notifKey);

  // 3. Play chime sound once
  const chimeType = payload.type === "reservation_new" ? "new_booking" : "confirmed";
  playNotificationChime(chimeType);

  // 4. Dispatch to OS Desktop / Mobile Notification Bar
  dispatchDeviceSystemNotification(payload, notifKey);

  // 5. Notify in-app TopBar UI listeners
  listeners.forEach((listener) => listener(payload));
}

/**
 * Subscribe in-app components to notification stream
 */
export function subscribeToPushNotifications(listener: PushListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
