import { apiClient } from "@/core/api/apiClient";

export interface ClinicStatistic {
  value: string;
  label: string;
  sublabel: string;
}

export interface ClinicValue {
  title: string;
  description: string;
}

export interface ClinicAboutData {
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_paragraphs: string[];
  stats: ClinicStatistic[];
  values: ClinicValue[];
}

export const ABOUT_STATS: ClinicStatistic[] = [
  { value: "15+", label: "Tahun Pengalaman", sublabel: "Melayani dengan standar terbaik" },
  { value: "10k+", label: "Pasien Bahagia", sublabel: "Tersenyum lebih percaya diri" },
  { value: "25+", label: "Dokter Spesialis", sublabel: "Berpengalaman & tersertifikasi" },
  { value: "99%", label: "Tingkat Kepuasan", sublabel: "Ulasan positif dari pasien" },
];

export const ABOUT_VALUES: ClinicValue[] = [
  {
    title: "Patient-Centered Excellence",
    description: "Kenyamanan dan kepuasan pasien adalah prioritas mutlak kami dalam setiap tindakan.",
  },
  {
    title: "Modern Technology",
    description: "Peralatan berstandar internasional untuk diagnosa akurat dan tindakan minim rasa sakit.",
  },
  {
    title: "Highest Hygiene Standards",
    description: "Proses sterilisasi multi-tahap demi menjaga keamanan dan kebersihan maksimal.",
  },
];

export async function fetchPublicAbout(): Promise<ClinicAboutData> {
  const fallback: ClinicAboutData = {
    hero_title: "About The Company Aesthetic Pondok Indah",
    hero_subtitle:
      "At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.",
    story_title: "Professional Care that Puts You First",
    story_paragraphs: [
      "Aesthetic Pondok Indah Dental Clinic didirikan dengan visi menghadirkan perawatan gigi berstandar tinggi yang mengutamakan kenyamanan, estetika alami, dan kesehatan jangka panjang.",
      "Dengan tim dokter spesialis berpengalaman dan teknologi modern, kami berkomitmen memberikan perawatan yang personal dan presisi untuk setiap pasien.",
    ],
    stats: ABOUT_STATS,
    values: ABOUT_VALUES,
  };

  try {
    const data = await apiClient.get<ClinicAboutData>("/public/about");
    if (data && data.hero_title) {
      return data;
    }
  } catch {
    // Fallback
  }
  return fallback;
}
