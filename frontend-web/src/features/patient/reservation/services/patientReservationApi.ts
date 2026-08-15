import { apiClient } from "@/core/api/apiClient";

export interface PatientReservationItem {
  id: number | string;
  name: string;
  phone: string;
  email?: string | null;
  doctor_id?: number | string | null;
  doctor?: {
    id: number | string;
    name: string;
    role?: string;
  };
  doctor_schedule_id?: number | string | null;
  treatment_interest?: string | null;
  complaint?: string | null;
  date: string;
  preferred_time?: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  created_at: string;
}

export const getMyPatientReservations = async (): Promise<PatientReservationItem[]> => {
  const res = await apiClient.get<{ reservations?: PatientReservationItem[]; data?: PatientReservationItem[] }>("/user/reservations");
  if (Array.isArray(res)) return res;
  return res.data || res.reservations || [];
};

export const createPatientReservation = async (data: Partial<PatientReservationItem>): Promise<PatientReservationItem> => {
  const res = await apiClient.post<{ reservation: PatientReservationItem }>("/user/reservations", data);
  return res.reservation || (res as any);
};

export const cancelPatientReservation = async (id: number | string, reason?: string): Promise<{ message: string }> => {
  return apiClient.put<{ message: string }>(`/user/reservations/${id}/cancel`, { reason });
};
