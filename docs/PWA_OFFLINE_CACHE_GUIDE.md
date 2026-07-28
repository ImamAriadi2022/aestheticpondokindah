# Panduan PWA, Service Worker & Offline Support — Aesthetic Pondok Indah

Dokumen ini menjelaskan arsitektur **Progressive Web App (PWA)**, strategi **Runtime Caching**, keamanan data, dan mekanisme **Offline Support** yang diimplementasikan pada project *Aesthetic Pondok Indah Dental Clinic*.

---

## 1. Komponen Utama PWA

1. **Web App Manifest (`manifest.json`)**:
   * Menentukan identitas aplikasi, nama (`Aesthetic Pondok Indah Dental Clinic`), warna tema (`#C59E3F`), latar belakang (`#FAF8F5`), ikon aplikasi (192x192 & 512x512 maskable), dan mode tampilan `standalone`.
2. **Service Worker (`sw.js`)**:
   * Berada di `public/sw.js` (dan `public_html/sw.js`).
   * Menangani pra-cache (pre-cache) App Shell, pencucian cache versi lama saat aktivasi, dan strategi runtime caching.
3. **PWA Manager Component (`PwaManager.tsx`)**:
   * Komponen React yang bertugas memantau status `online` / `offline`, menangani prompt install PWA (`beforeinstallprompt`), serta mendeteksi pembaruan Service Worker (`updatefound` / `waiting`).
4. **Offline Fallback Page (`offline.html`)**:
   * Halaman fallback berdesain luxury khas brand jika pengguna menavigasi halaman baru saat tidak ada jaringan internet.
5. **Guest Session Cache Manager (`guestSession.ts`)**:
   * Mengelola cache guest session di LocalStorage dengan Expiration Timestamp (7 hari TTL), versi cache (`v1.0.0`), dan validasi format otomatis untuk menangani data korup.

---

## 2. Strategi Caching (Runtime Cache Strategy)

| Tipe Resource | Strategi Caching | Penjelasan |
| :--- | :--- | :--- |
| **App Shell / Static Shell** | **Pre-Cache & Cache-First** | `/index.html`, `/offline.html`, `/manifest.json`, `/logo/logo.png` langsung dipra-cache saat Service Worker terpasang. |
| **Static Assets & Bundle JS/CSS** | **Cache-First** | Aset gambar, font lokal, bundle Vite (`/assets/*`) diambil dari cache terlebih dahulu untuk kecepatan maksimal. |
| **Google Fonts & External CDN** | **Stale-While-Revalidate** | Mengembalikan versi cache untuk kecepatan instant, sambil melakukan pembaruan di latar belakang jika terhubung ke internet. |
| **Public API Data (`/api/public/*`)** | **Network-First with Fallback** | Mengambil data terbaru dari server. Jika jaringan offline, mengembalikan respon dari cache API. |
| **Auth & Private Endpoints** | **BYPASS (DO NOT CACHE)** | POST, PUT, DELETE, `/api/auth/*`, `/api/user/*`, `/api/admin/*`, dan Sanctum tokens **SAMA SEKALI TIDAK DICACHE** demi keamanan data. |

---

## 3. Fitur Utama & Pengalaman Pengguna (User Experience)

1. **Status Online / Offline Auto Detection**:
   * Saat internet terputus, muncul banner mengambang: `📡 Mode Offline Aktif. Menampilkan data cache aplikasi & halaman offline.`
   * Saat terhubung kembali, muncul toast: `✨ Terhubung Kembali. Koneksi internet pulih.`
2. **PWA App Installation**:
   * Pengguna browser mobile/desktop dapat menginstall website sebagai aplikasi standalone native-like di smartphone/laptop via tombol **Install Aplikasi**.
3. **Pembaruan Aplikasi Tanpa Disruptif**:
   * Saat rilis baru Service Worker di-deploy, muncul notifikasi: `⚡ Versi Baru Tersedia — [Perbarui]` sehingga pengguna dapat memperbarui aplikasi secara manual tanpa paksaan reload.

---

## 4. Keamanan & Batasan (Security & Limitations)

* **Bypass Auth & Private Data**: Token Sanctum, password, profile pengguna, dan pembayaran **tidak pernah** disimpan dalam Service Worker cache.
* **Storage Symlink & Backend**: Request ke `/backend/` dan endpoint admin dikecualikan dari Service Worker.
