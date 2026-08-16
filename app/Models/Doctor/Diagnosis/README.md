# 🔍 Model: Diagnosis & ICD-10 (`Doctor/Diagnosis`)

## 1. File Model
- `Diagnosis.php`: Diagnosis klinis yang ditetapkan dokter untuk pasien.
- `Icd10Code.php`: Master katalog kode penyakit gigi ICD-10 (misal K02.1 Karies Dentin).

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mencari kode ICD-10 dan menetapkan diagnosis primer/sekunder.
- **Sistem Medis**: Standardisasi rekam medis sesuai regulasi Kemenkes.

## 3. Arah & Alur Data
- **Pencarian Kode ➔ `DiagnosisController::searchIcd10` ➔ Model `Icd10Code` ➔ Penetapan Diagnosis ➔ Model `Diagnosis` ➔ Tabel `diagnoses`.**
