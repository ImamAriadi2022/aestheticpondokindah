# 📰 Controller: Admin Content (`Admin/Content`)

## 1. File Controller
- `PostAdminController.php`: Artikel blog & berita.
- `PromoAdminController.php`: Banner & kupon diskon.
- `PopupAdminController.php`: Pengumuman modal popup.
- `GalleryAdminController.php`: Galeri foto klinik.
- `TestimonialAdminController.php`: Review & testimoni pasien.
- `MediaAdminController.php`: File library media.

## 2. Aktor yang Berkomunikasi
- **Admin**: Penulis dan pengelola seluruh materi promosi dan edukasi digital.
- **Tamu / Pasien**: Mengakses konten di portal web.

## 3. Arah & Alur Data
- **Admin ➔ Content Controllers ➔ Tabel `posts`, `promos`, `popups`, `gallery_items`, `testimonials` ➔ Public API.**
