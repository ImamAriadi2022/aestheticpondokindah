# 📊 Controller: Admin Analytics (`Admin/Analytics`)

## 1. File Controller
- `AnalyticsAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Meminta metrik statistik performa operasional.
- **Sistem Pelacakan & Database**: Menghitung ringkasan data kunjungan (`page_visits`), pasien baru (`users`), reservasi masuk (`reservations`), dan pendapatan.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` (Bearer Token Admin).
- **Proses**: Mengagregasi data dari tabel `page_visits`, `reservations`, `users`, dan `payments`.
- **Response**: JSON ringkasan statistik harian, mingguan, dan bulanan.
