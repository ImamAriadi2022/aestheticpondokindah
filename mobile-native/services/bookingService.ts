import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type { Reservation } from '@/types/booking';

export interface PublicReservationPayload {
  name: string;
  phone: string;
  complaint: string;
  date?: string | null;
  source?: string;
}

export interface PublicReservationResponse {
  id: number;
  status: string;
}

export interface CreateUserReservationPayload {
  treatment_interest: string;
  doctor_id?: number | string | null;
  branch_id?: number | string;
  date?: string | null;
  preferred_time?: string | null;
  complaint?: string;
  source?: string;
  service_price?: number;
}

export const bookingService = {
  async submitPublicReservation(payload: PublicReservationPayload): Promise<PublicReservationResponse> {
    return apiClient.post<PublicReservationResponse>(ENDPOINTS.PUBLIC_RESERVATIONS, {
      ...payload,
      source: payload.source ?? 'android_native',
    }, { skipAuth: true });
  },

  async getPublicDoctorSchedules(forceRefresh = false): Promise<any[]> {
    const KEY = 'public_doctor_schedules';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<any[]>(KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get<any[]>(ENDPOINTS.PUBLIC_DOCTOR_SCHEDULES, { skipAuth: true });
    await cacheStorage.set(KEY, res, 5 * 60 * 1000);
    return res;
  },

  async getReservations(forceRefresh = false): Promise<{ reservations: Reservation[] }> {
    const KEY = 'reservations';
    if (!forceRefresh) {
      const cached = await cacheStorage.get<{ reservations: Reservation[] }>(KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get<any>(ENDPOINTS.RESERVATIONS);
    const list = Array.isArray(res) ? res : (Array.isArray(res?.reservations) ? res.reservations : (Array.isArray(res?.data) ? res.data : []));
    const normalized = { reservations: list };
    await cacheStorage.set(KEY, normalized, 2 * 60 * 1000);
    return normalized;
  },

  async createReservation(payload: CreateUserReservationPayload): Promise<{ reservation: Reservation; code?: string; message?: string }> {
    const res = await apiClient.post<any>(ENDPOINTS.RESERVATION_CREATE, {
      ...payload,
      source: payload.source ?? 'mobile_app',
    });
    await cacheStorage.invalidate('reservations');
    const r = res?.reservation || res?.data || res;
    return { reservation: r, code: r?.code || res?.code, message: res?.message };
  },

  async getDoctorSchedules(): Promise<any> {
    const KEY = 'doctor_schedules';
    const cached = await cacheStorage.get(KEY);
    if (cached) return cached;
    const res = await apiClient.get(ENDPOINTS.DOCTOR_SCHEDULES, { skipAuth: true });
    await cacheStorage.set(KEY, res, 5 * 60 * 1000);
    return res;
  },
};
