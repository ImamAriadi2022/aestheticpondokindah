# 🔔 Model: In-App Notification (`Patient/Notification`)

## 1. File Model
- `Notification.php`: Notifikasi pengingat jadwal, status reservasi, dan promo reward.

## 2. Aktor yang Berkomunikasi
- **Sistem Backend / Admin**: Memicu notifikasi otomatis saat reservasi disetujui, pembayaran lunas, atau jadwal periksa tiba.
- **Pasien**: Membaca dan menandai notifikasi telah dibaca di aplikasi.

## 3. Arah & Alur Data
- **System Event ➔ `NotificationService` ➔ Model `Notification` ➔ Tabel `notifications` ➔ Realtime Polling / Notification Bell UI.**
