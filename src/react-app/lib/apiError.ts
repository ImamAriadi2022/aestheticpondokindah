export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  code?: string;

  constructor(message: string, status: number = 500, errors?: Record<string, string[]>, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

export const getErrorMessage = (status: number, dataMessage?: string): string => {
  if (!navigator.onLine) {
    return 'Koneksi internet Anda terputus. Menampilkan data offline cache.';
  }

  switch (status) {
    case 400:
      return dataMessage || 'Permintaan tidak valid. Silakan periksa kembali input Anda.';
    case 401:
      return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
    case 403:
      return 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.';
    case 404:
      return dataMessage || 'Data yang Anda cari tidak ditemukan.';
    case 409:
      return dataMessage || 'Terjadi konflik data. Data sudah ada sebelumnya.';
    case 422:
      return dataMessage || 'Data yang dimasukkan belum lengkap atau tidak valid.';
    case 429:
      return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.';
    case 500:
      return 'Terjadi kesalahan pada server. Tim kami sedang menanganinya.';
    case 502:
    case 503:
    case 504:
      return 'Layanan server sedang dalam pemeliharaan. Silakan coba lagi nanti.';
    default:
      return dataMessage || 'Terjadi kesalahan yang tidak terduga.';
  }
};
