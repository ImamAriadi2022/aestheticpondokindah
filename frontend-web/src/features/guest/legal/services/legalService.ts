import { apiClient } from "@/core/api/apiClient";

export interface LegalSection {
  title: string;
  content: string[];
}

export interface LegalDocumentData {
  type: string;
  title: string;
  last_updated: string;
  content: string;
}

export const PRIVACY_POLICY_LAST_UPDATED = "1 Januari 2026";
export const TERMS_OF_SERVICE_LAST_UPDATED = "1 Januari 2026";

export async function fetchPublicLegal(type: "privacy_policy" | "terms_of_service"): Promise<LegalDocumentData> {
  const fallback: LegalDocumentData = {
    type,
    title: type === "terms_of_service" ? "Syarat & Ketentuan Layanan" : "Kebijakan Privasi",
    last_updated: "1 Januari 2026",
    content: type === "terms_of_service"
      ? "Selamat datang di Aesthetic Pondok Indah Dental Clinic. Syarat dan ketentuan berikut mengatur penggunaan seluruh layanan kami, baik melalui website, aplikasi, maupun kunjungan langsung ke klinik.\n\n1. Pendaftaran & Reservasi\nPasien diharapkan memberikan data yang akurat saat melakukan reservasi online.\n\n2. Pembatalan & Penjadwalan Ulang\nPenjadwalan ulang dapat dilakukan minimal 24 jam sebelum waktu janji temu."
      : "Aesthetic Pondok Indah Dental Clinic menghargai dan melindungi privasi setiap pasien dan pengunjung website kami.\n\n1. Informasi yang Kami Kumpulkan\nKami mengumpulkan data nama, kontak telepon, email, dan riwayat kesehatan untuk keperluan pelayanan medis yang aman.\n\n2. Penggunaan Informasi\nInformasi medis hanya digunakan oleh tim dokter yang berwenang demi keselamatan dan kenyamanan tindakan.",
  };

  try {
    const data = await apiClient.get<LegalDocumentData>(`/public/legal/${type}`);
    if (data && data.content) {
      return data;
    }
  } catch {
    // Fallback
  }
  return fallback;
}
