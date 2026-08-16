# 📅 Controller: Admin Reservation (`Admin/Reservation`)

## 1. File Controller
- `ReservationAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Melihat seluruh reservasi masuk, mengubah status (`confirmed`, `rescheduled`, `cancelled`, `completed`), dan menambahkan catatan admin.
- **Pasien & Dokter**: Menerima pembaruan status jadwal janji temu.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/reservations`, `PUT /api/admin/reservations/{reservation}`.
- **Proses**: Update status pada tabel `reservations` dan catat riwayat ke `reservation_audits`.
