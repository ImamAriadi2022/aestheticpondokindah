import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminUsers(token: string) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat pengguna");
  return res.json();
}

export async function deleteAdminUser(token: string, userId: string | number) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Gagal menghapus pengguna");
  }
  return data;
}
