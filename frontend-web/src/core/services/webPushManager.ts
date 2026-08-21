import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";
import { getSession } from "@/core/auth/services/session";
import { getServiceWorkerRegistration } from "./pushNotificationService";
import { toast } from "@/shared/ui/toast";

const FALLBACK_VAPID_PUBLIC_KEY = "BHZFSJTgwTDw7EYkAzfgi1gtoenGg1IJsNdCQVOLvxd8TLpIPQkNccQRu1p2RXhB96M3AXEP71_9RuGkK64iM4k";

/**
 * Convert standard base64url string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get VAPID Public Key from backend API or fallback
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const res: any = await apiClient.get("/push/vapid-public-key", { skipToast: true });
    return res?.publicKey || FALLBACK_VAPID_PUBLIC_KEY;
  } catch {
    return FALLBACK_VAPID_PUBLIC_KEY;
  }
}

/**
 * Register and subscribe browser device to Multi-OS Background Web Push
 */
export async function subscribeToWebPush(explicitRole?: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[WebPush] Push notifications not supported by this browser.");
    return false;
  }

  try {
    // 1. Ensure permission is granted
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("[WebPush] Permission not granted:", permission);
      return false;
    }

    // 2. Obtain Service Worker Registration
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      console.warn("[WebPush] Service Worker registration not ready.");
      return false;
    }

    // 3. Get or Renew Push Subscription
    const vapidPublicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const session = getSession();
    const role = explicitRole || session?.role || "guest";
    const subJson = subscription.toJSON();

    // 4. Send subscription to Laravel Backend
    await apiClient.post("/push/subscribe", {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      role,
      contentEncoding: "aes128gcm",
    }, { skipToast: true });

    localStorage.setItem("apig_webpush_subscribed", "true");
    console.log("[WebPush] Device successfully subscribed to Background Cloud Push:", subJson.endpoint);
    return true;
  } catch (err) {
    console.warn("[WebPush] Failed to subscribe to Web Push:", err);
    return false;
  }
}

/**
 * Send real test push notification from backend to this device
 */
export async function sendTestBackgroundPush(): Promise<boolean> {
  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    const subJson = subscription ? subscription.toJSON() : null;

    const res: any = await apiClient.post("/push/test", {
      endpoint: subJson?.endpoint || null,
    });

    if (res?.success) {
      toast({
        title: "⚡ Web Push Terkirim!",
        message: "Notifikasi background sedang dikirim dari server ke perangkat Anda.",
        variant: "success",
      });
      return true;
    } else {
      toast({
        title: "Perangkat Belum Terdaftar",
        message: res?.message || "Silakan izinkan notifikasi terlebih dahulu.",
        variant: "error",
      });
      return false;
    }
  } catch (err: any) {
    toast({
      title: "Gagal Mengirim Test Push",
      message: err?.message || "Terjadi kesalahan jaringan.",
      variant: "error",
    });
    return false;
  }
}
