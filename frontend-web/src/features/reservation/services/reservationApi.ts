import { API_BASE } from "@/lib/apiConfig";
import { logger } from "@/lib/logger";

export interface ReservationData {
  name: string;
  phone: string;
  complaint: string;
  date?: string;
  source?: string;
}

export const WA_NUMBER = "6281990114949";

export const submitPublicReservation = async (data: ReservationData) => {
  try {
    // Persist to DB
    const res = await fetch(`${API_BASE}/public/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        complaint: data.complaint,
        date: data.date || null,
        source: data.source || "booking_new_page",
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    logger.error("Failed to persist reservation:", error);
  }
  return null;
};
