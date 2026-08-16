# 📱 Controller: Admin Download App (`Admin/DownloadApp`)

## 1. File Controller
- `DownloadAppAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: CRUD tautan rilis aplikasi mobile (Google Play Store, Apple App Store, Direct APK).
- **Tamu / Pasien**: Mengakses tombol download di halaman publik.

## 3. Arah & Alur Data
- **Request**: `GET/POST/PUT/DELETE /api/admin/download-apps`.
- **Proses**: Manajemen link di tabel `download_apps`.
- **Response**: JSON list/detail data tautan aplikasi.
