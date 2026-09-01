import { API_BASE } from '@/constants/api';
import { authStorage } from '@/storage/authStorage';
import { router } from 'expo-router';

const DEFAULT_TIMEOUT_MS = 15000;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getErrorMessage = (status: number, serverMessage?: string): string => {
  switch (status) {
    case 400: return serverMessage || 'Permintaan tidak valid.';
    case 401: return 'Sesi Anda telah berakhir. Silakan login kembali.';
    case 403: return 'Anda tidak memiliki hak akses.';
    case 404: return serverMessage || 'Data tidak ditemukan.';
    case 409: return serverMessage || 'Terjadi konflik data.';
    case 422: return serverMessage || 'Data yang dimasukkan tidak valid.';
    case 429: return 'Terlalu banyak permintaan. Silakan tunggu sebentar.';
    case 500: return 'Terjadi kesalahan pada server.';
    case 502:
    case 503:
    case 504: return 'Server sedang dalam pemeliharaan.';
    default: return serverMessage || 'Terjadi kesalahan yang tidak terduga.';
  }
};

const handleUnauthorized = async () => {
  await authStorage.clearAll();
  router.replace('/(auth)/login');
};

interface RequestOptions {
  method?: string;
  body?: any;
  timeoutMs?: number;
  retries?: number;
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = method === 'GET' ? 1 : 0,
    skipAuth = false,
    headers: extraHeaders = {},
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const token = await authStorage.getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-App-Version': '1.0.0',
    'X-Client': 'android-native',
    Origin: 'https://aestheticpondokindah.com',
    Referer: 'https://aestheticpondokindah.com/',
    ...extraHeaders,
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  let attempt = 0;
  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (response.ok) return data as T;

      if (response.status === 401 && !skipAuth) {
        await handleUnauthorized();
        throw new ApiError('Sesi berakhir.', 401);
      }

      const msg = getErrorMessage(response.status, data?.message);
      throw new ApiError(msg, response.status, data?.errors);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) throw err;
      if (err.name === 'AbortError') {
        throw new ApiError('Waktu permintaan berakhir. Periksa koneksi Anda.', 408);
      }
      if (attempt <= retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw new ApiError('Gagal terhubung ke server. Periksa koneksi internet Anda.', 0);
    }
  }

  throw new ApiError('Gagal melakukan permintaan.', 500);
}

export const apiClient = {
  get: <T = any>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'DELETE' }),

  upload: <T = any>(endpoint: string, formData: FormData, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'POST', body: formData }),

  ApiError,
};
