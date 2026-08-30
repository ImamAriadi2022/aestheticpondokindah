import { API_BASE } from "@/core/api/apiConfig";

export interface ReservationItem {
  id: string | number;
  code: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  date?: string | null;
  preferred_time?: string | null;
  branch_name?: string | null;
  doctor_id?: string | null;
  doctor_schedule_id?: string | null;
  doctor?: string | null;
  treatment_interest?: string | null;
  complaint?: string | null;
  source?: string | null;
  status: string;
  paymentStatus?: string | null;
  admin_notes?: string | null;
  signature_data?: string | null;
  terms_accepted_at?: string | null;
  rescheduled_at?: string | null;
  createdAt?: string | null;
}

export async function fetchAdminReservations(token: string, params?: { search?: string; status?: string }): Promise<ReservationItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "Semua") query.append("status", params.status);

  const url = `${API_BASE}/admin/reservations${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat reservasi (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || data?.reservations || [];
}

export async function updateAdminReservation(
  token: string,
  id: string | number,
  payload: {
    status?: string;
    paymentStatus?: string;
    doctor_id?: number | string;
    doctor_schedule_id?: number | string;
    date?: string;
    preferred_time?: string;
    admin_notes?: string;
  }
): Promise<ReservationItem> {
  const res = await fetch(`${API_BASE}/admin/reservations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal memperbarui reservasi (${res.status})`);
  }

  return res.json();
}

export async function confirmAdminReservationPayment(
  token: string,
  id: string | number,
  payload?: {
    payment_method?: string;
    amount?: number;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; data: any }> {
  const res = await fetch(`${API_BASE}/admin/reservations/${id}/confirm-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal mengonfirmasi pembayaran (${res.status})`);
  }

  return res.json();
}

export async function deleteAdminReservation(
  token: string,
  id: string | number
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/reservations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Gagal menghapus reservasi (${res.status})`);
  }

  return res.json();
}
