# 🦷 Model: Clinical Procedure (`Doctor/Procedure`)

## 1. File Model
- `ClinicalProcedure.php`: Tindakan medis gigi nyata yang dieksekusi dokter.
- `ProcedureCatalog.php`: Master katalog tarif dan nama tindakan klinis.

## 2. Aktor yang Berkomunikasi
- **Dokter**: Memilih tindakan medis dari katalog dan mencatat nomor gigi yang dirawat.
- **Kasir / Billing**: Referensi tindakan untuk penerbitan invoice pembayaran.

## 3. Arah & Alur Data
- **Dokter Eksekusi Tindakan ➔ `ProcedureController` ➔ Model `ClinicalProcedure` ➔ Tabel `clinical_procedures` ➔ Kalkulasi Biaya Perawatan.**
