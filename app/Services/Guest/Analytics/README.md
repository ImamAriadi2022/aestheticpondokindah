# 📊 Service: Guest Analytics Tracking (`Guest/Analytics`)

## 1. File Service
- `AnalyticsVisitService.php`

## 2. Aktor yang Terlibat
- **Pengunjung Web / Tamu**: Mengirimkan sinyal pelacakan halaman saat berpindah rute di website.

## 3. Arah & Alur Logika Data
- **Event Page View** ➔ `AnalyticsVisitService::recordVisit` ➔ Validasi payload URL, referer, campaign ➔ Simpan record baru ke tabel `page_visits` dengan timestamp realtime.
