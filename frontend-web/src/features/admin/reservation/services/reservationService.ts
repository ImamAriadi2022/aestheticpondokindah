import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminReservations(token: string) {
  const res = await fetch(`${API_BASE}/admin/bookings`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat reservasi");
  return res.json();
}
