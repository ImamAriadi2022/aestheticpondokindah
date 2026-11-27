import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/core/api/apiClient";
import { getSession } from "@/core/auth/services/session";
import { useRealtimeReservations } from "./reservationSyncEngine";
import { subscribeToPushNotifications } from "./pushNotificationService";

export interface SubmenuBadgeCounts {
  booking: number;
  konsultasi: number;
  pengaduan: number;
}

const BADGES_CACHE_KEY = "apig_submenu_badge_counts";

function getStoredBadges(): SubmenuBadgeCounts {
  try {
    const raw = localStorage.getItem(BADGES_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { booking: 0, konsultasi: 0, pengaduan: 0 };
}

function saveStoredBadges(counts: SubmenuBadgeCounts) {
  try {
    localStorage.setItem(BADGES_CACHE_KEY, JSON.stringify(counts));
  } catch {}
}

/**
 * Global reactive hook for Sub-Menu Notification Badges
 */
export function useSubmenuBadges(role?: "user" | "clinic" | "doctor"): SubmenuBadgeCounts {
  const [badgeCounts, setBadgeCounts] = useState<SubmenuBadgeCounts>(() => getStoredBadges());
  const { reservations } = useRealtimeReservations();
  const session = getSession();
  const activeRole = role || (session?.role as "user" | "clinic" | "doctor") || "user";

  const refreshBadges = useCallback(async () => {
    try {
      let bookingCount = 0;
      let konsultasiCount = 0;
      let pengaduanCount = 0;

      // 1. Calculate Booking Badges from realtime reservations (Status yang Perlu Konfirmasi)
      if (Array.isArray(reservations)) {
        if (activeRole === "clinic") {
          bookingCount = reservations.filter((r: any) => {
            const st = (r.status || "").toLowerCase();
            return st === "baru" || st === "pending" || st === "menunggu" || st === "menunggu konfirmasi" || st === "submitted";
          }).length;
        } else if (activeRole === "doctor") {
          bookingCount = reservations.filter(
            (r: any) =>
              (r.status || "").toLowerCase() === "dikonfirmasi" ||
              (r.status || "").toLowerCase() === "menunggu"
          ).length;
        } else {
          bookingCount = reservations.filter(
            (r: any) =>
              (r.status || "").toLowerCase() === "confirmed" ||
              (r.status || "").toLowerCase() === "dikonfirmasi"
          ).length;
        }
      }

      // 2. Fetch Consultation Badges
      try {
        const consultEndpoint = activeRole === "clinic" ? "/admin/consultations" : "/user/consultations";
        const consultRes: any = await apiClient.get(consultEndpoint, { skipToast: true });
        const consultList = Array.isArray(consultRes)
          ? consultRes
          : consultRes?.data || consultRes?.consultations || [];
        if (Array.isArray(consultList)) {
          if (activeRole === "clinic") {
            konsultasiCount = consultList.filter((c: any) => {
              const st = (c.status || "").toLowerCase();
              return st === "active" || st === "waiting" || st === "open" || st === "menunggu";
            }).length;
          } else {
            konsultasiCount = consultList.filter((c: any) => {
              const st = (c.status || "").toLowerCase();
              return st === "active" || st === "sedang berjalan";
            }).length;
          }
        }
      } catch {}

      // 3. Fetch Complaint Badges
      try {
        const complaintEndpoint = activeRole === "clinic" ? "/admin/complaints?per_page=50" : "/user/complaints";
        const complaintRes: any = await apiClient.get(complaintEndpoint, { skipToast: true });
        const complaintList = Array.isArray(complaintRes)
          ? complaintRes
          : complaintRes?.data || complaintRes?.complaints || [];
        if (Array.isArray(complaintList)) {
          if (activeRole === "clinic") {
            pengaduanCount = complaintList.filter((c: any) => {
              const st = (c.status || "").toLowerCase();
              return st === "pending" || st === "baru" || st === "menunggu";
            }).length;
          } else {
            pengaduanCount = complaintList.filter((c: any) => {
              const st = (c.status || "").toLowerCase();
              return (st === "resolved" || st === "processing") && !c.is_read_by_user;
            }).length;
          }
        }
      } catch {}

      const newCounts: SubmenuBadgeCounts = {
        booking: bookingCount,
        konsultasi: konsultasiCount,
        pengaduan: pengaduanCount,
      };

      setBadgeCounts(newCounts);
      saveStoredBadges(newCounts);
    } catch {}
  }, [activeRole, reservations]);

  // Initial & periodic refresh (hanya saat tab aktif / fokus)
  useEffect(() => {
    refreshBadges();

    // Polling santai 60s
    const interval = setInterval(() => {
      if (typeof document === "undefined" || !document.hidden) {
        refreshBadges();
      }
    }, 60000);

    const handleRevalidation = () => {
      if (!document.hidden) {
        refreshBadges();
      }
    };
    document.addEventListener("visibilitychange", handleRevalidation);
    window.addEventListener("focus", handleRevalidation);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleRevalidation);
      window.removeEventListener("focus", handleRevalidation);
    };
  }, [refreshBadges]);

  // Instant refresh on incoming push notification
  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications(() => {
      refreshBadges();
    });
    return () => unsubscribe();
  }, [refreshBadges]);

  return badgeCounts;
}
