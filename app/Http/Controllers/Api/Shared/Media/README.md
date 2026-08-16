# 📁 Fitur: Upload Media File (`Shared/Media`)

## 1. Deskripsi Fitur
Endpoint terpusat untuk mengunggah berkas gambar (avatar, lampiran pengaduan, bukti rontgen, cover artikel blog, galeri klinik).

## 2. Aktor yang Berkomunikasi
- **Seluruh Aktor Terautentikasi (Admin, Dokter, Pasien)**: Mengunggah file gambar ke storage publik.

## 3. Alur & Arah Data (Data Flow)
- Client (Multipart Form Data) ➔ `UploadController::store` ➔ Validasi MIME & Size ➔ Laravel Disk Storage (`public/uploads`) ➔ Mengembalikan URL path file permanen.
