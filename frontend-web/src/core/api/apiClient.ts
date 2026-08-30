import { API_BASE } from "@/core/api/apiConfig";
import { ApiError, getErrorMessage } from "@/core/api/apiError";
import { toast } from "@/shared/ui/toast";
import { logger } from "@/core/utils/logger";
import { touchSessionLastActive, clearSessionStorage } from "@/core/auth/services/sessionTtl";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  skipAuth?: boolean;
  skipToast?: boolean;
  silent?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30000;

// Rate-limiting for network/timeout error toasts to prevent spamming
let lastToastTime = 0;
const TOAST_COOLDOWN_MS = 8000;

function showThrottledToast(message: string) {
  const now = Date.now();
  if (now - lastToastTime > TOAST_COOLDOWN_MS) {
    lastToastTime = now;
    toast.error(message);
  }
}

const getAuthToken = (): string | null => {
  const apidentToken = localStorage.getItem("apident:token");
  if (apidentToken) return apidentToken;

  const userStr = localStorage.getItem("apident:user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) return user.token;
    } catch (e) {
      // ignore
    }
  }
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

const handleUnauthorized = () => {
  clearSessionStorage();
  
  if (typeof window !== "undefined" && !window.location.hash.includes("/login")) {
    showThrottledToast("Sesi Anda telah berakhir. Silakan login kembali.");
    window.location.href = "/#/login";
  }
};

export const apiClient = {
  request: async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const method = (options.method || "GET").toUpperCase();
    const isGet = method === "GET";

    const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = isGet ? 1 : 0,
      skipAuth = false,
      // Default to silent on GET requests to prevent background polling from spamming popups
      skipToast = isGet || options.silent || false,
      silent = false,
      ...fetchOptions
    } = options;

    const shouldSuppressToast = skipToast || silent;

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const token = !skipAuth ? getAuthToken() : null;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-App-Version": "1.0.0",
      "X-Request-Timestamp": new Date().toISOString(),
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let attempt = 0;
    while (attempt <= retries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      logger.request(method, url, fetchOptions.body);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          method,
          headers,
          signal: fetchOptions.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        let data: any = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { message: text };
        }

        logger.response(method, url, response.status, data);

        if (response.ok) {
          touchSessionLastActive();
          return data as T;
        }

        // Handle Status Codes
        if (response.status === 401) {
          if (!shouldSuppressToast && !skipAuth) {
            handleUnauthorized();
          }
          throw new ApiError("Sesi Anda telah berakhir.", 401);
        }

        const errorMessage = getErrorMessage(response.status, data?.message || data?.error);
        if (!shouldSuppressToast && response.status !== 401 && !isGet) {
          showThrottledToast(errorMessage);
        }

        throw new ApiError(errorMessage, response.status, data?.errors, data?.code);
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError") {
          const timeoutMsg = "Waktu permintaan berakhir. Silakan periksa koneksi Anda.";
          // Only show toast if user explicitly initiated a non-GET write action and did not suppress toast
          if (!shouldSuppressToast && !isGet && (typeof document === "undefined" || !document.hidden)) {
            showThrottledToast(timeoutMsg);
          }
          throw new ApiError(timeoutMsg, 408);
        }

        if (err instanceof ApiError) {
          throw err;
        }

        // Network error retry logic for GET requests
        if (attempt <= retries && isGet) {
          logger.warn("ApiClient", `Retrying request to ${url} (Attempt ${attempt}/${retries})...`);
          await new Promise((r) => setTimeout(r, 800 * attempt));
          continue;
        }

        const networkMsg = typeof navigator !== "undefined" && !navigator.onLine
          ? "Koneksi internet Anda terputus. Menggunakan data cache lokal."
          : "Gagal terhubung ke server. Silakan periksa koneksi internet Anda.";
        
        // Suppress network error toast for GET requests / background sync to avoid disruptive spam
        if (!shouldSuppressToast && !isGet && (typeof document === "undefined" || !document.hidden)) {
          showThrottledToast(networkMsg);
        }

        throw new ApiError(networkMsg, 0);
      }
    }

    throw new ApiError("Gagal melakukan permintaan API.", 500);
  },

  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, { skipToast: true, ...options, method: "GET" });
  },

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, { ...options, method: "DELETE" });
  },

  upload: <T = any>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },
};
