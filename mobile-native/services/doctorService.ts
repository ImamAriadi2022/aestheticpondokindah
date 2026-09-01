import { apiClient } from './apiClient';

export interface DoctorStats {
  today_patients_count: number;
  waiting_queue_count: number;
  active_consultations_count: number;
  total_completed_visits: number;
}

export interface DoctorQueueItem {
  id: number;
  queue_number: string;
  patient_name: string;
  patient_phone?: string;
  service_name: string;
  time_slot: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  complaint?: string;
}

export interface DoctorSchedule {
  id: number;
  branch_id: number;
  branch_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_quota: number;
  is_active: boolean;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_phone?: string;
  doctor_name?: string;
  visit_date: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  odontogram?: Record<string, string>;
  created_at: string;
}

export const doctorService = {
  async getDashboardStats(): Promise<DoctorStats> {
    const res = await apiClient.get<any>('/doctor/dashboard/stats');
    return res?.data || res;
  },

  async getQueue(): Promise<DoctorQueueItem[]> {
    const res = await apiClient.get<any>('/doctor/queue');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  async getSchedules(): Promise<DoctorSchedule[]> {
    const res = await apiClient.get<any>('/doctor/schedules');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  async createSchedule(payload: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const res = await apiClient.post<any>('/doctor/schedules', payload);
    return res?.data || res;
  },

  async updateSchedule(id: number, payload: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const res = await apiClient.put<any>(`/doctor/schedules/${id}`, payload);
    return res?.data || res;
  },

  async deleteSchedule(id: number): Promise<void> {
    await apiClient.delete(`/doctor/schedules/${id}`);
  },

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const res = await apiClient.get<any>('/doctor/medical-records');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  async saveSoap(recordId: number, soap: { subjective: string; objective: string; assessment: string; plan: string }): Promise<any> {
    return await apiClient.post(`/doctor/medical-records/${recordId}/soap`, soap);
  },

  async saveOdontogram(recordId: number, toothData: Record<string, string>): Promise<any> {
    return await apiClient.post(`/doctor/medical-records/${recordId}/odontogram`, { odontogram: toothData });
  },

  async getConsultations(): Promise<any[]> {
    const res = await apiClient.get<any>('/doctor/consultations');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  async replyConsultation(id: number, message: string): Promise<any> {
    return await apiClient.post(`/doctor/consultations/${id}/messages`, { body: message });
  },

  async sendMeetingLink(id: number, meetingUrl: string, topic?: string): Promise<any> {
    return await apiClient.post(`/doctor/consultations/${id}/meetings`, { meeting_url: meetingUrl, topic });
  },
};