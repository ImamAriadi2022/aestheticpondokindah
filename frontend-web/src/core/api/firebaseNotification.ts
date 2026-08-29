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
      icon: "/logo/logo-vertikal.webp",
      badge: "/logo/logo-vertikal.webp",
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

export const handleDeepLink = (type: string, idUrl?: string, role?: string): string => {
  if (idUrl && (idUrl.startsWith("/") || idUrl.startsWith("#") || idUrl.startsWith("http"))) {
    return idUrl.startsWith("#") ? idUrl : `/#${idUrl.startsWith("/") ? "" : "/"}${idUrl}`;
  }

  const normalizedType = (type || "").toLowerCase();

  if (
    normalizedType === "appointment" ||
    normalizedType === "booking" ||
    normalizedType === "reservation" ||
    normalizedType === "reservation_new" ||
    normalizedType === "reservation_confirmed" ||
    normalizedType === "reservation_cancelled" ||
    normalizedType === "doctor_assigned"
  ) {
    if (role === "clinic") return "/#/dashboard/clinic?tab=reservasi";
    if (role === "doctor") return "/#/dashboard/doctor?tab=reservasi";
    return "/#/dashboard/user?tab=riwayat";
  }

  if (
    normalizedType === "consultation" ||
    normalizedType === "chat" ||
    normalizedType === "konsultasi" ||
    normalizedType === "consultation_message"
  ) {
    if (role === "clinic") return "/#/dashboard/clinic?tab=konsultasi";
    if (role === "doctor") return "/#/dashboard/doctor?tab=konsultasi";
    return "/#/dashboard/user?tab=konsultasi&view=list";
  }

  if (
    normalizedType === "complaint" ||
    normalizedType === "pengaduan" ||
    normalizedType === "complaint_response"
  ) {
    if (role === "clinic") return "/#/dashboard/clinic?tab=pengaduan";
    return "/#/dashboard/user?tab=pengaduan";
  }

  if (normalizedType === "membership") {
    if (role === "clinic") return "/#/dashboard/clinic/membership";
    return "/#/dashboard/user?tab=membership";
  }

  if (normalizedType === "promo") {
    return "/#/promo";
  }

  if (normalizedType === "article" || normalizedType === "blog") {
    return "/#/blog";
  }

  if (normalizedType === "profile") {
    return "/#/settings";
  }

  return role === "clinic"
    ? "/#/dashboard/clinic"
    : role === "doctor"
    ? "/#/dashboard/doctor"
    : "/#/dashboard/user";
};
