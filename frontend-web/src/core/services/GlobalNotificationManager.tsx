import { useEffect } from "react";
import { getSession } from "@/core/auth/services/session";
import { syncEngine } from "./reservationSyncEngine";

/**
 * Global Realtime Manager with Incremental Change Polling & IndexedDB Sync
 */
export default function GlobalNotificationManager() {
  const session = getSession();
  const token =
    (session as any)?.token ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("apident:token") || localStorage.getItem("auth_token") || ""
      : "");

  useEffect(() => {
    syncEngine.init(token);
  }, [token]);

  return null;
}

/**
 * Broadcast reservation events instantly to all tabs via BroadcastChannel & Sync Engine
 */
export function broadcastRealtimeReservationEvent(data: {
  type: "guest_booked" | "patient_booked" | "reservation_confirmed" | "doctor_assigned";
  bookingCode: string;
  patientName: string;
  serviceName: string;
  doctorName?: string;
  doctorId?: string | number;
  userId?: string | number;
  dateStr?: string;
  timeStr?: string;
  isGuest?: boolean;
}) {
  try {
    syncEngine.broadcastEvent(data);
  } catch (e) {
    console.warn("Could not broadcast realtime event", e);
  }
}
