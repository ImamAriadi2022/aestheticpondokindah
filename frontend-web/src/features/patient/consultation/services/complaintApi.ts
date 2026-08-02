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

export type ComplaintCategory = "Pelayanan" | "Fasilitas" | "Dokter" | "Jadwal" | "Pembayaran" | "Lainnya";
export type ComplaintStatus = "pending" | "processing" | "resolved" | "rejected";

export interface ComplaintItem {
  id: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateComplaintInput {
  category: string;
  title: string;
  description: string;
  attachment_url?: string;
}

// User APIs
export async function getMyComplaints(): Promise<ComplaintItem[]> {
  const res = await fetch(`${API_BASE}/user/complaints`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat pengaduan");
  return res.json();
}

export async function createComplaint(input: CreateComplaintInput): Promise<ComplaintItem> {
  const res = await fetch(`${API_BASE}/user/complaints`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal membuat pengaduan");
  }
  return res.json();
}

// Admin APIs
export async function getAllComplaints(params?: {
  status?: string;
  search?: string;
  per_page?: number;
}): Promise<{ data: ComplaintItem[]; meta: any }> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== "Semua") qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.per_page) qs.set("per_page", params.per_page.toString());

  const res = await fetch(`${API_BASE}/admin/complaints?${qs.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat daftar pengaduan");
  return res.json();
}

export async function updateComplaintStatus(
  id: string,
  input: { status?: ComplaintStatus; admin_response?: string }
): Promise<ComplaintItem> {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal memperbarui pengaduan");
  return res.json();
}

export async function deleteComplaint(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal menghapus pengaduan");
}
