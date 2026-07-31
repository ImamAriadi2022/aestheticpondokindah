import type { DemoRole } from "@/features/auth/services/demoAuth";

export type DemoDoctorSchedule = {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  location: string;
  slotsLeft: number;
};

export type DemoConsultation = {
  id: string;
  userId: string;
  doctorName: string;
  topic: string;
  date: string;
  status: "Selesai" | "Menunggu" | "Dijadwalkan";
};

export type DemoComplaint = {
  id: string;
  userId: string;
  title: string;
  date: string;
  status: "Diproses" | "Selesai" | "Ditanggapi";
};

export type DemoClientRequest = {
  id: string;
  doctorId: string;
  clientName: string;
  topic: string;
  requestedDate: string;
  status: "Baru" | "Dijadwalkan" | "Selesai";
};

export type DemoClientConsultationResult = {
  id: string;
  requestId: string;
  doctorId: string;
  clientName: string;
  submittedAt: string;
  chiefComplaint: string;
  duration: string;
  painScale: number;
  notes?: string;
};

export type DemoScheduledConsultationDone = {
  id: string;
  doctorId: string;
  doctorName: string;
  clientName: string;
  date: string;
  topic: string;
  preferredContact?: string;
  contactNumber?: string;
  chiefComplaint: string;
  duration?: string;
  painScale?: number;
  notes?: string;
};

export type DemoVisitorAnalytics = {
  region: string;
  visitors: number;
  consultationsViaButton: number;
};

export const demoDoctorSchedules: DemoDoctorSchedule[] = [
  {
    id: "s_001",
    doctorId: "d_001",
    doctorName: "drg. Andi Saputra",
    date: "2026-03-05",
    time: "10:00 - 12:00",
    location: "Pondok Indah",
    slotsLeft: 3,
  },
  {
    id: "s_002",
    doctorId: "d_001",
    doctorName: "drg. Andi Saputra",
    date: "2026-03-06",
    time: "14:00 - 16:00",
    location: "Pondok Indah",
    slotsLeft: 1,
  },
  {
    id: "s_003",
    doctorId: "d_002",
    doctorName: "drg. Nabila Putri",
    date: "2026-03-07",
    time: "10:00 - 13:00",
    location: "Pondok Indah",
    slotsLeft: 5,
  },
];

export const demoScheduledConsultationsDone: DemoScheduledConsultationDone[] = [
  {
    id: "scd_001",
    doctorId: "d_001",
    doctorName: "drg. Andi Saputra",
    clientName: "Dina Prameswari",
    date: "2026-03-09",
    topic: "Rencana veneer",
    preferredContact: "WhatsApp/Telepon",
    contactNumber: "-",
    chiefComplaint: "Ingin veneer untuk gigi depan, warna tidak merata.",
    duration: "6+ bulan",
    painScale: 1,
    notes: "Tidak ada alergi obat yang diketahui. Pernah scaling 1 tahun lalu.",
  },
  {
    id: "scd_002",
    doctorId: "d_001",
    doctorName: "drg. Andi Saputra",
    clientName: "Bima Pratama",
    date: "2026-03-06",
    topic: "Nyeri gusi",
    preferredContact: "WhatsApp/Telepon",
    contactNumber: "-",
    chiefComplaint: "Nyeri gusi sebelah kanan, kadang berdarah saat sikat gigi.",
    duration: "1-2 minggu",
    painScale: 6,
    notes: "Tidak merokok. Sering minum kopi. Belum pernah periksa gusi sebelumnya.",
  },
];

export const demoConsultations: DemoConsultation[] = [
  {
    id: "k_001",
    userId: "AESPI_001",
    doctorName: "drg. Andi Saputra",
    topic: "Gigi sensitif saat minum dingin",
    date: "2026-02-18",
    status: "Selesai",
  },
  {
    id: "k_002",
    userId: "AESPI_001",
    doctorName: "drg. Nabila Putri",
    topic: "Rencana bleaching gigi",
    date: "2026-03-02",
    status: "Menunggu",
  },
  {
    id: "k_003",
    userId: "AESPI_001",
    doctorName: "drg. Andi Saputra",
    topic: "Kontrol pasca scaling",
    date: "2026-03-08",
    status: "Dijadwalkan",
  },
];

export const demoComplaints: DemoComplaint[] = [
  {
    id: "p_001",
    userId: "AESPI_001",
    title: "Perubahan jadwal mendadak",
    date: "2026-02-20",
    status: "Selesai",
  },
  {
    id: "p_002",
    userId: "AESPI_001",
    title: "Konfirmasi pembayaran",
    date: "2026-03-01",
    status: "Diproses",
  },
];

export const demoClientRequests: DemoClientRequest[] = [
  {
    id: "cr_001",
    doctorId: "d_001",
    clientName: "Dina Prameswari",
    topic: "Rencana veneer",
    requestedDate: "2026-03-09",
    status: "Baru",
  },
  {
    id: "cr_002",
    doctorId: "d_001",
    clientName: "Bima Pratama",
    topic: "Nyeri gusi",
    requestedDate: "2026-03-06",
    status: "Dijadwalkan",
  },
];

export const demoClientConsultationResults: DemoClientConsultationResult[] = [
  {
    id: "ccr_001",
    requestId: "cr_001",
    doctorId: "d_001",
    clientName: "Dina Prameswari",
    submittedAt: "2026-03-09",
    chiefComplaint: "Ingin veneer untuk gigi depan, warna tidak merata.",
    duration: "6+ bulan",
    painScale: 1,
    notes: "Tidak ada alergi obat yang diketahui. Pernah scaling 1 tahun lalu.",
  },
  {
    id: "ccr_002",
    requestId: "cr_002",
    doctorId: "d_001",
    clientName: "Bima Pratama",
    submittedAt: "2026-03-06",
    chiefComplaint: "Nyeri gusi sebelah kanan, kadang berdarah saat sikat gigi.",
    duration: "1-2 minggu",
    painScale: 6,
    notes: "Tidak merokok. Sering minum kopi. Belum pernah periksa gusi sebelumnya.",
  },
];

export const demoVisitorAnalytics: DemoVisitorAnalytics[] = [
  { region: "DKI Jakarta", visitors: 1240, consultationsViaButton: 86 },
  { region: "Jawa Barat", visitors: 760, consultationsViaButton: 49 },
  { region: "Banten", visitors: 420, consultationsViaButton: 18 },
  { region: "Jawa Tengah", visitors: 310, consultationsViaButton: 12 },
];

export function getSummaryForRole(role: DemoRole) {
  if (role === "user") {
    return {
      headline: "Ringkasan akun pengguna",
      cards: [
        { label: "Konsultasi", value: demoConsultations.length },
        { label: "Jadwal tersedia", value: demoDoctorSchedules.length },
        { label: "Pengaduan", value: demoComplaints.length },
      ],
    };
  }

  if (role === "doctor") {
    return {
      headline: "Ringkasan dokter",
      cards: [
        { label: "Jadwal saya", value: demoDoctorSchedules.filter((s) => s.doctorId === "d_001").length },
        { label: "Permintaan klien", value: demoClientRequests.filter((c) => c.doctorId === "d_001").length },
        { label: "Slot tersisa", value: demoDoctorSchedules.filter((s) => s.doctorId === "d_001").reduce((acc, s) => acc + s.slotsLeft, 0) },
      ],
    };
  }

  return {
    headline: "Ringkasan clinic",
    cards: [
      { label: "Pengguna terdaftar", value: 238 },
      { label: "Dokter aktif", value: 7 },
      { label: "Total jadwal", value: demoDoctorSchedules.length },
    ],
  };
}
