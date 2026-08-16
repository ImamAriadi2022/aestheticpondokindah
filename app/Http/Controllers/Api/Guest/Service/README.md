# 🩺 Controller: Guest Services (`Guest/Service`)

## 1. File Controller
- `ClinicServicePublicController.php`

## 2. Aktor yang Berkomunikasi
- **Tamu / Calon Pasien**: Menjelajahi katalog layanan perawatan gigi klinik.
- **Sistem**: Menampilkan data layanan yang bertanda `is_active = true`.

## 3. Arah & Alur Data
- **Request**: `GET /api/public/services`, `GET /api/public/services/{slug}`.
- **Response**: JSON detail layanan, gambar, tahapan, dan dokter penanggung jawab.
