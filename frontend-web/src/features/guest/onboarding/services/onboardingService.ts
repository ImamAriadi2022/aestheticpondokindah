export interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  bgColor: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "Senyum Sehat",
    subtitle: "Percaya Diri Meningkat",
    description: "Layanan perawatan gigi modern untuk senyum terbaik Anda",
    bgColor: "from-[#1a1a2e] to-[#16213e]",
  },
  {
    title: "Dokter Profesional",
    subtitle: "Berpengalaman",
    description: "Tim dokter gigi berpengalaman dan tersertifikasi",
    bgColor: "from-[#16213e] to-[#1a1a2e]",
  },
  {
    title: "Mudah & Cepat",
    subtitle: "Reservasi Online",
    description: "Booking janji temu kapan saja, di mana saja",
    bgColor: "from-[#1a1a2e] to-[#0f3460]",
  },
];

export function markOnboardingSeen() {
  localStorage.setItem("apident:onboarding_seen", "true");
}

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem("apident:onboarding_seen") === "true";
}
