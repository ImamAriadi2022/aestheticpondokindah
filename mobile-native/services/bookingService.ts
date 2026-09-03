import { apiClient } from "./apiClient";
import { cacheStorage } from "@/storage/cacheStorage";
import { ENDPOINTS } from "@/constants/api";
import type { Reservation } from "@/types/booking";

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
  name?: string;
  phone?: string;
  treatment_interest: string;
  doctor_id?: number | string | null;
  doctor_schedule_id?: number | string | null;
  branch_id?: number | string;
  date?: string | null;
  preferred_time?: string | null;
  complaint?: string;
  source?: string;
  service_price?: number;
  redeem_points?: number;
  signature_data?: string | null;
}

export interface ClinicServiceItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  image?: string;
  intro?: string;
  price?: number;
  duration?: string;
  price_formatted?: string;
}

export interface ClinicBranchItem {
  id: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  status?: string;
}

export interface ClinicSettingsData {
  booking_terms?: string;
  booking_whatsapp_number?: string;
  pdf_terms_and_conditions?: any;
  pdf_informed_consent?: any;
  clinic_about_profile?: any;
}

export const bookingService = {
  async getServices(forceRefresh = false): Promise<ClinicServiceItem[]> {
    const KEY = "clinic_services";
    if (!forceRefresh) {
      const cached = await cacheStorage.get<ClinicServiceItem[]>(KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    }
    try {
      const res = await apiClient.get<any>(ENDPOINTS.SERVICES, { skipAuth: true });
      const list: ClinicServiceItem[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.services) ? res.services : []));
      if (list.length > 0) {
        await cacheStorage.set(KEY, list, 10 * 60 * 1000);
      }
      return list;
    } catch {
      return [];
    }
  },

  async getPublicBranches(forceRefresh = false): Promise<ClinicBranchItem[]> {
    const KEY = "clinic_branches";
    if (!forceRefresh) {
      const cached = await cacheStorage.get<ClinicBranchItem[]>(KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    }
    try {
      const res = await apiClient.get<any>(ENDPOINTS.BRANCHES, { skipAuth: true });
      const list: ClinicBranchItem[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.branches) ? res.branches : []));
      if (list.length > 0) {
        await cacheStorage.set(KEY, list, 10 * 60 * 1000);
      }
      return list;
    } catch {
      return [];
    }
  },

  async getPublicSettings(forceRefresh = false): Promise<ClinicSettingsData> {
    const KEY = "clinic_public_settings";
    if (!forceRefresh) {
      const cached = await cacheStorage.get<ClinicSettingsData>(KEY);
      if (cached) return cached;
    }
    try {
      const res = await apiClient.get<ClinicSettingsData>(ENDPOINTS.SETTINGS, { skipAuth: true });
      if (res) {
        await cacheStorage.set(KEY, res, 10 * 60 * 1000);
      }
      return res || {};
    } catch {
      return {};
    }
  },

  async submitPublicReservation(payload: PublicReservationPayload): Promise<PublicReservationResponse> {
    return apiClient.post<PublicReservationResponse>(ENDPOINTS.PUBLIC_RESERVATIONS, {
      ...payload,
      source: payload.source ?? "android_native",
    }, { skipAuth: true });
  },

  async getPublicDoctorSchedules(forceRefresh = false): Promise<any[]> {
    const KEY = "public_doctor_schedules";
    if (!forceRefresh) {
      const cached = await cacheStorage.get<any[]>(KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    }
    const res = await apiClient.get<any>(ENDPOINTS.PUBLIC_DOCTOR_SCHEDULES, { skipAuth: true });
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.schedules) ? res.schedules : []));
    await cacheStorage.set(KEY, list, 5 * 60 * 1000);
    return list;
  },

  async getReservations(forceRefresh = false): Promise<{ reservations: Reservation[] }> {
    const KEY = "reservations";
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
      source: payload.source ?? "mobile_app",
    });
    await cacheStorage.invalidate("reservations");
    const r = res?.reservation || res?.data || res;
    return { reservation: r, code: r?.code || res?.code, message: res?.message };
  },

  async getReservationDetail(id: number | string): Promise<{ reservation: Reservation }> {
    const res = await apiClient.get<any>(`/user/reservations/${id}`);
    const r = res?.reservation || res?.data || res;
    return { reservation: r };
  },

  async cancelReservation(id: number | string, reason?: string): Promise<{ message: string; reservation?: Reservation }> {
    const res = await apiClient.put<any>(`/user/reservations/${id}/cancel`, { reason });
    await cacheStorage.invalidate("reservations");
    return res;
  },

  async getDoctorSchedules(): Promise<any> {
    const KEY = "doctor_schedules";
    const cached = await cacheStorage.get(KEY);
    if (cached) return cached;
    const res = await apiClient.get(ENDPOINTS.DOCTOR_SCHEDULES, { skipAuth: true });
    await cacheStorage.set(KEY, res, 5 * 60 * 1000);
    return res;
  },
};