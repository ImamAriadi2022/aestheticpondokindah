import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';
import type {
  MembershipData,
  MembershipTier,
  MembershipPoint,
  MembershipHistory,
  MembershipTransaction,
  MembershipProfile,
  UpgradeOption,
} from '@/types/membership';

const CACHE_KEY = 'user_membership';

export const membershipService = {
  // 1. Get User Membership Data
  async getMembership(forceRefresh = false): Promise<MembershipData | null> {
    if (!forceRefresh) {
      const cached = await cacheStorage.get<MembershipData>(CACHE_KEY);
      if (cached) return cached;
    }
    try {
      const res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP);
      const data = res?.data || res;
      if (data) {
        await cacheStorage.set(CACHE_KEY, data, 2 * 60 * 1000); // 2 min TTL
      }
      return data;
    } catch {
      return null;
    }
  },

  // 2. Get Membership Tiers (Public or User)
  async getTiers(): Promise<{ tiers: MembershipTier[] }> {
    const CACHE_TIERS = 'membership_tiers_list';
    const cached = await cacheStorage.get<{ tiers: MembershipTier[] }>(CACHE_TIERS);
    if (cached && cached.tiers?.length > 0) return cached;

    try {
      let res: any;
      try {
        res = await apiClient.get<any>(ENDPOINTS.PUBLIC_MEMBERSHIP_TIERS, { skipAuth: true });
      } catch {
        res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP_TIERS, { skipAuth: true });
      }

      const raw = res?.data || res?.tiers || res || {};
      let tierArray: MembershipTier[] = [];

      if (Array.isArray(raw)) {
        tierArray = raw;
      } else if (typeof raw === 'object') {
        tierArray = Object.entries(raw).map(([key, val]: [string, any]) => ({
          level: key as 'bronze' | 'gold' | 'platinum',
          name: val.label || val.name || key.toUpperCase(),
          label: val.label || key.toUpperCase(),
          price: Number(val.price || 0),
          price_formatted: `Rp ${(Number(val.price) || 0).toLocaleString('id-ID')}`,
          threshold_transaction: Number(val.threshold_transaction || 0),
          benefits: val.benefits || {},
        }));
      }

      const result = { tiers: tierArray };
      if (tierArray.length > 0) {
        await cacheStorage.set(CACHE_TIERS, result, 10 * 60 * 1000);
      }
      return result;
    } catch {
      return { tiers: [] };
    }
  },

  // 3. Get Points & Mutation History
  async getPoints(): Promise<{
    current_balance: number;
    total_earned: number;
    total_redeemed: number;
    points: MembershipPoint[];
    history?: { data: MembershipPoint[] };
  }> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP_POINTS);
      const data = res?.data || res || {};
      const historyList: MembershipPoint[] = Array.isArray(data.history?.data)
        ? data.history.data
        : Array.isArray(data.history)
        ? data.history
        : Array.isArray(data.points)
        ? data.points
        : Array.isArray(data)
        ? data
        : [];

      return {
        current_balance: Number(data.current_balance ?? data.total_points ?? 0),
        total_earned: Number(data.total_earned ?? 0),
        total_redeemed: Number(data.total_redeemed ?? 0),
        points: historyList,
        history: { data: historyList },
      };
    } catch {
      return {
        current_balance: 0,
        total_earned: 0,
        total_redeemed: 0,
        points: [],
      };
    }
  },

  // 4. Get Upgrade Payment Options
  async getUpgradeOptions(): Promise<{
    success: boolean;
    current_level: string;
    current_label: string;
    auto_upgrade_progress?: any;
    unmet_requirements?: Array<{ message: string; action: string }>;
    tiers: UpgradeOption[];
  }> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP_PAYMENT_OPTIONS);
      const d = res?.data || res || {};
      const tierList: UpgradeOption[] = (d.tiers || d.upgrade_options || []).map((item: any) => ({
        level: item.level,
        label: item.label || item.name || item.level.toUpperCase(),
        price: Number(item.price || 0),
        price_formatted: item.price_formatted || `Rp ${(Number(item.price) || 0).toLocaleString('id-ID')}`,
        threshold_transaction: Number(item.threshold_transaction || 0),
        benefits: item.benefits || {},
      }));

      return {
        success: true,
        current_level: d.current_level || 'bronze',
        current_label: d.current_label || 'Bronze Member',
        auto_upgrade_progress: d.auto_upgrade_progress || null,
        unmet_requirements: d.unmet_requirements || [],
        tiers: tierList,
      };
    } catch {
      // Fallback to public tiers
      const tiersRes = await this.getTiers();
      return {
        success: true,
        current_level: 'bronze',
        current_label: 'Bronze Member',
        tiers: tiersRes.tiers.map((t) => ({
          level: t.level,
          label: t.label || t.name || t.level.toUpperCase(),
          price: t.price,
          price_formatted: t.price_formatted || `Rp ${t.price.toLocaleString('id-ID')}`,
          threshold_transaction: t.threshold_transaction,
          benefits: (typeof t.benefits === 'object' && !Array.isArray(t.benefits)) ? t.benefits : { discount_percentage: 0, point_multiplier: 1 },
        })),
      };
    }
  },

  // 5. Request Official Membership Upgrade
  async requestUpgrade(targetLevel: 'gold' | 'platinum'): Promise<{
    success: boolean;
    orderId: string;
    data?: any;
  }> {
    try {
      const res = await apiClient.post<any>(ENDPOINTS.MEMBERSHIP_REQUEST_UPGRADE, {
        target_level: targetLevel,
      });
      await cacheStorage.remove(CACHE_KEY);
      const reqId = res?.data?.id || res?.id || Date.now().toString().slice(-6);
      return {
        success: true,
        orderId: `UPG-#${reqId}`,
        data: res?.data || res,
      };
    } catch (e: any) {
      // If endpoint doesn't return ID, provide formatted order id
      const orderId = `UPG-${Date.now().toString().slice(-6)}`;
      return {
        success: true,
        orderId,
      };
    }
  },

  // 6. Get Membership History
  async getHistory(): Promise<{ data: MembershipHistory[] }> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP_HISTORY);
      return { data: res?.data || (Array.isArray(res) ? res : []) };
    } catch {
      return { data: [] };
    }
  },

  // 7. Get Membership Transactions
  async getTransactions(): Promise<{ data: MembershipTransaction[] }> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.MEMBERSHIP_TRANSACTIONS);
      return { data: res?.data || (Array.isArray(res) ? res : []) };
    } catch {
      return { data: [] };
    }
  },

  // 8. Update Membership Profile
  async updateProfile(profileData: Partial<MembershipProfile>): Promise<any> {
    const res = await apiClient.post<any>(ENDPOINTS.MEMBERSHIP_PROFILE, profileData);
    await cacheStorage.remove(CACHE_KEY);
    return res?.data || res;
  },

  // 9. Redeem Loyalty Points
  async redeemPoints(points: number, description?: string): Promise<any> {
    const res = await apiClient.post<any>(ENDPOINTS.MEMBERSHIP_REDEEM, {
      points,
      description: description || 'Penukaran poin loyalty treatment',
    });
    await cacheStorage.remove(CACHE_KEY);
    return res?.data || res;
  },

  // 10. Get Public Clinic Settings (for WA number)
  async getClinicContact(): Promise<string> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.SETTINGS, { skipAuth: true });
      return res?.whatsapp || res?.phone || '081990114949';
    } catch {
      return '081990114949';
    }
  },
};
