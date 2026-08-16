# 📁 Model: Media Library (`Admin/Media`)

## 1. File Model
- `Media.php`: Arsip berkas gambar, foto rontgen, dokumen medis, dan banner promosi.

## 2. Aktor yang Berkomunikasi
- **Admin**: Mengelola galeri media, mencari berkas, menghapus berkas yang tidak terpakai.
- **Dokter & Pasien**: Mengunggah lampiran foto kondisi gigi dan rontgen.

## 3. Arah & Alur Data
- **Upload Action ➔ `UploadController` ➔ Model `Media` ➔ Tabel `media` & `storage/app/public` ➔ Admin Media Library Grid.**
