import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminSettings(token: string) {
  const res = await fetch(`${API_BASE}/admin/clinic-settings`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat pengaturan klinik");
  return res.json();
}
