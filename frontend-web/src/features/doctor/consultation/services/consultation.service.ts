import { apiClient } from "@/core/api/apiClient";
import type {
  ConsultationDashboard,
  ConsultationStatus,
  DoctorConsultation,
  PatientSummary,
} from "@/features/doctor/consultation/types/consultation";

export async function getDoctorConsultations(params?: {
  type?: "quick" | "scheduled";
  status?: ConsultationStatus;
}): Promise<DoctorConsultation[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  return apiClient.get<DoctorConsultation[]>(
    `/doctor/consultations${query ? `?${query}` : ""}`
  );
}

export async function getConsultationDashboard(): Promise<ConsultationDashboard> {
  return apiClient.get<ConsultationDashboard>("/doctor/consultations/dashboard");
}

export async function getConsultationDetail(id: string): Promise<DoctorConsultation> {
  const res = await apiClient.get<{ consultation: DoctorConsultation }>(
    `/doctor/consultations/${id}`
  );
  return res.consultation;
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus
): Promise<DoctorConsultation> {
  const res = await apiClient.put<{ consultation: DoctorConsultation }>(
    `/doctor/consultations/${id}/status`,
    { status }
  );
  return res.consultation;
}

export async function getPatientSummary(id: string): Promise<PatientSummary> {
  return apiClient.get<PatientSummary>(`/doctor/consultations/${id}/patient-summary`);
}
