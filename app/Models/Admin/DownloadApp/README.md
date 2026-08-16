# 📱 Model: Download App (`Admin/DownloadApp`)

## 1. File Model
- `DownloadApp.php`: Data tautan unduhan aplikasi mobile (Android APK/Play Store, iOS App Store).

## 2. Aktor yang Berkomunikasi
- **Admin**: Memperbarui URL rilis aplikasi dan versi terbaru.
- **Tamu / Pasien**: Melihat dan mengunduh aplikasi mobile dari banner download.

## 3. Arah & Alur Data
- **Admin ➔ `DownloadAppAdminController` ➔ Model `DownloadApp` ➔ Tabel `download_apps` ➔ `ContentController` ➔ Download Buttons UI.**
