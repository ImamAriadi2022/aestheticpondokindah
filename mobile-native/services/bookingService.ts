import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type { Reservation, ReservationCreatePayload } from '@/types/booking';

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

export const bookingService = {
  /**
   * The current Laravel booking contract is public and is also used by the PWA.
   * Do not substitute this with the member-only reservation endpoints: those are
   * not available in the backend route registry.
   */
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
    const res = await apiClient.get<{ reservations: Reservation[] }>(ENDPOINTS.RESERVATIONS);
    await cacheStorage.set(KEY, res, 2 * 60 * 1000); // 2 min TTL
    return res;
  },

  async getReservation(id: string): Promise<{ reservation: Reservation }> {
    return await apiClient.get(ENDPOINTS.RESERVATION_DETAIL(id));
  },

  async createReservation(payload: ReservationCreatePayload): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.RESERVATION_CREATE, payload);
    await cacheStorage.invalidate('reservations');
    return res;
  },

  async cancelReservation(id: string): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.RESERVATION_CANCEL(id));
    await cacheStorage.invalidate('reservations');
    return res;
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
