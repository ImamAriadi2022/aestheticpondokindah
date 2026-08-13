import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminMembershipTiers(token: string) {
  const res = await fetch(`${API_BASE}/admin/membership-tiers`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat tier membership");
  return res.json();
}
