import { apiClient } from "@/core/api/apiClient";

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
  const data = await apiClient.get<DoctorScheduleItem[]>("/doctor/schedules");
  return Array.isArray(data) ? data : [];
}

export async function createDoctorSchedule(
  input: CreateDoctorScheduleInput
): Promise<DoctorScheduleItem> {
  const res = await apiClient.post<{ message: string; schedule: DoctorScheduleItem }>(
    "/doctor/schedules",
    input
  );
  return res.schedule;
}

export async function getDoctorSchedule(id: string): Promise<DoctorScheduleItem> {
  return apiClient.get<DoctorScheduleItem>(`/doctor/schedules/${id}`);
}

export async function updateDoctorSchedule(
  id: string,
  input: Partial<CreateDoctorScheduleInput>
): Promise<DoctorScheduleItem> {
  const res = await apiClient.put<{ message: string; schedule: DoctorScheduleItem }>(
    `/doctor/schedules/${id}`,
    input
  );
  return res.schedule;
}

export async function deleteDoctorSchedule(id: string): Promise<void> {
  await apiClient.delete(`/doctor/schedules/${id}`);
}
