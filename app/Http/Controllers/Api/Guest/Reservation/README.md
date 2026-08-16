# 📅 Controller: Guest Reservation (`Guest/Reservation`)

## 1. File Controller
- `ReservationController.php`

## 2. Aktor yang Berkomunikasi
- **Tamu Non-Login**: Membuat janji temu cepat dengan memasukkan nama, nomor WhatsApp, email, tanggal lahir, dan keluhan.
- **Admin & Dokter**: Menerima reservasi tamu dan mengonfirmasi via WhatsApp.

## 3. Arah & Alur Data
- **Request**: `POST /api/public/reservations` (Rate limited: 60/menit).
- **Proses**: Simpan ke tabel `reservations` dengan `source = 'guest'`.
