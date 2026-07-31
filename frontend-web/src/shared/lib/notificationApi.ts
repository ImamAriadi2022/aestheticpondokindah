import { API_BASE } from "./apiConfig";

export interface AppNotification {
  id: string | number;
  title: string;
  body: string;
  type: "appointment" | "membership" | "promo" | "article" | "general";
  deep_link?: string;
  data?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}

const LOCAL_STORAGE_KEY = "apig_notifications_cache_v1";

const getAuthToken = (): string | null => {
  return localStorage.getItem("apident:token") || localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

// Helper: Get offline cached notifications
const getOfflineCache = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("[NotificationApi] Error reading offline cache:", e);
  }
  return [];
};

const saveOfflineCache = (items: AppNotification[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("[NotificationApi] Error saving offline cache:", e);
  }
};

export const fetchNotifications = async (): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
  const token = getAuthToken();

  if (!navigator.onLine || !token) {
    const cached = getOfflineCache();
    const unread = cached.filter((n) => !n.read_at).length;
    return { notifications: cached, unreadCount: unread };
  }

  try {
    const res = await fetch(`${API_BASE}/user/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      saveOfflineCache(data.notifications || []);
      return {
        notifications: data.notifications || [],
        unreadCount: data.unread_count || 0,
      };
    }
  } catch (e) {
    console.warn("[NotificationApi] Fetch failed, returning offline cache:", e);
  }

  const cached = getOfflineCache();
  const unread = cached.filter((n) => !n.read_at).length;
  return { notifications: cached, unreadCount: unread };
};

export const markNotificationRead = async (id: string | number): Promise<boolean> => {
  const token = getAuthToken();

  // Always update local offline state immediately
  const cached = getOfflineCache();
  const updated = cached.map((n) => (String(n.id) === String(id) ? { ...n, read_at: new Date().toISOString() } : n));
  saveOfflineCache(updated);

  if (token && navigator.onLine) {
    try {
      await fetch(`${API_BASE}/user/notifications/${id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.warn("[NotificationApi] Offline: mark read queued locally", e);
    }
  }

  return true;
};

export const markAllNotificationsRead = async (): Promise<boolean> => {
  const token = getAuthToken();

  const cached = getOfflineCache();
  const updated = cached.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
  saveOfflineCache(updated);

  if (token && navigator.onLine) {
    try {
      await fetch(`${API_BASE}/user/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.warn("[NotificationApi] Offline: mark all read queued locally", e);
    }
  }

  return true;
};

export const deleteNotification = async (id: string | number): Promise<boolean> => {
  const token = getAuthToken();

  const cached = getOfflineCache();
  const updated = cached.filter((n) => String(n.id) !== String(id));
  saveOfflineCache(updated);

  if (token && navigator.onLine) {
    try {
      await fetch(`${API_BASE}/user/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.warn("[NotificationApi] Offline: delete queued locally", e);
    }
  }

  return true;
};

export const clearAllNotifications = async (): Promise<boolean> => {
  const token = getAuthToken();

  saveOfflineCache([]);

  if (token && navigator.onLine) {
    try {
      await fetch(`${API_BASE}/user/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.warn("[NotificationApi] Offline: clear all queued locally", e);
    }
  }

  return true;
};

export const registerDeviceToken = async (deviceToken: string): Promise<boolean> => {
  const token = getAuthToken();
  if (!token || !navigator.onLine) return false;

  try {
    const res = await fetch(`${API_BASE}/user/device-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        device_token: deviceToken,
        platform: "web",
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("[NotificationApi] Failed to register device token:", e);
    return false;
  }
};
