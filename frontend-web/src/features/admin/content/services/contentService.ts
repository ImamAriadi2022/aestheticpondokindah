import { API_BASE } from "@/core/api/apiConfig";

export async function fetchAdminPopups(token: string) {
  const res = await fetch(`${API_BASE}/admin/popups`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat popups");
  return res.json();
}

export async function saveAdminPopup(token: string, formData: FormData, popupId?: string) {
  const url = popupId
    ? `${API_BASE}/admin/popups/${popupId}`
    : `${API_BASE}/admin/popups`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Gagal menyimpan popup");
  }
  return res.json();
}

export async function fetchAdminPromos(token: string) {
  const res = await fetch(`${API_BASE}/admin/promos`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat promo");
  return res.json();
}

export async function fetchAdminPosts(token: string) {
  const res = await fetch(`${API_BASE}/admin/posts`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat artikel");
  return res.json();
}

export async function fetchAdminGallery(token: string) {
  const res = await fetch(`${API_BASE}/admin/gallery-items`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat galeri");
  return res.json();
}

export async function fetchAdminTestimonials(token: string) {
  const res = await fetch(`${API_BASE}/admin/testimonials`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat testimoni");
  return res.json();
}

export async function fetchAdminDownloadApps(token: string) {
  const res = await fetch(`${API_BASE}/admin/download-apps`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memuat aplikasi");
  return res.json();
}
