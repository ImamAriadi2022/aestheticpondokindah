import { API_BASE } from "./apiConfig";

export interface PublicDoctorScheduleItem {
  id: string;
  doctorId: string;
  doctorName: string | null;
  date: string;
  displayDate: string;
  timeRange: string;
  location: string;
  totalSlots: number;
  bookedSlots: number;
  slotsLeft: number;
  isFull: boolean;
}

export async function getPublicDoctorSchedules(): Promise<PublicDoctorScheduleItem[]> {
  const res = await fetch(`${API_BASE}/public/doctor-schedules`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Gagal memuat jadwal dokter");
  return res.json();
}
