import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type { MembershipProfile, MembershipTier, MembershipPoint, MembershipHistory, MembershipTransaction } from '@/types/membership';

const CACHE_KEY = 'membership';

export const membershipService = {
  async getMembership(forceRefresh = false): Promise<any> {
    if (!forceRefresh) {
      const cached = await cacheStorage.get(CACHE_KEY);
      if (cached) return cached;
    }
    const res = await apiClient.get(ENDPOINTS.MEMBERSHIP);
    await cacheStorage.set(CACHE_KEY, res, 3 * 60 * 1000); // 3 min TTL
    return res;
  },

  async getTiers(): Promise<{ tiers: MembershipTier[] }> {
    const cached = await cacheStorage.get<{ tiers: MembershipTier[] }>('membership_tiers');
    if (cached) return cached;
    const res = await apiClient.get<{ tiers: MembershipTier[] }>(ENDPOINTS.MEMBERSHIP_TIERS, { skipAuth: true });
    await cacheStorage.set('membership_tiers', res, 10 * 60 * 1000); // 10 min TTL
    return res;
  },

  async getPoints(): Promise<{ points: MembershipPoint[]; total_points: number }> {
    return await apiClient.get(ENDPOINTS.MEMBERSHIP_POINTS);
  },

  async getHistory(): Promise<{ history: MembershipHistory[] }> {
    return await apiClient.get(ENDPOINTS.MEMBERSHIP_HISTORY);
  },

  async upgrade(payload: { tier: string }): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.MEMBERSHIP_UPGRADE, payload);
    await cacheStorage.remove(CACHE_KEY);
    return res;
  },

  async renew(): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.MEMBERSHIP_RENEW);
    await cacheStorage.remove(CACHE_KEY);
    return res;
  },

  async cancel(): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.MEMBERSHIP_CANCEL);
    await cacheStorage.remove(CACHE_KEY);
    return res;
  },

  async redeemPoints(points: number): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.MEMBERSHIP_REDEEM, { points });
    await cacheStorage.remove(CACHE_KEY);
    return res;
  },

  async createPayment(transactionId: number): Promise<any> {
    return await apiClient.post(ENDPOINTS.MEMBERSHIP_PAYMENT_CREATE, { transaction_id: transactionId });
  },

  async simulatePayment(id: string, action: 'success' | 'failed' | 'cancelled' = 'success'): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.MEMBERSHIP_PAYMENT_SIMULATE(id), { action });
    await cacheStorage.remove(CACHE_KEY);
    return res;
  },
};
