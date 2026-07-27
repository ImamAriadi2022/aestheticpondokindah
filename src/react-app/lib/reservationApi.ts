import { API_BASE } from "./apiConfig";
import { logger } from "./logger";

export interface ReservationData {
  name: string;
  phone: string;
  complaint: string;
  date?: string;
  source?: string;
}

export const WA_NUMBER = "6281990114949";

export const submitPublicReservation = async (data: ReservationData) => {
  const timeText = data.date ? `%0AWaktu: ${data.date}` : "";
  const message =
    `Halo Aesthetic Pondok Indah, saya ingin booking konsultasi.%0A` +
    `Nama: ${data.name}%0A` +
    `No. HP: ${data.phone}%0A` +
    `Keluhan: ${data.complaint}` +
    timeText +
    `%0A*Dokter akan ditentukan oleh admin*`;

  try {
    // Attempt to persist to DB
    await fetch(`${API_BASE}/public/reservations`, {
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
        source: data.source || "unknown",
      }),
    });
  } catch (error) {
    logger.error("Failed to persist reservation:", error);
  }

  // Always open WhatsApp regardless of API success
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};
