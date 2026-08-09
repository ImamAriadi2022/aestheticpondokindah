import { API_BASE } from "@/core/api/apiConfig";
import {
  getProvinces as getProvincesLocal,
  getRegencies as getRegenciesLocal,
  getDistricts as getDistrictsLocal,
  type WilayahItem,
} from "@/core/constants/regionData";

export type { WilayahItem };

/** Data wilayah dari database server melalui API backend dengan fallback ke file lokal */
export async function getProvinces(): Promise<WilayahItem[]> {
  try {
    const res = await fetch(`${API_BASE}/wilayah/provinsi`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Fallback ke data lokal jika offline
  }
  return getProvincesLocal();
}

export async function getRegencies(provinceId: string): Promise<WilayahItem[]> {
  if (!provinceId) return [];
  try {
    const res = await fetch(`${API_BASE}/wilayah/kabupaten/${encodeURIComponent(provinceId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Fallback ke data lokal jika offline
  }
  return getRegenciesLocal(provinceId);
}

export async function getDistricts(regencyId: string): Promise<WilayahItem[]> {
  if (!regencyId) return [];
  try {
    const res = await fetch(`${API_BASE}/wilayah/kecamatan/${encodeURIComponent(regencyId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Fallback ke data lokal jika offline
  }
  return getDistrictsLocal(regencyId);
}

export async function getVillages(districtId: string): Promise<WilayahItem[]> {
  if (!districtId) return [];
  try {
    const res = await fetch(`${API_BASE}/wilayah/kelurahan/${encodeURIComponent(districtId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Fallback
  }
  return [];
}
