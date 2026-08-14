import { apiClient } from "@/core/api/apiClient";
import { API_BASE } from "@/core/api/apiConfig";

export interface DoctorQueueItem {
  id: string;
  patient_name?: string;
  name?: string;
  date?: string;
  time?: string;
  service?: string;
  status?: string;
  chief_complaint?: string;
}

export interface DoctorStats {
  todayPatients: number;
  completedPatients: number;
  scheduledConsultations: number;
  activeSchedules: number;
}

export async function getDoctorQueue(): Promise<DoctorQueueItem[]> {
  try {
    const res = await apiClient.get<{ queue: DoctorQueueItem[] }>("/doctor/queue");
    return res.queue || [];
  } catch {
    return [];
  }
}

export async function getDoctorVisitDetail(id: string): Promise<any> {
  const token = localStorage.getItem("apident:token");
  const res = await fetch(`${API_BASE}/doctor/visits/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Gagal memuat rekam medis kunjungan");
  return res.json();
}
