// Konfigurasi API Base URL
// Untuk development: http://localhost:8000/api
// Untuk production: https://aestheticpondokindah.web.id/api
// Laravel lives at the repository root and is exposed through the webroot.

const getApiBaseUrl = (): string => {
  // Cek apakah di environment production
  if (import.meta.env.PROD) {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}/api`;
    }
    return "https://aestheticpondokindah.com/api";
  }

  // Untuk development, gunakan localhost
  return "http://localhost:8000/api";
};

export const API_BASE = getApiBaseUrl();

/**
 * Build a correct storage image URL from backend response.
 * The backend may return an absolute URL based on APP_URL which can be wrong
 * during development (e.g. missing port). This helper rebuilds the URL using
 * the known API base, ensuring images load correctly in both dev and production.
 */
export const getStorageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  const baseUrl = API_BASE.replace("/api", "");

  // If the backend returned a path that already contains /storage/, extract it
  if (imageUrl.includes("/storage/")) {
    const path = imageUrl.substring(imageUrl.indexOf("/storage/"));
    return baseUrl + path;
  }

  // Already an absolute URL from a different domain (e.g. CDN)
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Relative path without /storage/ prefix
  return baseUrl + "/storage/" + imageUrl;
};
