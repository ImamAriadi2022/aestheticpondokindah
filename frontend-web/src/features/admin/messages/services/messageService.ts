import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminMessages(token: string) {
  const res = await fetch(`${API_BASE}/admin/messages`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat pesan");
  return res.json();
}
