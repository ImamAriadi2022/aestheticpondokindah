import { apiClient } from './apiClient';
import { cacheStorage } from '@/storage/cacheStorage';
import { ENDPOINTS } from '@/constants/api';

export interface WilayahItem {
  id: string;
  name: string;
  kode?: string;
}

export const wilayahService = {
  async getProvinces(): Promise<WilayahItem[]> {
    const KEY = 'wilayah_provinces';
    const cached = await cacheStorage.get<WilayahItem[]>(KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    try {
      const res = await apiClient.get<WilayahItem[]>(ENDPOINTS.WILAYAH_PROVINCES, { skipAuth: true });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) {
        await cacheStorage.set(KEY, list, 24 * 60 * 60 * 1000);
        return list;
      }
    } catch {
      // offline fallback
    }

    return [
      { id: 'DKI Jakarta', name: 'DKI Jakarta' },
      { id: 'Jawa Barat', name: 'Jawa Barat' },
      { id: 'Banten', name: 'Banten' },
      { id: 'Jawa Tengah', name: 'Jawa Tengah' },
      { id: 'DI Yogyakarta', name: 'DI Yogyakarta' },
      { id: 'Jawa Timur', name: 'Jawa Timur' },
      { id: 'Bali', name: 'Bali' },
      { id: 'Sumatera Utara', name: 'Sumatera Utara' },
      { id: 'Sumatera Barat', name: 'Sumatera Barat' },
      { id: 'Riau', name: 'Riau' },
    ];
  },

  async getRegencies(provinceIdOrName: string | number): Promise<WilayahItem[]> {
    if (!provinceIdOrName) return [];
    const KEY = `wilayah_regencies_${provinceIdOrName}`;
    const cached = await cacheStorage.get<WilayahItem[]>(KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    try {
      const endpoint = ENDPOINTS.WILAYAH_REGENCIES(encodeURIComponent(String(provinceIdOrName)));
      const res = await apiClient.get<WilayahItem[]>(endpoint, { skipAuth: true });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) {
        await cacheStorage.set(KEY, list, 24 * 60 * 60 * 1000);
        return list;
      }
    } catch {
      // offline fallback
    }

    return [];
  },

  async getDistricts(regencyIdOrName: string | number): Promise<WilayahItem[]> {
    if (!regencyIdOrName) return [];
    const KEY = `wilayah_districts_${regencyIdOrName}`;
    const cached = await cacheStorage.get<WilayahItem[]>(KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;

    try {
      const endpoint = ENDPOINTS.WILAYAH_DISTRICTS(encodeURIComponent(String(regencyIdOrName)));
      const res = await apiClient.get<WilayahItem[]>(endpoint, { skipAuth: true });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) {
        await cacheStorage.set(KEY, list, 24 * 60 * 60 * 1000);
        return list;
      }
    } catch {
      // offline fallback
    }

    return [];
  },
};
