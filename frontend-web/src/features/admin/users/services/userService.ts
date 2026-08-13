import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminUsers(token: string) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat pengguna");
  return res.json();
}
