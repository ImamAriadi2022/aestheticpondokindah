import { apiClient } from "@/core/api/apiClient";

export interface DoctorReservationItem {
  id: string;
  code?: string;
  patient_name: string;
  patient_phone: string;
  date: string;
  preferred_time: string;
  treatment_interest?: string;
  complaint?: string;
  status: "Baru" | "Dikonfirmasi" | "Dalam Konsultasi" | "Selesai" | "Dibatalkan" | string;
}

export async function getDoctorReservationsQueue(): Promise<DoctorReservationItem[]> {
  const res = await apiClient.get<{ queue: DoctorReservationItem[] }>("/doctor/queue");
  return res.queue || [];
}

export async function startDoctorTreatment(id: string): Promise<any> {
  return apiClient.put(`/doctor/reservations/${id}/start`);
}

export async function completeDoctorTreatment(id: string): Promise<any> {
  return apiClient.put(`/doctor/reservations/${id}/complete`);
}
