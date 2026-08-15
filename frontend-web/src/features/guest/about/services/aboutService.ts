export interface ClinicStatistic {
  value: string;
  label: string;
  sublabel: string;
}

export interface ClinicValue {
  title: string;
  description: string;
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
