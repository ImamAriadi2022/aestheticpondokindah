import { registerDeviceToken } from "@/core/api/notificationApi";

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[PushNotification] Notification API tidak didukung di browser ini.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("[PushNotification] Izin notifikasi diberikan.");
      return true;
    }
  }

  return false;
};

export const initializePushNotifications = async (): Promise<void> => {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Generate web push / device token
  try {
    let mockDeviceToken = localStorage.getItem("apig_device_token");
    if (!mockDeviceToken) {
      mockDeviceToken = `fcm_web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("apig_device_token", mockDeviceToken);
    }

    // Register to backend API
    await registerDeviceToken(mockDeviceToken);
  } catch (e) {
    console.warn("[PushNotification] Error initializing push notifications:", e);
  }
};

export const showLocalNotification = (title: string, body: string, deepLink?: string) => {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    const notif = new Notification(title, {
      body,
      icon: "/logo/logo.png",
      badge: "/logo/logo.png",
      tag: "apig-notification",
    });

    notif.onclick = () => {
      window.focus();
      if (deepLink) {
        window.location.href = deepLink;
      }
      notif.close();
    };
  }
};

export const handleDeepLink = (type: string, idUrl?: string): string => {
  switch (type) {
    case "appointment":
      return idUrl || "/#/booking";
    case "membership":
      return idUrl || "/#/membership";
    case "promo":
      return idUrl || "/#/promo";
    case "article":
      return idUrl || "/#/blog";
    case "profile":
      return "/#/settings";
    default:
      return "/#/";
  }
};
