# ❓ Model: FAQ (`Guest/Faq`)

## 1. File Model
- `Faq.php`: Daftar pertanyaan umum dan jawaban seputar perawatan gigi.

## 2. Aktor yang Berkomunikasi
- **Pengunjung Web**: Mencari jawaban atas pertanyaan umum sebelum reservasi.
- **Admin**: Mengelola daftar tanya jawab.

## 3. Arah & Alur Data
- **Admin ➔ `FaqAdminController` ➔ Model `Faq` ➔ Tabel `faqs` ➔ `FaqPublicController` ➔ Accordion FAQ UI.**
