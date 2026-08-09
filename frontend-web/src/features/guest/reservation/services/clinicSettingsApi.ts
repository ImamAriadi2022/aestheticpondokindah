import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";

export interface ClinicSettings {
  booking_terms?: string;
  booking_whatsapp_number?: string;
  [key: string]: string | undefined;
}

export async function getPublicClinicSettings(): Promise<ClinicSettings> {
  const res = await fetch(`${API_BASE}/public/settings`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return {};
  return res.json();
}

export interface ClinicSettingItem {
  id: number;
  key: string;
  value: string | null;
  type: string;
  label: string | null;
  description: string | null;
}

export async function getAdminClinicSettings(): Promise<ClinicSettingItem[]> {
  const data = await apiClient.get<{ settings: ClinicSettingItem[] }>("/admin/clinic-settings");
  return data.settings || [];
}

export async function updateAdminClinicSetting(key: string, value: string): Promise<void> {
  await apiClient.put(`/admin/clinic-settings/${key}`, { value });
}
