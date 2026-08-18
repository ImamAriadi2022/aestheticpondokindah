# 🔔 Service: Notifikasi In-App (`Shared/Notification`)

## 1. File Service
- `NotificationService.php`

## 2. Aktor yang Terlibat
- **Seluruh Aktor (Pasien, Dokter, Admin)**: Menerima pemberitahuan event penting.

## 3. Arah & Alur Logika Data
- **Trigger Event** (misal: reservasi disetujui, invoice diterbitkan, sesi konsultasi dimulai) ➔ `NotificationService::send` ➔ Simpan record ke tabel `notifications` ➔ Realtime polling / Push notifikasi device via `UserDeviceToken`.
