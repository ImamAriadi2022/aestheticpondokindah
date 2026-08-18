# 🌐 Domain Services: Guest (Layanan Tamu)

Layanan bisnis untuk **Pengunjung Publik & Tamu Non-Login** yang mencakup pencatatan kunjungan anonim dan reservasi cepat.

## 📁 Subfolder & File Service:
- **`Analytics/AnalyticsVisitService.php`**: Pelacakan anonim page view, referer, device type, dan IP address.
- **`Reservation/GuestReservationService.php`**: Alur pembuatan janji temu cepat bagi tamu tanpa akun, auto-link ke akun pasien yang cocok, dan pengiriman notifikasi ke admin.
