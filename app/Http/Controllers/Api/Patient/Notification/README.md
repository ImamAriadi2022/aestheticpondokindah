# 🔔 Controller: Patient Notification (`Patient/Notification`)

## 1. File Controller
- `NotificationController.php`

## 2. Aktor yang Berkomunikasi
- **Pasien**: Membaca notifikasi in-app, menandai telah dibaca, mendaftarkan FCM device token.
- **Sistem**: Mengirim pemberitahuan penting (jadwal dokter, diskon promo, konfirmasi reservasi).

## 3. Arah & Alur Data
- **Request**: `GET /api/user/notifications`, `POST /api/user/notifications/{id}/read`, `POST /api/user/device-token`.
- **Proses**: Manajemen notifikasi di tabel `notifications` dan `user_device_tokens`.
