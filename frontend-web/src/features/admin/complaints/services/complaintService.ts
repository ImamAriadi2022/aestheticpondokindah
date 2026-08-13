import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminComplaints(token: string) {
  const res = await fetch(`${API_BASE}/admin/complaints`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat pengaduan");
  return res.json();
}
