import {
  getProvinces as getProvincesLocal,
  getRegencies as getRegenciesLocal,
  getDistricts as getDistrictsLocal,
  type WilayahItem,
} from "@/core/constants/regionData";

export type { WilayahItem };

/** Data wilayah langsung dari file statis lokal — tanpa fetch ke server */
export function getProvinces(): WilayahItem[] {
  return getProvincesLocal();
}

export function getRegencies(provinceId: string): WilayahItem[] {
  if (!provinceId) return [];
  return getRegenciesLocal(provinceId);
}

export function getDistricts(regencyId: string): WilayahItem[] {
  if (!regencyId) return [];
  return getDistrictsLocal(regencyId);
}
