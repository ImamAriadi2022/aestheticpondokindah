import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminConsultations(token: string, params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/admin/consultations${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat daftar konsultasi");
  return res.json();
}
