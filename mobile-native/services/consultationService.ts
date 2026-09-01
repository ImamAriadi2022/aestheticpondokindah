import { apiClient } from './apiClient';

export interface ConsultationMessage {
  id: number;
  consultation_id: number;
  sender_id: number | null;
  sender_role: 'patient' | 'doctor' | 'admin';
  body: string;
  attachments?: {
    type?: string;
    service_id?: string;
    service_name?: string;
    doctor_name?: string;
    can_handoff?: boolean;
    is_handed_off?: boolean;
    [key: string]: any;
  } | null;
  read_at: string | null;
  created_at: string;
}

export interface ConsultationSession {
  id: number;
  user_id: number | null;
  participant_name: string;
  topic: string;
  category?: string;
  chief_complaint: string;
  pain_scale: number | null;
  status: 'Menunggu' | 'Dibuka' | 'Selesai' | 'Ditolak';
  notes: string | null;
  created_at: string;
  messages?: ConsultationMessage[];
}

export const consultationService = {
  async getConsultations(): Promise<ConsultationSession[]> {
    const res = await apiClient.get<{ success: boolean; data: ConsultationSession[] } | ConsultationSession[]>('/user/consultations');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  async getConsultation(id: string | number): Promise<ConsultationSession> {
    const res = await apiClient.get<{ success: boolean; data: ConsultationSession } | ConsultationSession>(`/user/consultations/${id}`);
    return (res as any)?.data || res;
  },

  async createConsultation(payload: {
    topic: string;
    chief_complaint: string;
    pain_scale?: number;
    patient_name?: string;
    phone?: string;
  }): Promise<ConsultationSession> {
    const res = await apiClient.post<{ success: boolean; data: ConsultationSession } | ConsultationSession>('/user/consultations', payload);
    return (res as any)?.data || res;
  },

  async sendMessage(id: string | number, body: string): Promise<ConsultationMessage> {
    const res = await apiClient.post<{ success: boolean; data: ConsultationMessage } | ConsultationMessage>(`/user/consultations/${id}/messages`, { body });
    return (res as any)?.data || res;
  },

  async markRead(id: string | number): Promise<void> {
    try {
      await apiClient.post(`/user/consultations/${id}/read`);
    } catch {
      // Non-blocking
    }
  },

  async closeConsultation(id: string | number): Promise<void> {
    await apiClient.post(`/user/consultations/${id}/close`);
  },
};