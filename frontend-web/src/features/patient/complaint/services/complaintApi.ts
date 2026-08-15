import { apiClient } from "@/core/api/apiClient";

export interface ComplaintItem {
  id: string | number;
  user_id?: string | number;
  user?: {
    id: number | string;
    name: string;
    email?: string;
    whatsapp?: string;
  };
  title: string;
  subject?: string;
  complaint?: string;
  description: string;
  category: string;
  status: "pending" | "processing" | "resolved" | "rejected" | "in_progress";
  date: string;
  response?: string;
  admin_response?: string;
  adminResponse?: string;
  created_at: string;
  updated_at?: string;
}

export const getMyComplaints = async (): Promise<ComplaintItem[]> => {
  const res = await apiClient.get<any>("/user/complaints");
  const rawList = Array.isArray(res) ? res : res.data || res.complaints || [];
  return rawList.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    user: c.user,
    title: c.title || c.subject || "Pengaduan",
    subject: c.subject || c.title,
    category: c.category || "Pelayanan",
    description: c.description || c.complaint || "",
    status: c.status === "in_progress" ? "processing" : c.status || "pending",
    date: c.date || (c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID") : "-"),
    adminResponse: c.admin_response || c.adminResponse || c.response,
    admin_response: c.admin_response || c.adminResponse || c.response,
    created_at: c.created_at || new Date().toISOString(),
    updated_at: c.updated_at,
  }));
};

export const createComplaint = async (data: {
  title?: string;
  subject?: string;
  complaint?: string;
  description?: string;
  category?: string;
}): Promise<ComplaintItem> => {
  const payload = {
    title: data.title || data.subject,
    subject: data.subject || data.title,
    complaint: data.complaint || data.description,
    description: data.description || data.complaint,
    category: data.category || "Pelayanan",
  };
  const res = await apiClient.post<{ complaint: ComplaintItem }>("/user/complaints", payload);
  return res.complaint || (res as any);
};

export const getAllComplaints = async (params: {
  status?: string;
  search?: string;
}): Promise<{ data: ComplaintItem[] }> => {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await apiClient.get<any>(`/admin/complaints${qs}`);
  const rawList = Array.isArray(res) ? res : res.data || res.complaints || [];
  return {
    data: rawList.map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      user: c.user,
      title: c.title || c.subject || "Pengaduan",
      subject: c.subject || c.title,
      category: c.category || "Pelayanan",
      description: c.description || c.complaint || "",
      status: c.status || "pending",
      date: c.date || (c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID") : "-"),
      adminResponse: c.admin_response || c.adminResponse || c.response,
      admin_response: c.admin_response || c.adminResponse || c.response,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at,
    })),
  };
};

export const updateComplaintStatus = async (
  id: number | string,
  data: { status: string; admin_response?: string }
): Promise<ComplaintItem> => {
  const res = await apiClient.put<{ complaint: ComplaintItem }>(`/admin/complaints/${id}`, data);
  return res.complaint || (res as any);
};
