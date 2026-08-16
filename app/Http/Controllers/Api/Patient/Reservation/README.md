# 📅 Controller: Patient Reservation (`Patient/Reservation`)

## 1. File Controller
- `ReservationController.php`

## 2. Aktor yang Berkomunikasi
- **Pasien Terdaftar**: Membuat reservasi janji temu dengan dokter pilihan dan membatalkan reservasi.
- **Admin & Dokter**: Menerima reservasi pasien terdaftar.

## 3. Arah & Alur Data
- **Request**: `GET /api/user/reservations`, `POST /api/user/reservations`, `PUT /api/user/reservations/{id}/cancel`.
- **Proses**: Simpan ke tabel `reservations` dengan `user_id` pasien login.
