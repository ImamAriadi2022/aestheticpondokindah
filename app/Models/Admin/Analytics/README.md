# 📊 Model: Analytics (`Admin/Analytics`)

## 1. File Model
- `PageVisit.php`: Mencatat log kunjungan halaman web anonim dan pengguna.

## 2. Aktor yang Berkomunikasi
- **Tamu / Pengunjung Website**: Mengirim event kunjungan halaman (URL, User Agent, Referer, IP Hash).
- **Administrator Klinik**: Membaca data agregat untuk laporan statistik performa web dan kampanye promosi.

## 3. Arah & Alur Data
- **Guest Visit ➔ `AnalyticsVisitController` ➔ Model `PageVisit` ➔ Tabel `page_visits` ➔ `AnalyticsAdminController` ➔ Admin Dashboard Charts.**
