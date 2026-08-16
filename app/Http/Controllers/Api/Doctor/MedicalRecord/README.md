# 📋 Controller: Doctor EMR & SOAP (`Doctor/MedicalRecord`)

## 1. File Controller
- `MedicalRecordController.php`: Manajemen lembar rekam medis, finalisasi data, dan penguncian (*locking*).
- `SoapController.php`: Pencatatan anamnesis dan catatan SOAP dokter.

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mengisi rekam medis elektronik (EMR), SOAP, mengunci catatan rekam medis agar permanen dan sesuai standar medikolegal.
- **Pasien**: Membaca ringkasan rekam medis hasil pemeriksaan.

## 3. Arah & Alur Data
- **Request**: `GET/POST /api/doctor/medical-records/{id}/soap`, `POST /api/doctor/medical-records/{id}/finalize`, `POST /api/doctor/medical-records/{id}/lock`.
- **Proses**: Simpan ke tabel `medical_records` dan `soap_notes`.
