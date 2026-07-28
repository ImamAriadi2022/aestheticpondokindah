# Panduan Sistem Error Handling, Toast System & API Integration — Aesthetic Pondok Indah

Dokumen ini menjelaskan arsitektur **Terpusat (Centralized)** untuk penanganan kesalahan (Error Handling), Toast Notification System, Logger tersanitasi, dan Client API wrapper.

---

## 1. Arsitektur API Client & Interceptor (`apiClient.ts`)

Seluruh komunikasi REST API menggunakan `apiClient` terpusat yang dilengkapi fitur:

1. **Dynamic Base URL**:
   * Menyesuaikan otomatis ke `window.location.origin + "/backend/public/api"` pada environment produksi dan `http://localhost:8000/api` pada development.
2. **Request Interceptor**:
   * Penambahan otomatis header `Authorization: Bearer <token>` (Sanctum).
   * Header `Accept: application/json` & `X-Requested-With: XMLHttpRequest`.
   * Header telemetry `X-App-Version` & `X-Request-Timestamp`.
3. **Response Interceptor & Status Handling**:
   * `401 Unauthorized`: Menghapus session/token lokal, memicu toast *"Sesi Anda telah berakhir"*, dan mengarahkan pengguna ke halaman login (`/#/login`).
   * `422 Unprocessable Content`: Memformat pesan error validasi form Laravel secara terstruktur.
   * `429 Rate Limit`: Toast peringatan batas batas request.
   * `500 - 504 Server Error`: Toast ramah pengguna tanpa mengekspos raw error backend.
4. **Timeout & Retry Strategy**:
   * Global timeout **15 detik** dengan `AbortController`.
   * Automatic Retry 1x dengan *exponential backoff* untuk request aman `GET` pada kegagalan jaringan sementara.

---

## 2. Toast System (`toast.tsx`)

Toast Notification System mendukung 5 tipe varian:

* `toast.success(message)` — Toast hijau/emas untuk konfirmasi sukses.
* `toast.error(message)` — Toast merah untuk pesan kesalahan.
* `toast.warning(message)` — Toast kuning/amber untuk peringatan.
* `toast.info(message)` — Toast abu-abu/biru untuk informasi umum.
* `toast.loading(message)` — Toast dengan animasi spinner untuk operasi asynchronous.
* `toast.promise(promise, messages)` — Otomatis menangani state loading, success, dan error pada Promise.

**Fitur Toast Utama**:
* **Deduplikasi**: Pesan yang identik tidak akan ditampilkan ganda dalam durasi 2 detik.
* **Batas Maksimal**: Maksimal 3 toast ditampilkan secara bersamaan di layar.
* **Aksesibilitas**: Dilengkapi atribut `role="status"` dan `aria-live="polite"`.

---

## 3. Logger Tersanitasi (`logger.ts`)

Utility `logger` menggantikan `console.log` mentah dengan aturan keamanan:

* **Pembersihan Data Sensitif**: Otomatis menyamarkan field seperti `password`, `token`, `secret`, dan `card_number` menjadi `***[REDACTED]***`.
* **Kategori Log**: Supports `logger.info()`, `logger.debug()`, `logger.warn()`, `logger.error()`, `logger.request()`, `logger.response()`, dan `logger.performance()`.
* **Mode Production**: Log level debug/info otomatis dinonaktifkan di mode production (`import.meta.env.PROD`).

---

## 4. UI Error Boundary (`ErrorBoundary.tsx`)

Komponen Error Boundary membungkus React Router untuk menangkap kesalahan rendering UI yang tidak terduga, mencatatnya via `logger.error()`, dan menampilkan halaman fallback berdesain luxury brand lengkap dengan tombol **Muat Ulang Halaman** dan **Ke Beranda**.
