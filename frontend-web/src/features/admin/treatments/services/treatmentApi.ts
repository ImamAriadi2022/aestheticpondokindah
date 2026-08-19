import { API_BASE } from "@/core/api/apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

function headers() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ClinicTreatmentItem {
  id: number | string;
  title: string;
  slug?: string;
  category?: string | null;
  price?: number | string | null;
  price_formatted?: string;
  duration?: string | null;
  image?: string | null;
  intro: string;
  paragraphs?: string[] | null;
  steps?: string[] | null;
  general_dentists?: string[] | null;
  specialist_label?: string | null;
  specialist_names?: string[] | null;
  sort_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function fetchAdminTreatments(search?: string): Promise<ClinicTreatmentItem[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);

  const res = await fetch(`${API_BASE}/admin/services${qs.toString() ? `?${qs.toString()}` : ""}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar layanan klinik (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || [];
}

export async function createAdminTreatment(
  payload: Partial<ClinicTreatmentItem>
): Promise<ClinicTreatmentItem> {
  const res = await fetch(`${API_BASE}/admin/services`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal menambahkan layanan (${res.status})`);
  }

  const data = await res.json();
  return data.service || data;
}

export async function updateAdminTreatment(
  id: number | string,
  payload: Partial<ClinicTreatmentItem>
): Promise<ClinicTreatmentItem> {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal memperbarui layanan (${res.status})`);
  }

  const data = await res.json();
  return data.service || data;
}

export async function deleteAdminTreatment(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal menghapus layanan (${res.status})`);
  }
}
