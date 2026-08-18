import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";

export interface ReservationData {
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  treatment_interest?: string;
  doctor_id?: string | number | null;
  complaint?: string;
  date?: string;
  preferred_time?: string;
  source?: string;
  signature_data?: string | null;
}

export const WA_NUMBER = "6281990114949";

interface GuestBookingWhatsAppData {
  name: string;
  phone: string;
  complaint: string;
  date: string;
  waNumber?: string;
}

/** Builds the guest booking message expected by the clinic's WhatsApp admin. */
export const buildGuestBookingWhatsAppUrl = ({
  name,
  phone,
  complaint,
  date,
  waNumber = WA_NUMBER,
}: GuestBookingWhatsAppData) => {
  const lines = [
    "Halo Aesthetic Pondok Indah, saya ingin booking konsultasi.",
    `Nama: ${name}`,
    `No. HP: ${phone}`,
    `Keluhan: ${complaint || "Konsultasi Umum"}`,
    `Waktu: ${date}`,
    "*Dokter akan ditentukan oleh admin*",
  ];

  return `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${lines.map(encodeURIComponent).join("%0A")}`;
};

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
        email: data.email || null,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
        treatment_interest: data.treatment_interest || null,
        doctor_id: data.doctor_id ? Number(data.doctor_id) : null,
        complaint: data.complaint || data.treatment_interest || "Booking Guest",
        date: data.date || null,
        preferred_time: data.preferred_time || "10:00",
        source: data.source || "guest_web",
        signature_data: data.signature_data || null,
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
