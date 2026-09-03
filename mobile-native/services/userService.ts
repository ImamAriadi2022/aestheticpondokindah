import { ENDPOINTS } from '@/constants/api';
import { authStorage } from '@/storage/authStorage';
import { apiClient } from './apiClient';

export interface UserProfileData {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  gender?: string;
  birthDate?: string;
  birth_date?: string;
  bloodType?: string;
  blood_type?: string;
  job?: string;
  occupation?: string;
  address?: string;
  address_line?: string;
  city?: string;
  province?: string;
  district?: string;
  postalCode?: string;
  postal_code?: string;
  isCoffeeDrinker?: boolean;
  is_coffee_drinker?: boolean;
  isSmoker?: boolean;
  is_smoker?: boolean;
  membership_level?: string;
  membership_status?: string;
  total_points?: number;
  role?: string;
}

export interface JobOption {
  id: string;
  name: string;
}

export const userService = {
  async getJobOptions(): Promise<JobOption[]> {
    const res = await apiClient.get<any>('/public/job-options', { skipAuth: true });
    const jobs = Array.isArray(res) ? res : (res?.jobs || res?.data || []);
    return jobs.map((job: string | JobOption) => typeof job === 'string' ? { id: job, name: job } : job);
  },

  async getProfile(): Promise<UserProfileData> {
    const res = await apiClient.get<any>(ENDPOINTS.PROFILE);
    const profile = res?.data || res?.user || res;
    return profile;
  },

  async updateProfile(payload: Partial<UserProfileData>): Promise<UserProfileData> {
    const res = await apiClient.put<any>(ENDPOINTS.PROFILE_UPDATE, payload);
    const updated = res?.data || res?.user || res;
    if (updated) {
      await authStorage.saveUser(updated);
    }
    return updated;
  },

  async changePassword(payload: {
    current_password?: string;
    old_password?: string;
    password?: string;
    new_password?: string;
    password_confirmation?: string;
    new_password_confirmation?: string;
  }): Promise<{ message: string }> {
    const currentPass = payload.current_password || payload.old_password || '';
    const newPass = payload.new_password || payload.password || '';
    const confirmPass = payload.new_password_confirmation || payload.password_confirmation || '';

    return await apiClient.put(ENDPOINTS.CHANGE_PASSWORD, {
      current_password: currentPass,
      password: newPass,
      password_confirmation: confirmPass,
    });
  },
};
