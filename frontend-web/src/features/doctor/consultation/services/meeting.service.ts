import { apiClient } from "@/core/api/apiClient";
import type {
  ConsultationMeeting,
  MeetingInput,
} from "./consultation.types";

export async function getConsultationMeetings(
  consultationId: string
): Promise<ConsultationMeeting[]> {
  const res = await apiClient.get<{ meetings: ConsultationMeeting[] }>(
    `/doctor/consultations/${consultationId}/meetings`
  );
  return res.meetings || [];
}

export async function createConsultationMeeting(
  consultationId: string,
  input: MeetingInput
): Promise<ConsultationMeeting> {
  const res = await apiClient.post<{ meeting: ConsultationMeeting }>(
    `/doctor/consultations/${consultationId}/meetings`,
    input
  );
  return res.meeting;
}

export async function updateConsultationMeeting(
  consultationId: string,
  meetingId: string,
  input: Partial<MeetingInput>
): Promise<ConsultationMeeting> {
  const res = await apiClient.put<{ meeting: ConsultationMeeting }>(
    `/doctor/consultations/${consultationId}/meetings/${meetingId}`,
    input
  );
  return res.meeting;
}

export async function deleteConsultationMeeting(
  consultationId: string,
  meetingId: string
): Promise<void> {
  await apiClient.delete(
    `/doctor/consultations/${consultationId}/meetings/${meetingId}`
  );
}
