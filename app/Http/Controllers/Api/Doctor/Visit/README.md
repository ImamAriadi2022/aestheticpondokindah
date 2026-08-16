# 🏥 Controller: Doctor Visit (`Doctor/Visit`)

## 1. File Controller
- `VisitController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mencatat kehadiran fisik pasien di ruang periksa, keluhan utama, waktu mulai dan selesai.
- **Pasien**: Melihat riwayat kunjungan medis.

## 3. Arah & Alur Data
- **Request**: `GET /api/doctor/visits`, `GET /api/doctor/visits/{id}`, `PUT /api/doctor/visits/{id}/status`.
- **Proses**: Rekam kunjungan di tabel `visits` yang terhubung ke lembar EMR.
