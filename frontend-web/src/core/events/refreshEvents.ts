import { useEffect } from "react";

/**
 * Event name for requesting an in-place data refresh on the active page/tab.
 */
export const APP_REFRESH_EVENT = "app:refresh-data";

/**
 * Dispatches an event to trigger in-place data reload for the current active page/tab.
 * Optionally includes the target scope/tab if known.
 */
export function triggerPageRefresh(detail?: { tab?: string; pathname?: string }): void {
  if (typeof window === "undefined") return;
  const event = new CustomEvent(APP_REFRESH_EVENT, {
    detail: detail || {},
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
}

/**
 * React hook to listen for the navbar refresh event and trigger a local reload function.
 * @param onRefresh Callback function to reload page data (can be async)
 * @param enabled Whether listener is active (defaults to true)
 */
export function usePageRefresh(onRefresh: () => void | Promise<any>, enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let lastExecution = 0;
    const THROTTLE_MS = 2000; // Mencegah pemanggilan ganda dalam 2 detik

    const handleRefresh = () => {
      const now = Date.now();
      if (now - lastExecution < THROTTLE_MS) return;
      lastExecution = now;

      try {
        const result = onRefresh();
        if (result && typeof result.then === "function") {
          result.catch((err) => console.error("Error refreshing page data:", err));
        }
      } catch (err) {
        console.error("Error invoking refresh handler:", err);
      }
    };

    // 1. Trigger via event internal app (misal klik refresh atau CRUD selesai)
    window.addEventListener(APP_REFRESH_EVENT, handleRefresh);

    // 2. Trigger otomatis saat pengguna membuka/fokus kembali ke tab ini
    const handleRevalidation = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        handleRefresh();
      }
    };
    window.addEventListener("focus", handleRevalidation);
    document.addEventListener("visibilitychange", handleRevalidation);

    return () => {
      window.removeEventListener(APP_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRevalidation);
      document.removeEventListener("visibilitychange", handleRevalidation);
    };
  }, [onRefresh, enabled]);
}
