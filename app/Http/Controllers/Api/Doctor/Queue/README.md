# 👥 Controller: Doctor Queue (`Doctor/Queue`)

## 1. File Controller
- `DoctorQueueController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter**: Melihat daftar antrean pasien hari ini yang sudah terkonfirmasi di kliniknya, memulai pemeriksaan (*start*), dan menyelesaikan (*complete*).
- **Pasien**: Mengetahui urutan antrean periksa.

## 3. Arah & Alur Data
- **Request**: `GET /api/doctor/queue`, `PUT /api/doctor/reservations/{id}/start`, `PUT /api/doctor/reservations/{id}/complete`.
- **Proses**: Filter reservasi berdasarkan `doctor_id` dan tanggal hari ini.
