# 📅 Service: Guest Quick Reservation (`Guest/Reservation`)

## 1. File Service
- `GuestReservationService.php`

## 2. Aktor yang Terlibat
- **Tamu / Calon Pasien**: Mengisi formulir reservasi cepat.
- **Admin**: Menerima notifikasi reservasi baru di dashboard.

## 3. Arah & Alur Logika Data
- **Form Submit** ➔ `GuestReservationService::createReservation` ➔ Cek nomor WhatsApp di tabel `users` (jika sudah terdaftar, auto-link `user_id`) ➔ Buat record `reservations` (status: `pending`) ➔ Catat audit trail `reservation_audits` ➔ Dispatch `NotificationService::sendToAdmins`.
