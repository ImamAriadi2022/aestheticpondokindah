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
}

const DEFAULT_TIMEOUT_MS = 15000;

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
    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
    window.location.href = "/#/login";
  }
};

export const apiClient = {
  request: async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const {
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = 0,
      skipAuth = false,
      skipToast = false,
      ...fetchOptions
    } = options;

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

      logger.request(fetchOptions.method || "GET", url, fetchOptions.body);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
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

        logger.response(fetchOptions.method || "GET", url, response.status, data);

        if (response.ok) {
          touchSessionLastActive();
          return data as T;
        }

        // Handle Status Codes
        if (response.status === 401) {
          if (!skipToast && !skipAuth) {
            handleUnauthorized();
          }
          throw new ApiError("Sesi Anda telah berakhir.", 401);
        }

        const errorMessage = getErrorMessage(response.status, data?.message || data?.error);
        if (!skipToast && response.status !== 401) {
          toast.error(errorMessage);
        }

        throw new ApiError(errorMessage, response.status, data?.errors, data?.code);
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError") {
          const timeoutMsg = "Waktu permintaan berakhir (Timeout). Silakan periksa koneksi Anda.";
          if (!skipToast) toast.error(timeoutMsg);
          throw new ApiError(timeoutMsg, 408);
        }

        if (err instanceof ApiError) {
          throw err;
        }

        // Network error retry logic
        if (attempt <= retries) {
          logger.warn("ApiClient", `Retrying request to ${url} (Attempt ${attempt}/${retries})...`);
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }

        const networkMsg = !navigator.onLine
          ? "Koneksi internet Anda terputus. Menampilkan data cache lokal."
          : "Gagal terhubung ke server. Silakan periksa koneksi internet Anda.";
        if (!skipToast) toast.error(networkMsg);
        throw new ApiError(networkMsg, 0);
      }
    }

    throw new ApiError("Gagal melakukan permintaan API.", 500);
  },

  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiClient.request<T>(endpoint, { ...options, method: "GET" });
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
