import { apiClient } from './apiClient';
import { authStorage } from '@/storage/authStorage';
import { ENDPOINTS } from '@/constants/api';
import type { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth';

export const authService = {
  async login(payload: { phone?: string; login?: string; password: string }): Promise<AuthResponse> {
    const loginIdentifier = payload.login || payload.phone || '';
    const res = await apiClient.post<AuthResponse>(ENDPOINTS.LOGIN, {
      login: loginIdentifier,
      password: payload.password,
    }, { skipAuth: true });
    await authStorage.saveToken(res.token);
    await authStorage.saveUser(res.user);
    return res;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(ENDPOINTS.REGISTER, payload, { skipAuth: true });
    await authStorage.saveToken(res.token);
    await authStorage.saveUser(res.user);
    return res;
  },

  async loginGoogle(payload: { credential?: string; access_token?: string; code?: string; mode?: 'login' | 'register' }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/google', {
      ...payload,
      device_name: 'mobile_native_google',
    }, { skipAuth: true });
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
