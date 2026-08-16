# 🗺️ Fitur: Master Data Wilayah (`Shared/Wilayah`)

## 1. Deskripsi Fitur
Menyediakan cascade data administratif wilayah Indonesia (Provinsi ➔ Kabupaten/Kota ➔ Kecamatan ➔ Kelurahan) untuk form registrasi, reservasi, dan profil.

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Memilih provinsi, kabupaten, kecamatan, dan kelurahan pada form input alamat.
- **Admin**: Referensi wilayah pada profil pengguna dan operasional cabang.

## 3. Alur & Arah Data (Data Flow)
- **Client ➔ `WilayahController` ➔ Model `Wilayah` ➔ Tabel `wilayah` (Query level: provinsi -> kab -> kec -> kel) ➔ Client Cache / Form Picker.**
