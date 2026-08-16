# 🗺️ Model: Wilayah (`Guest/Wilayah`)

## 1. File Model
- `Wilayah.php`: Master data hierarki wilayah Indonesia (Provinsi, Kabupaten, Kecamatan, Kelurahan).

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Memilih lokasi alamat saat registrasi atau reservasi.
- **Sistem**: Validasi kode pos dan zonasi cabang terdekat.

## 3. Arah & Alur Data
- **Select Dropdown ➔ `WilayahController` ➔ Model `Wilayah` ➔ Tabel `wilayah` ➔ Autocomplete Address Input.**
