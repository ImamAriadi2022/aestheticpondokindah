import { apiClient } from "@/core/api/apiClient";
import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";

// Cache Keys
export const CACHE_KEYS = {
  POSTS: "apig_admin_cached_posts",
  PROMOS: "apig_admin_cached_promos",
  POPUPS: "apig_admin_cached_popups",
  GALLERY: "apig_admin_cached_gallery",
  TESTIMONIALS: "apig_admin_cached_testimonials",
  DOWNLOAD_APPS: "apig_admin_cached_download_apps",
};

// Generic Local Storage Helper
export function getAdminCache<T>(key: string, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function setAdminCache<T>(key: string, data: T[]): void {
  try {
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
}

// 1. Popups
export async function fetchAdminPopups(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/popups", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.POPUPS, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/popups, trying fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/popups/active", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.POPUPS, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public popups", e);
  }

  return getAdminCache(CACHE_KEYS.POPUPS);
}

export async function saveAdminPopup(token: string, formData: FormData, popupId?: string) {
  const url = popupId
    ? `${API_BASE}/admin/popups/${popupId}`
    : `${API_BASE}/admin/popups`;

  if (popupId) {
    formData.append("_method", "PUT");
  }

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

// 2. Promos
export async function fetchAdminPromos(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/promos", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.PROMOS, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/promos, trying public fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/promos", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.PROMOS, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public promos", e);
  }

  return getAdminCache(CACHE_KEYS.PROMOS);
}

// 3. Posts (Blog)
export async function fetchAdminPosts(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/posts", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.POSTS, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/posts, trying public fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/posts", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.POSTS, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public posts", e);
  }

  return getAdminCache(CACHE_KEYS.POSTS);
}

// 4. Gallery
export async function fetchAdminGallery(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/gallery-items", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.GALLERY, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/gallery-items, trying public fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/gallery-items", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.GALLERY, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public gallery items", e);
  }

  return getAdminCache(CACHE_KEYS.GALLERY);
}

// 5. Testimonials
export async function fetchAdminTestimonials(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/testimonials", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.TESTIMONIALS, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/testimonials, trying public fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/testimonials", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.TESTIMONIALS, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public testimonials", e);
  }

  return getAdminCache(CACHE_KEYS.TESTIMONIALS);
}

// 6. Download Apps
export async function fetchAdminDownloadApps(_token?: string) {
  try {
    const res: any = await apiClient.get("/admin/download-apps", { skipToast: true });
    const list = Array.isArray(res) ? res : res?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      setAdminCache(CACHE_KEYS.DOWNLOAD_APPS, list);
      return list;
    }
  } catch (e) {
    logger.warn("Failed fetching /admin/download-apps, trying public fallback...", e);
  }

  try {
    const pubRes: any = await apiClient.get("/download-apps", { skipToast: true });
    const pubList = Array.isArray(pubRes) ? pubRes : pubRes?.data || [];
    if (Array.isArray(pubList) && pubList.length > 0) {
      setAdminCache(CACHE_KEYS.DOWNLOAD_APPS, pubList);
      return pubList;
    }
  } catch (e) {
    logger.error("Failed fetching public download apps", e);
  }

  return getAdminCache(CACHE_KEYS.DOWNLOAD_APPS);
}
