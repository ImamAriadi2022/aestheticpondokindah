import { apiClient } from './apiClient';
import { authStorage } from '@/storage/authStorage';
import { ENDPOINTS } from '@/constants/api';
import type { LoginPayload, AuthResponse } from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(ENDPOINTS.LOGIN, payload, { skipAuth: true });
    await authStorage.saveToken(res.token);
    await authStorage.saveUser(res.user);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch {
      // Ignore error — always clear local session
    } finally {
      await authStorage.clearAll();
    }
  },

  async me(): Promise<{ user: any }> {
    return await apiClient.get(ENDPOINTS.ME);
  },

  async refreshUser(): Promise<void> {
    const res = await authService.me();
    if (res?.user) {
      await authStorage.saveUser(res.user);
    }
  },
};
