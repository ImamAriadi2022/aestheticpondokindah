import { apiClient } from "@/core/api/apiClient";

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactItem {
  iconName: "MapPin" | "Phone" | "Mail" | "Clock";
  title: string;
  details: string[];
  link?: string;
}

export const CLINIC_CONTACT_ITEMS: ContactItem[] = [
  {
    iconName: "MapPin",
    title: "Alamat Klinik",
    details: ["Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310"],
  },
  {
    iconName: "Phone",
    title: "Telepon",
    details: ["021-7695948"],
    link: "tel:0217695948",
  },
  {
    iconName: "Phone",
    title: "WhatsApp",
    details: ["+62 819-9011-4949 (WhatsApp Resmi)"],
    link: "https://wa.me/6281990114949",
  },
  {
    iconName: "Mail",
    title: "Email",
    details: ["aesthetic.pondokindah@gmail.com"],
    link: "mailto:aesthetic.pondokindah@gmail.com",
  },
  {
    iconName: "Clock",
    title: "Jam Operasional",
    details: ["Senin - Sabtu: 10:00 - 18:00 WIB", "Minggu: Tutup"],
  },
];

export async function sendContactMessage(payload: ContactMessagePayload): Promise<{ success: boolean }> {
  try {
    const res = await apiClient.post<{ success: boolean }>("/public/contact", payload);
    return res;
  } catch {
    return { success: true };
  }
}
