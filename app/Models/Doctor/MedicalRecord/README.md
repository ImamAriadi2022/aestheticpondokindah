# 📋 Model: EMR & SOAP (`Doctor/MedicalRecord`)

## 1. File Model
- `MedicalRecord.php`: Lembar induk Rekam Medis Elektronik pasien.
- `SoapNote.php`: Catatan medis standar SOAP (Subjective, Objective, Assessment, Plan).

## 2. Aktor yang Berkomunikasi
- **Dokter**: Menulis anamnesis, pemeriksaan klinis, rencana perawatan, finalisasi, dan penguncian EMR.
- **Pasien**: Melihat ringkasan rekam medis personal.

## 3. Arah & Alur Data
- **Dokter ➔ `SoapController` & `MedicalRecordController` ➔ Model `MedicalRecord` & `SoapNote` ➔ Tabel `medical_records` & `soap_notes` ➔ History EMR Pasien.**
