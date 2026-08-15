import { apiClient } from "@/core/api/apiClient";

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export const FAQ_LIST: FAQItem[] = [
  {
    q: "Bagaimana cara melakukan reservasi?",
    a: "Anda dapat melakukan reservasi melalui menu 'Reservasi' di website atau aplikasi, atau menghubungi nomor WhatsApp resmi klinik kami di 0819-9011-4949.",
  },
  {
    q: "Apakah ada biaya pembatalan?",
    a: "Tidak ada biaya pembatalan jika dilakukan minimal 24 jam sebelum jadwal konsultasi/tindakan yang telah disepakati.",
  },
  {
    q: "Apa keuntungan menjadi member?",
    a: "Member mendapatkan potongan harga khusus, poin reward di setiap transaksi perawatan, prioritas reservasi jadwal, dan promo eksklusif bulanan.",
  },
];

export async function fetchPublicFaqs(): Promise<FAQItem[]> {
  try {
    const data = await apiClient.get<any[]>("/public/faqs");
    if (Array.isArray(data) && data.length > 0) {
      return data.map((d) => ({
        q: d.question,
        a: d.answer,
        category: d.category,
      }));
    }
  } catch {
    // Fallback to default
  }
  return FAQ_LIST;
}
