import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminBranches(token: string) {
  const res = await fetch(`${API_BASE}/admin/branches`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat cabang klinik");
  return res.json();
}
