import { API_BASE } from "./apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

function headers() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface DoctorScheduleItem {
  id: string;
  userId: string;
  date: string;
  displayDate: string;
  timeRange: string;
  location: string;
  totalSlots: number;
  bookedSlots: number;
  slotsLeft: number;
  isFull: boolean;
  createdAt: string;
}

export interface CreateDoctorScheduleInput {
  date: string;
  timeRange: string;
  location: string;
  totalSlots: number;
}

export async function getDoctorSchedules(): Promise<DoctorScheduleItem[]> {
  const res = await fetch(`${API_BASE}/doctor/schedules`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat jadwal");
  return res.json();
}

export async function createDoctorSchedule(
  input: CreateDoctorScheduleInput
): Promise<DoctorScheduleItem> {
  const res = await fetch(`${API_BASE}/doctor/schedules`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  const data = await res.json();
  return data.schedule;
}

export async function getDoctorSchedule(id: string): Promise<DoctorScheduleItem> {
  const res = await fetch(`${API_BASE}/doctor/schedules/${id}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat jadwal");
  return res.json();
}

export async function updateDoctorSchedule(
  id: string,
  input: Partial<CreateDoctorScheduleInput>
): Promise<DoctorScheduleItem> {
  const res = await fetch(`${API_BASE}/doctor/schedules/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  const data = await res.json();
  return data.schedule;
}

export async function deleteDoctorSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/doctor/schedules/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal menghapus jadwal");
}
