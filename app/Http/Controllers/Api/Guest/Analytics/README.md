# 📊 Controller: Guest Analytics (`Guest/Analytics`)

## 1. File Controller
- `AnalyticsVisitController.php`

## 2. Aktor yang Berkomunikasi
- **Frontend Client (Tamu/Pasien)**: Mengirim sinyal page view saat berpindah halaman di website.
- **Admin**: Melihat grafik trafik pengunjung.

## 3. Arah & Alur Data
- **Request**: `POST /api/public/analytics/visit`.
- **Proses**: Catat log kunjungan anonim ke tabel `page_visits`.
