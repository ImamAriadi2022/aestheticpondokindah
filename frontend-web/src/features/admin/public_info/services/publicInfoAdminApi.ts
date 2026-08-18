import { apiClient } from "@/core/api/apiClient";

export interface ClinicServiceItem {
  id: number | string;
  title: string;
  slug: string;
  category?: string;
  price?: number;
  price_formatted?: string;
  duration?: string;
  image?: string | null;
  intro: string;
  paragraphs?: string[];
  steps?: string[];
  general_dentists?: string[];
  specialist_label?: string | null;
  specialist_names?: string[];
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessageItem {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  reply_notes?: string | null;
  replied_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicAboutProfile {
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_paragraphs: string[];
  stats: { value: string; label: string; sublabel: string }[];
  values: { title: string; description: string }[];
}

export interface ClinicLegalPolicy {
  type: string;
  title: string;
  last_updated: string;
  content: string;
}

// Services CRUD
export const getAdminServices = (search?: string) =>
  apiClient.get<ClinicServiceItem[]>(`/admin/services${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const createAdminService = (data: Partial<ClinicServiceItem>) =>
  apiClient.post<{ message: string; service: ClinicServiceItem }>("/admin/services", data);

export const updateAdminService = (id: number | string, data: Partial<ClinicServiceItem>) =>
  apiClient.put<{ message: string; service: ClinicServiceItem }>(`/admin/services/${id}`, data);

export const deleteAdminService = (id: number | string) =>
  apiClient.delete<{ message: string }>(`/admin/services/${id}`);

// FAQs CRUD
export const getAdminFaqs = (search?: string) =>
  apiClient.get<FaqItem[]>(`/admin/faqs${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const createAdminFaq = (data: Partial<FaqItem>) =>
  apiClient.post<{ message: string; faq: FaqItem }>("/admin/faqs", data);

export const updateAdminFaq = (id: number | string, data: Partial<FaqItem>) =>
  apiClient.put<{ message: string; faq: FaqItem }>(`/admin/faqs/${id}`, data);

export const deleteAdminFaq = (id: number | string) =>
  apiClient.delete<{ message: string }>(`/admin/faqs/${id}`);

// Contact Messages CRUD
export const getAdminContactMessages = (status?: string, search?: string) => {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  return apiClient.get<ContactMessageItem[]>(`/admin/contact-messages?${params.toString()}`);
};

export const updateAdminContactMessage = (id: number | string, data: Partial<ContactMessageItem>) =>
  apiClient.put<{ message: string; contactMessage: ContactMessageItem }>(`/admin/contact-messages/${id}`, data);

export const deleteAdminContactMessage = (id: number | string) =>
  apiClient.delete<{ message: string }>(`/admin/contact-messages/${id}`);

// About Profile
export const getAdminAbout = () =>
  apiClient.get<ClinicAboutProfile>("/admin/about");

export const updateAdminAbout = (data: ClinicAboutProfile) =>
  apiClient.put<{ message: string; about: ClinicAboutProfile }>("/admin/about", data);

// Legal Policies
export const getAdminLegal = (type: "privacy_policy" | "terms_of_service") =>
  apiClient.get<ClinicLegalPolicy>(`/admin/legal/${type}`);

export const updateAdminLegal = (type: "privacy_policy" | "terms_of_service", data: Partial<ClinicLegalPolicy>) =>
  apiClient.put<{ message: string; legal: ClinicLegalPolicy }>(`/admin/legal/${type}`, data);
