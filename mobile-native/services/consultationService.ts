import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import * as WebBrowser from 'expo-web-browser';

export interface ConsultationMessage {
  id: number | string;
  consultation_id?: number | string;
  consultationId?: number | string;
  sender_id?: number | string | null;
  senderId?: number | string | null;
  sender_role?: 'patient' | 'doctor' | 'admin' | string;
  senderRole?: 'patient' | 'doctor' | 'admin' | string;
  sender_name?: string;
  senderName?: string;
  body: string;
  attachments?: any;
  read_at?: string | null;
  readAt?: string | null;
  created_at?: string;
  createdAt?: string;
}

export const normalizeMessage = (m: any): ConsultationMessage => {
  if (!m) return m;
  const role = m.sender_role || m.senderRole || 'patient';
  return {
    id: m.id,
    consultation_id: m.consultation_id || m.consultationId,
    consultationId: m.consultationId || m.consultation_id,
    sender_id: m.sender_id ?? m.senderId ?? null,
    senderId: m.senderId ?? m.sender_id ?? null,
    sender_role: role,
    senderRole: role,
    sender_name: m.sender_name || m.senderName || '',
    senderName: m.senderName || m.sender_name || '',
    body: m.body || '',
    attachments: m.attachments,
    read_at: m.read_at || m.readAt || null,
    readAt: m.readAt || m.read_at || null,
    created_at: m.created_at || m.createdAt || new Date().toISOString(),
    createdAt: m.createdAt || m.created_at || new Date().toISOString(),
  };
};

export interface ConsultationMeeting {
  id: number;
  consultation_id: number;
  title: string;
  meeting_url: string;
  passcode?: string;
  start_time: string;
  status: string;
}

export interface ConsultationSession {
  id: number;
  user_id: number | null;
  participant_name: string;
  topic: string;
  category?: string;
  chief_complaint: string;
  chiefComplaint?: string;
  pain_scale: number | null;
  painScale?: number | null;
  status: 'Menunggu' | 'Dibuka' | 'Dijadwalkan' | 'Selesai' | 'Ditolak';
  doctor_name?: string;
  doctorName?: string;
  notes: string | null;
  created_at: string;
  date?: string;
  messages?: ConsultationMessage[];
  meetings?: ConsultationMeeting[];
  medicalRecord?: any;
}

export interface CreateConsultationPayload {
  topic?: string;
  category?: string;
  chiefComplaint: string;
  chief_complaint?: string;
  painScale?: number;
  pain_scale?: number;
  duration?: string;
  allergies?: string;
  medications?: string;
  priorTreatment?: string;
  contactNumber?: string;
  patient_name?: string;
  phone?: string;
}

export const ZESTA_CHANNEL_ID = '573eb7f7-b6f0-4957-9778-daf531cd967c';

export const consultationService = {
  async getConsultations(forceRefresh = false): Promise<ConsultationSession[]> {
    const KEY = 'user_consultations';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<ConsultationSession[]>(KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    }
    try {
      const res = await apiClient.get<any>(ENDPOINTS.CONSULTATIONS);
      const list = Array.isArray(res) ? res : (res?.data || res?.consultations || []);
      const normalized: ConsultationSession[] = list.map((item: any) => ({
        ...item,
        chief_complaint: item.chief_complaint || item.chiefComplaint || '',
        pain_scale: item.pain_scale ?? item.painScale ?? null,
        doctor_name: item.doctor_name || item.doctorName || (item.doctor?.name) || '',
      }));
      await cacheStorage.set(KEY, normalized, 2 * 60 * 1000);
      return normalized;
    } catch {
      return [];
    }
  },

  async getConsultation(id: string | number): Promise<ConsultationSession> {
    const res = await apiClient.get<any>(typeof ENDPOINTS.CONSULTATION_DETAIL === 'function' ? ENDPOINTS.CONSULTATION_DETAIL(id) : `/user/consultations/${id}`);
    const c = res?.consultation || res?.data || res;
    return {
      ...c,
      chief_complaint: c.chief_complaint || c.chiefComplaint || '',
      pain_scale: c.pain_scale ?? c.painScale ?? null,
      doctor_name: c.doctor_name || c.doctorName || (c.doctor?.name) || '',
      messages: Array.isArray(c.messages) ? c.messages.map(normalizeMessage) : [],
      meetings: Array.isArray(c.meetings) ? c.meetings : [],
    };
  },

  async createConsultation(payload: CreateConsultationPayload): Promise<ConsultationSession> {
    const requestBody = {
      type: 'quick',
      topic: payload.topic || 'Konsultasi Kesehatan Gigi',
      category: payload.category || 'Umum',
      chiefComplaint: payload.chiefComplaint || payload.chief_complaint || 'Keluhan konsultasi gigi pasien.',
      painScale: payload.painScale ?? payload.pain_scale ?? 3,
      duration: payload.duration || 'Beberapa hari',
      allergies: payload.allergies || '-',
      medications: payload.medications || '-',
      contactNumber: payload.contactNumber || payload.phone || '',
    };
    const res = await apiClient.post<any>(ENDPOINTS.CONSULTATIONS, requestBody);
    await cacheStorage.invalidate('user_consultations');
    return res?.data || res;
  },

  async sendMessage(id: string | number, body: string): Promise<ConsultationMessage> {
    const url = typeof ENDPOINTS.CONSULTATION_MESSAGES === 'function' ? ENDPOINTS.CONSULTATION_MESSAGES(id) : `/user/consultations/${id}/messages`;
    const res = await apiClient.post<any>(url, { body });
    await cacheStorage.invalidate('user_consultations');
    const sent = res?.message || res?.data || res;
    return normalizeMessage(sent);
  },

  async markRead(id: string | number): Promise<void> {
    try {
      const url = typeof ENDPOINTS.CONSULTATION_READ === 'function' ? ENDPOINTS.CONSULTATION_READ(id) : `/user/consultations/${id}/read`;
      await apiClient.post(url);
    } catch {
      // Non-blocking
    }
  },

  async closeConsultation(id: string | number): Promise<void> {
    const url = typeof ENDPOINTS.CONSULTATION_CLOSE === 'function' ? ENDPOINTS.CONSULTATION_CLOSE(id) : `/user/consultations/${id}/close`;
    await apiClient.post(url);
    await cacheStorage.invalidate('user_consultations');
  },

  async openZestaLiveChat(user?: { name?: string; email?: string; phone?: string }): Promise<void> {
    const params = new URLSearchParams();
    params.set('channelId', ZESTA_CHANNEL_ID);
    params.set('nama_faskes', 'Aesthetic Pondok Indah Dental Clinic');
    if (user?.name) params.set('name', user.name);
    if (user?.email) params.set('email', user.email);
    if (user?.phone) params.set('phone', user.phone);

    // Official Zesta Livechat web widget URL
    const zestaUrl = 'https://zesta.id/chat/' + ZESTA_CHANNEL_ID + '?' + params.toString();
    try {
      await WebBrowser.openBrowserAsync(zestaUrl, {
        toolbarColor: '#FAF5EA',
        controlsColor: '#8C6B1C',
        showTitle: true,
      });
    } catch {
      // Fallback
    }
  },
};
