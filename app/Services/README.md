# ⚙️ Panduan Arsitektur Business Logic Services (`app/Services/`)

Direktori ini menampung seluruh layer logika bisnis (*Domain Services*) yang terorganisir rapi dalam **5 Domain Aktor & Entitas**:

---

## 🏛️ Struktur 5 Domain Services

1. 🔗 **`Shared/`**:
   - `Consultation/ConsultationService.php`: Logika telekonsultasi multi-aktor (Tamu/Pasien, Dokter, Admin).
   - `Notification/NotificationService.php`: Logika pengiriman notifikasi in-app.
2. 🛡️ **`Admin/`**:
   - `Analytics/AnalyticsAdminService.php`: Agregasi metrik analitik trafik, konversi, dan tren reservasi.
   - `Settings/ClinicSettingAdminService.php`: Pengelolaan konfigurasi operasional klinik & legal.
3. 🩺 **`Doctor/`**:
   - `Visit/VisitService.php`: Sesi kunjungan fisik periksa pasien & auto-inisialisasi EMR.
   - `MedicalRecord/MedicalRecordService.php`: Siklus hidup Rekam Medis Elektronik, validasi & locking.
   - `MedicalRecord/SoapService.php`: Pengisian dan revisi catatan klinis SOAP.
   - `Diagnosis/DiagnosisService.php`: Pencarian katalog ICD-10 & penetapan diagnosis.
   - `Procedure/ProcedureService.php`: Pencatatan tindakan klinis gigi & tarif.
   - `Odontogram/OdontogramService.php`: Pemetaan visual interaktif 32 elemen gigi.
4. 👤 **`Patient/`**:
   - `Membership/MembershipService.php`: Kalkulasi level membership (Bronze, Gold, Platinum) & reward poin.
   - `Membership/MembershipActivationService.php`: Aktivasi tier otomatis pasca-pembayaran settlement.
   - `Payment/MidtransService.php`: Integrasi Midtrans Snap API & verifikasi signature webhook.
   - `Payment/SimulationPaymentService.php`: Mocking transaksi pembayaran di environment dev.
   - `Profile/ProfileCompletionService.php`: Pengecekan scoring kelengkapan biodata pasien.
5. 🌐 **`Guest/`**:
   - `Analytics/AnalyticsVisitService.php`: Pencatatan event page view anonim & device info.
   - `Reservation/GuestReservationService.php`: Alur booking janji temu cepat tanpa login.
