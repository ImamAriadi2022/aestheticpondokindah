import { API_BASE } from "@/core/api/apiConfig";

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

export interface AdminDoctorScheduleItem {
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
  createdAt?: string;
}

export async function getAdminDoctorSchedules(params?: {
  doctorId?: string;
}): Promise<AdminDoctorScheduleItem[]> {
  const qs = new URLSearchParams();
  if (params?.doctorId) qs.set("doctorId", params.doctorId);

  const res = await fetch(`${API_BASE}/admin/doctor-schedules${qs.toString() ? `?${qs.toString()}` : ""}`,
    {
      headers: headers(),
    }
  );
  if (!res.ok) throw new Error("Gagal memuat jadwal dokter");
  return res.json();
}

export async function syncAdminDoctorSchedules(
  doctorId: string | number,
  schedules: any[]
): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/doctor-schedules/sync`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      user_id: doctorId,
      schedules,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Gagal menyinkronkan jadwal dokter");
  }
  return res.json();
}
