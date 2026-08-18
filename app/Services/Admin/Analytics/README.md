# 📊 Service: Admin Analytics (`Admin/Analytics`)

## 1. File Service
- `AnalyticsAdminService.php`

## 2. Aktor yang Terlibat
- **Administrator Klinik**: Meminta laporan performa operasional dan metrik trafik.

## 3. Arah & Alur Logika Data
- **Request Rentang Tanggal** ➔ `AnalyticsAdminService::getSummary` ➔ Agregasi `PageVisit::visited_at` dan `Reservation::created_at` ➔ Hitung rasio konversi `(total_reservations / total_visitors) * 100` ➔ Return array statistik tren harian.
