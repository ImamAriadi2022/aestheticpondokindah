# 🏛️ Panduan Arsitektur Model Eloquent (`app/Models/`)

Direktori ini menampung seluruh representasi model data Eloquent ORM yang terorganisir rapi ke dalam **5 Domain Aktor & Entitas**.

---

## 📁 Struktur 5 Domain Model

1. 🔗 **`Shared/`**: Entitas utama multi-aktor (`User`, `Branch`, `Reservation`, `Consultation`).
2. 🛡️ **`Admin/`**: Model operasional admin (`ClinicSetting`, `DownloadApp`, `Media`, `PageVisit`, `PromoClaim`).
3. 🩺 **`Doctor/`**: Model klinis & EMR (`MedicalRecord`, `SoapNote`, `Diagnosis`, `ClinicalProcedure`, `Odontogram`, `Visit`, `DoctorSchedule`).
4. 👤 **`Patient/`**: Model pasien & membership (`UserProfile`, `MembershipProfile`, `MembershipPoint`, `Invoice`, `Payment`, `Complaint`, `Notification`).
5. 🌐 **`Guest/`**: Model informasi publik (`ClinicService`, `Faq`, `ContactMessage`, `Post`, `Promo`, `Popup`, `GalleryItem`, `Testimonial`, `Wilayah`).

---

## 🗄️ Relasi Data Utama Antar-Domain

```mermaid
erDiagram
    USER ||--o{ RESERVATION : places
    USER ||--o{ CONSULTATION : has
    USER ||--o{ VISIT : attends
    USER ||--o{ MEDICAL_RECORD : owns
    DOCTOR ||--o{ DOCTOR_SCHEDULE : sets
    DOCTOR ||--o{ VISIT : handles
    VISIT ||--|| MEDICAL_RECORD : generates
    MEDICAL_RECORD ||--|| SOAP_NOTE : contains
    MEDICAL_RECORD ||--o{ DIAGNOSIS : records
    MEDICAL_RECORD ||--o{ CLINICAL_PROCEDURE : executes
    MEDICAL_RECORD ||--|| ODONTOGRAM : maps
    USER ||--|| MEMBERSHIP_PROFILE : profile
    USER ||--o{ MEMBERSHIP_TRANSACTION : pays
```
