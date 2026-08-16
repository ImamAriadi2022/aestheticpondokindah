# 🩺 Domain Model: Doctor (Clinical & EMR)

Menyimpan seluruh model data yang berkaitan dengan standar **Rekam Medis Elektronik (EMR)** dan praktik klinis dokter gigi.

## 📁 Subfolder & File Model:
- **`Schedule/DoctorSchedule.php`**: Jadwal dokter (hari, jam mulai, jam selesai, kuota).
- **`Visit/Visit.php`**: Kunjungan pasien fisik di ruang praktik.
- **`MedicalRecord/MedicalRecord.php` & `SoapNote.php`**: Lembar utama EMR dan catatan subjektif/objektif/asesmen/rencana SOAP.
- **`Diagnosis/Diagnosis.php` & `Icd10Code.php`**: Diagnosis penyakit gigi berstandar ICD-10.
- **`Procedure/ClinicalProcedure.php` & `ProcedureCatalog.php`**: Tindakan medis yang dilakukan dokter pada gigi tertentu.
- **`Odontogram/Odontogram.php` & `ToothState.php`**: Kondisi visual ke-32 gigi pasien (karies, tambalan, mahkota, hilang, dll.).
