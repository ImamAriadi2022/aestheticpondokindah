# 📰 Model: Content Marketing (`Guest/Content`)

## 1. File Model
- `Post.php`: Artikel blog edukasi kesehatan gigi dan SEO.
- `Promo.php`: Banner voucher diskon dan promosi musiman.
- `Popup.php`: Pengumuman penting modal popup saat pertama kali membuka website.
- `GalleryItem.php`: Foto showcase fasilitas klinik dan sebelum/sesudah perawatan.
- `Testimonial.php`: Cerita dan review kepuasan pasien.

## 2. Aktor yang Berkomunikasi
- **Admin**: Menulis artikel, mengunggah banner promo, mengatur popup, dan memoderasi ulasan.
- **Tamu / Pasien**: Mengonsumsi konten edukasi, mengklaim promo, dan melihat bukti hasil perawatan.

## 3. Arah & Alur Data
- **Admin Editor ➔ `PostAdminController` / `PromoAdminController` ➔ Models `Post`, `Promo`, dll. ➔ `ContentController` ➔ Landing Page & Blog Detail.**
