# 📋 BUKU SKENARIO UJI PENERIMAAN PENGGUNA (UAT)
# Aesthetic Pondok Indah Dental Clinic — Sistem Manajemen Klinik

---

**Versi Dokumen**: 1.0.0  
**Tanggal Rilis**: 31 Juli 2026  
**Sprint yang Dicakup**: Sprint 1 — Sprint 5  
**Jumlah Test Case**: 200+ skenario bisnis  
**Status**: Release Candidate — Siap UAT  
**Penyusun**: QA Engineering Team · Clinical Information System Division

---

> **PENTING**: Dokumen ini adalah panduan pengujian bisnis end-to-end.  
> Ini BUKAN API test. Ini BUKAN unit test.  
> Dokumen ini digunakan oleh Pengembang, QA Engineer, Admin Klinik, Resepsionis, Dokter, dan Product Owner  
> untuk memverifikasi bahwa seluruh sistem berjalan benar sebelum setiap rilis ke produksi.

---

## 📑 DAFTAR ISI

1. [Ringkasan Sistem](#1-ringkasan-sistem)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Kredensial Test & Data Awal](#3-kredensial-test--data-awal)
4. [Alur Klinik End-to-End](#4-alur-klinik-end-to-end)
5. [Modul A — Autentikasi & Otorisasi](#modul-a--autentikasi--otorisasi)
6. [Modul B — Registrasi & Profil Pengguna](#modul-b--registrasi--profil-pengguna)
7. [Modul C — Reservasi & Pemesanan](#modul-c--reservasi--pemesanan)
8. [Modul D — Jadwal Dokter](#modul-d--jadwal-dokter)
9. [Modul E — Antrean Dokter & Manajemen Kunjungan](#modul-e--antrean-dokter--manajemen-kunjungan)
10. [Modul F — Rekam Medis](#modul-f--rekam-medis)
11. [Modul G — SOAP Note Terstruktur](#modul-g--soap-note-terstruktur)
12. [Modul H — Diagnosis Klinis & ICD-10](#modul-h--diagnosis-klinis--icd-10)
13. [Modul I — Prosedur Klinis](#modul-i--prosedur-klinis)
14. [Modul J — Odontogram Elektronik](#modul-j--odontogram-elektronik)
15. [Modul K — Keanggotaan (Membership)](#modul-k--keanggotaan-membership)
16. [Modul L — Pembayaran & Simulasi](#modul-l--pembayaran--simulasi)
17. [Modul M — Administrasi Konten](#modul-m--administrasi-konten)
18. [Modul N — Notifikasi](#modul-n--notifikasi)
19. [Modul O — Konsultasi & Pengaduan](#modul-o--konsultasi--pengaduan)
20. [Modul P — Dashboard & Analitik](#modul-p--dashboard--analitik)
21. [Skenario Keamanan Lanjutan](#skenario-keamanan-lanjutan)
22. [Pengujian Responsivitas](#pengujian-responsivitas)
23. [Pengujian UX (Checklist Kegunaan)](#pengujian-ux-checklist-kegunaan)
24. [Alur Kerja Klinik Lengkap — Skenario Dunia Nyata](#alur-kerja-klinik-lengkap--skenario-dunia-nyata)
25. [Template Laporan Bug](#template-laporan-bug)
26. [Checklist Rilis Produksi](#checklist-rilis-produksi)
27. [Glosarium](#glosarium)

---

## 1. Ringkasan Sistem

**Aesthetic Pondok Indah Dental Clinic Management System** adalah aplikasi manajemen klinik gigi berbasis web yang mencakup:

| Komponen | Teknologi | Versi |
|---|---|---|
| Backend Framework | Laravel | 10.x |
| PHP Runtime | PHP | 8.3.33 |
| Database | MySQL | 8.x |
| Frontend Framework | React + TypeScript | — |
| Build Tool | Vite | 7.x |
| Autentikasi | Laravel Sanctum | — |
| File Upload | Lokal / S3 compatible | — |

### Modul Utama yang Diimplementasikan

| Sprint | Fitur Utama |
|---|---|
| Sprint 1 | Autentikasi, Registrasi, Profil Pengguna, Upload |
| Sprint 2 | Manajemen Konten (Blog, Promo, Galeri, Testimoni) |
| Sprint 3 | Reservasi Pasien, Jadwal Dokter, Antrean Konsultasi |
| Sprint 4 | Keanggotaan (Membership), Upgrade Request, Invoice, Simulasi Pembayaran |
| Sprint 5 | Kunjungan (Visit), Rekam Medis, SOAP, Diagnosis, Prosedur Klinis, Odontogram |

---

## 2. Arsitektur Sistem

```
[Pasien / Guest]
    ↓ Akses Web / Mobile
[React Frontend]
    ↓ API Request (Bearer Token)
[Laravel API Backend]
    ↓ Business Logic (Services)
[Repository / Eloquent ORM]
    ↓ Query
[MySQL Database]
```

### Hierarki Data Klinis

```
Pengguna (User)
    └── Reservasi (Reservation)
             └── Kunjungan (Visit)
                      └── Rekam Medis (MedicalRecord) ← Aggregate Root
                               ├── SOAP Note (1:1)
                               ├── Diagnosis (1:N)
                               ├── Prosedur Klinis (1:N)
                               └── Odontogram (1:1)
                                        └── Tooth States (1:32)
```

### Status Rekam Medis

```
draft → in_progress → finalized → locked
                                    ↑
                         (Read-Only, tidak bisa diedit)
```

---

## 3. Kredensial Test & Data Awal

### 3.1 Akun Pengguna Default (Dari Seeder)

| Role | Nama | Email | Password | Tujuan Pengujian |
|---|---|---|---|---|
| **Clinic Admin** | Admin Klinik | `clinic@aestheticpondokindah.local` | `admin123` | Manajemen klinik, reservasi, konten, keanggotaan |
| **Patient (Default)** | Pengguna | `user@aestheticpondokindah.local` | `user123` | Pengujian alur pasien standar |

### 3.2 Akun Dokter (Dari DoctorSeeder)

| Nama Dokter | Email | Password | Spesialisasi |
|---|---|---|---|
| drg. Yulita Dora | `yulita.dora@aestheticpondokindah.local` | `doctor123` | Aesthetic Dentistry (Veneers) |
| drg. Della Sparringa | `della.sparringa@aestheticpondokindah.local` | `doctor123` | Aesthetic & Pediatric Dentistry |
| drg. Ryan Jusuf | `ryan.jusuf@aestheticpondokindah.local` | `doctor123` | Aesthetic & Pediatric Dentistry |
| drg. Nona Lolita T | `nona.lolita@aestheticpondokindah.local` | `doctor123` | Aesthetic Dentistry |
| drg. Melati Putri, Sp. Pros | `melati.putri@aestheticpondokindah.local` | `doctor123` | Prosthodontist, Full Mouth Rehab |
| drg. Shilvy | `shilvy@aestheticpondokindah.local` | `doctor123` | Aesthetic & Pediatric Dentistry |
| drg. Achmad Riwandy | `achmad.riwandy@aestheticpondokindah.local` | `doctor123` | Full Denture, Prosthodontist |
| drg. Ramayani Ramli | `ramayani.ramli@aestheticpondokindah.local` | `doctor123` | Cosmetic Dentistry |
| drg. Sharah Syam, Sp. Ort | `sharah.syam@aestheticpondokindah.local` | `doctor123` | Orthodontist |
| drg. Eric Sulistio, Sp. Perio | `eric.sulistio@aestheticpondokindah.local` | `doctor123` | Periodontist |
| drg. Pramodanti, Sp.KG | `pramodanti.jiwanakusuma@aestheticpondokindah.local` | `doctor123` | Root Canal Treatment |
| drg. Riesta Paluvi, Sp.KG | `riesta.paluvi@aestheticpondokindah.local` | `doctor123` | RCT & Oral Health |
| drg. Yudy Ardila, Sp.BMM | `yudy.ardila@aestheticpondokindah.local` | `doctor123` | Oral Surgeon Consultant |

### 3.3 Akun Test Tambahan (Buat Manual)

Buat akun-akun berikut secara manual melalui form registrasi atau via API sebelum memulai UAT:

| Role | Nama | Email | Password | Tujuan |
|---|---|---|---|---|
| Patient A | Pasien UAT Alpha | `pasien.a@test.local` | `Test@1234` | Pasien utama untuk alur positif |
| Patient B | Pasien UAT Beta | `pasien.b@test.local` | `Test@1234` | Pasien penyerang (uji IDOR) |
| Patient C | Pasien UAT Gamma | `pasien.c@test.local` | `Test@1234` | Uji concurrent access |
| Guest | — | — | — | Akses tanpa login |

### 3.4 Data Wajib Tersedia Sebelum UAT

Pastikan data berikut sudah ada di database:

| Jenis Data | Minimum | Cara Memuat |
|---|---|---|
| Dokter | 13 dokter | `php artisan db:seed --class=DoctorSeeder` |
| Jadwal Dokter | ≥2 jadwal per dokter | `php artisan db:seed --class=DoctorScheduleSeeder` |
| ICD-10 Codes | 8 kode (K02.1, K04.0, K04.1, K05.1, K05.3, K01.1, K00.6, K03.6) | Otomatis dari migrasi 5.4 |
| Procedure Catalog | 6 prosedur (PROC-001 s.d. PROC-006) | Otomatis dari migrasi 5.5 |
| Membership Tiers | Gold, Platinum, Diamond | `php artisan db:seed --class=MembershipSeeder` |
| Blog Posts | ≥3 artikel | `php artisan db:seed --class=ContentSeeder` |
| Promo | ≥2 promo | `php artisan db:seed --class=PromoSeeder` |

### 3.5 Procedure Catalog Reference

| Kode | Nama Prosedur | Kategori |
|---|---|---|
| PROC-001 | Scaling & Root Planing | Preventive |
| PROC-002 | Penambalan Komposit | Restorative |
| PROC-003 | Perawatan Saluran Akar (PSA/RCT) | Endodontic |
| PROC-004 | Pencabutan Gigi | Oral Surgery |
| PROC-005 | Pemasangan Mahkota (Crown) | Prosthodontic |
| PROC-006 | Bleaching / Whitening | Aesthetic |

### 3.6 ICD-10 Code Reference

| Kode | Deskripsi |
|---|---|
| K02.1 | Karies pada dentin |
| K04.0 | Pulpitis |
| K04.1 | Nekrosis pulpa |
| K05.1 | Gingivitis kronis |
| K05.3 | Periodontitis kronis |
| K01.1 | Gigi impaksi |
| K00.6 | Gangguan erupsi gigi |
| K03.6 | Erosi gigi |

---

## 4. Alur Klinik End-to-End

Diagram alur klinis lengkap yang harus dapat dilakukan dari awal hingga akhir oleh penguji:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ALUR KLINIS LENGKAP — AESTHETIC PONDOK INDAH DENTAL CLINIC          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [1] PASIEN REGISTRASI  →  [2] LOGIN  →  [3] LENGKAPI PROFIL       │
│         ↓                                                           │
│  [4] BELI/UPGRADE KEANGGOTAAN  →  [5] BUAT RESERVASI               │
│         ↓                                                           │
│  [6] ADMIN KONFIRMASI RESERVASI                                     │
│         ↓                                                           │
│  [7] DOKTER LIHAT ANTREAN  →  [8] DOKTER MULAI KONSULTASI          │
│         ↓                           ↓                               │
│  [9] KUNJUNGAN DIBUAT  →  [10] REKAM MEDIS OTOMATIS DIBUAT         │
│         ↓                                                           │
│  [11] DOKTER ISI SOAP  →  [12] DOKTER TAMBAH DIAGNOSIS             │
│         ↓                           ↓                               │
│  [13] DOKTER TAMBAH PROSEDUR  →  [14] DOKTER UPDATE ODONTOGRAM     │
│         ↓                                                           │
│  [15] DOKTER FINALISASI REKAM MEDIS                                 │
│         ↓                                                           │
│  [16] DOKTER KUNCI REKAM MEDIS (LOCKED)                             │
│         ↓                                                           │
│  [17] PASIEN LIHAT REKAM MEDIS (Read-Only)                          │
│         ↓                                                           │
│  [18] VERIFIKASI KEAMANAN — IDOR BLOCKED                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Modul A — Autentikasi & Otorisasi

---

### A-001 — Login Berhasil (Admin)

| Field | Detail |
|---|---|
| **ID** | A-001 |
| **Modul** | Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Role Penguji** | QA Engineer |
| **Kredensial** | Email: `clinic@aestheticpondokindah.local` / Password: `admin123` |

**Prasyarat**: Seeder telah dijalankan. Aplikasi berjalan.

**Data Test**: Email dan password dari seeder.

**Langkah-Langkah**:
1. Buka browser, navigasi ke halaman utama aplikasi.
2. Klik tombol **Login**.
3. Masukkan Email: `clinic@aestheticpondokindah.local`.
4. Masukkan Password: `admin123`.
5. Klik tombol **Masuk** / **Login**.

**Hasil yang Diharapkan**:
- Pengguna berhasil login.
- Diarahkan ke halaman **Dashboard Admin Klinik** (Clinic Dashboard).
- Nama pengguna "Admin Klinik" tampil di header/navbar.
- Token autentikasi tersimpan di browser (localStorage atau cookie).
- Tidak ada pesan error.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-002 — Login Berhasil (Dokter)

| Field | Detail |
|---|---|
| **ID** | A-002 |
| **Modul** | Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Role Penguji** | QA Engineer |
| **Kredensial** | Email: `yulita.dora@aestheticpondokindah.local` / Password: `doctor123` |

**Langkah-Langkah**:
1. Buka halaman Login.
2. Masukkan email dan password dokter Yulita Dora.
3. Klik **Login**.

**Hasil yang Diharapkan**:
- Login berhasil.
- Diarahkan ke **Doctor Dashboard**.
- Menampilkan antarmuka khusus dokter (queue, jadwal, medical records).
- Role dokter terdeteksi dengan benar.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-003 — Login Berhasil (Pasien)

| Field | Detail |
|---|---|
| **ID** | A-003 |
| **Modul** | Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Role Penguji** | QA Engineer |
| **Kredensial** | Email: `user@aestheticpondokindah.local` / Password: `user123` |

**Langkah-Langkah**:
1. Buka halaman Login.
2. Masukkan email dan password pasien default.
3. Klik **Login**.

**Hasil yang Diharapkan**:
- Login berhasil.
- Diarahkan ke **User/Patient Dashboard**.
- Menampilkan antarmuka pasien (reservasi, rekam medis, membership).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-004 — Login Gagal — Password Salah

| Field | Detail |
|---|---|
| **ID** | A-004 |
| **Modul** | Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Buka halaman Login.
2. Masukkan Email: `clinic@aestheticpondokindah.local`.
3. Masukkan Password: `password_salah_123`.
4. Klik **Login**.

**Hasil yang Diharapkan**:
- Login **GAGAL**.
- Pesan error ditampilkan: "Email atau password salah" (atau sejenisnya).
- Pengguna **tidak** diarahkan ke dashboard.
- Tidak ada token yang tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-005 — Login Gagal — Email Tidak Terdaftar

| Field | Detail |
|---|---|
| **ID** | A-005 |
| **Modul** | Autentikasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Buka halaman Login.
2. Masukkan Email: `tidakterdaftar@test.com`.
3. Masukkan Password: `apapun123`.
4. Klik **Login**.

**Hasil yang Diharapkan**:
- Login **GAGAL** dengan pesan error yang sesuai.
- Sistem **tidak** mengungkap apakah email terdaftar atau tidak (keamanan).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-006 — Login Gagal — Field Kosong

| Field | Detail |
|---|---|
| **ID** | A-006 |
| **Modul** | Autentikasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Validation Test |

**Langkah-Langkah**:
1. Buka halaman Login.
2. Biarkan Email **kosong**.
3. Biarkan Password **kosong**.
4. Klik **Login**.

**Hasil yang Diharapkan**:
- Validasi frontend mencegah submit.
- Pesan error validasi tampil untuk kedua field.
- Tidak ada request ke server.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-007 — Logout

| Field | Detail |
|---|---|
| **ID** | A-007 |
| **Modul** | Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Pengguna sudah login (akun Admin).

**Langkah-Langkah**:
1. Klik tombol **Logout** / **Keluar** di navbar/menu.
2. Konfirmasi logout (jika ada dialog).

**Hasil yang Diharapkan**:
- Sesi dihancurkan di server (token di-invalidate via Sanctum).
- Pengguna diarahkan ke halaman Login atau Home.
- Mengakses URL dashboard setelah logout menghasilkan redirect ke login (HTTP 401).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-008 — Akses Dashboard tanpa Login

| Field | Detail |
|---|---|
| **ID** | A-008 |
| **Modul** | Otorisasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Permission Test |

**Langkah-Langkah**:
1. Pastikan **tidak ada** sesi aktif (atau gunakan mode Incognito).
2. Coba akses langsung URL Dashboard: `/dashboard`.
3. Coba akses URL Doctor Dashboard: `/doctor/dashboard`.

**Hasil yang Diharapkan**:
- Pengguna **tidak bisa** mengakses halaman dashboard.
- Diarahkan ke halaman Login.
- HTTP Response: 401 Unauthorized atau redirect 302.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-009 — Akses Halaman Admin oleh Pasien (Role Mismatch)

| Field | Detail |
|---|---|
| **ID** | A-009 |
| **Modul** | Otorisasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien (`user@aestheticpondokindah.local`).
2. Coba akses URL admin: `/admin/dashboard` atau `/clinic/dashboard`.
3. Coba akses URL Doctor queue: `/doctor/queue`.

**Hasil yang Diharapkan**:
- Akses **DITOLAK**.
- Tidak ada halaman admin yang tampil untuk pengguna pasien.
- HTTP Response: 403 Forbidden atau redirect.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### A-010 — Akses Halaman Dokter oleh Pasien

| Field | Detail |
|---|---|
| **ID** | A-010 |
| **Modul** | Otorisasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Coba akses API endpoint: `GET /api/doctor/queue`.
3. Coba akses API endpoint: `GET /api/doctor/medical-records`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Respons JSON: `{"message": "Forbidden"}` atau sejenisnya.
- Data dokter tidak terekspos ke pasien.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul B — Registrasi & Profil Pengguna

---

### B-001 — Registrasi Pasien Baru (Happy Path)

| Field | Detail |
|---|---|
| **ID** | B-001 |
| **Modul** | Registrasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Role Penguji** | QA Engineer / Tamu |

**Langkah-Langkah**:
1. Buka halaman utama (Homepage).
2. Klik tombol **Daftar** / **Register**.
3. Isi form registrasi:
   - Nama: `Pasien UAT Alpha`
   - Email: `pasien.a@test.local`
   - WhatsApp: `081200001111`
   - Password: `Test@1234`
   - Konfirmasi Password: `Test@1234`
4. Klik **Daftar**.

**Hasil yang Diharapkan**:
- Akun berhasil dibuat.
- Pengguna langsung login atau diarahkan ke halaman login.
- Role default: `user` / pasien.
- Tidak ada error.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-002 — Registrasi Gagal — Email Sudah Terdaftar

| Field | Detail |
|---|---|
| **ID** | B-002 |
| **Modul** | Registrasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Coba daftar dengan Email yang sudah ada: `user@aestheticpondokindah.local`.
2. Isi field lain dengan data valid.
3. Submit form.

**Hasil yang Diharapkan**:
- Registrasi **GAGAL**.
- Pesan error: "Email sudah digunakan" atau sejenisnya.
- Akun baru **tidak** dibuat.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-003 — Registrasi Gagal — Password Tidak Cocok

| Field | Detail |
|---|---|
| **ID** | B-003 |
| **Modul** | Registrasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Validation Test |

**Langkah-Langkah**:
1. Isi form registrasi dengan Email baru yang valid.
2. Password: `Test@1234`.
3. Konfirmasi Password: `BedaPassword`.
4. Submit.

**Hasil yang Diharapkan**:
- Validasi frontend/backend menolak submit.
- Pesan error: "Password tidak cocok".

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-004 — Lihat Profil Pengguna

| Field | Detail |
|---|---|
| **ID** | B-004 |
| **Modul** | Profil Pengguna |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Profil** / **Akun** / **Settings**.
3. Lihat data profil.

**Hasil yang Diharapkan**:
- Nama, email, dan nomor WhatsApp tampil dengan benar.
- Informasi keanggotaan ditampilkan (level, poin).
- Tidak ada error.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-005 — Edit Profil Pengguna

| Field | Detail |
|---|---|
| **ID** | B-005 |
| **Modul** | Profil Pengguna |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Settings** / **Edit Profil**.
3. Ubah Nama menjadi: `Pengguna Diperbarui`.
4. Ubah Nomor WhatsApp menjadi: `082100002222`.
5. Klik **Simpan** / **Update**.

**Hasil yang Diharapkan**:
- Profil berhasil diperbarui.
- Nama baru tampil di header/navbar.
- Data tersimpan di database.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-006 — Upload Foto Profil

| Field | Detail |
|---|---|
| **ID** | B-006 |
| **Modul** | Profil Pengguna |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Settings** / Edit Profil.
3. Klik area upload foto profil.
4. Pilih file gambar JPEG/PNG (≤2MB).
5. Simpan.

**Hasil yang Diharapkan**:
- Foto berhasil diupload.
- Thumbnail foto baru tampil di profil.
- URL foto tersimpan di database.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-007 — Ubah Password

| Field | Detail |
|---|---|
| **ID** | B-007 |
| **Modul** | Keamanan Akun |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Security** / **Keamanan**.
3. Masukkan Password Lama: `user123`.
4. Masukkan Password Baru: `NewPass@5678`.
5. Konfirmasi Password Baru: `NewPass@5678`.
6. Klik **Simpan**.

**Hasil yang Diharapkan**:
- Password berhasil diubah.
- Session tetap aktif (atau diminta login ulang).
- Login dengan password lama gagal.
- Login dengan password baru berhasil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### B-008 — Ubah Password — Password Lama Salah

| Field | Detail |
|---|---|
| **ID** | B-008 |
| **Modul** | Keamanan Akun |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Security**.
3. Masukkan Password Lama yang **salah**: `password_salah`.
4. Masukkan Password Baru yang valid.
5. Submit.

**Hasil yang Diharapkan**:
- Permintaan **DITOLAK**.
- Pesan error: "Password lama tidak sesuai".
- Password tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul C — Reservasi & Pemesanan

---

### C-001 — Buat Reservasi Baru (Pasien Login)

| Field | Detail |
|---|---|
| **ID** | C-001 |
| **Modul** | Reservasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Role Penguji** | Pasien |
| **Kredensial** | `pasien.a@test.local` / `Test@1234` |

**Prasyarat**: Pasien telah login. Jadwal dokter tersedia.

**Data Test**:
- Dokter: drg. Yulita Dora
- Tanggal: Pilih tanggal yang ada jadwalnya
- Keluhan: "Sakit gigi bagian belakang kanan"

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Navigasi ke halaman **Reservasi** / **Booking**.
3. Pilih dokter: drg. Yulita Dora.
4. Pilih tanggal yang tersedia dari kalender.
5. Pilih waktu/slot yang tersedia.
6. Isi keluhan: "Sakit gigi bagian belakang kanan".
7. Klik **Konfirmasi** / **Buat Reservasi**.

**Hasil yang Diharapkan**:
- Reservasi berhasil dibuat.
- Nomor reservasi ditampilkan (atau dapat dilihat di daftar reservasi).
- Status reservasi: **Menunggu Konfirmasi** / `Menunggu`.
- Notifikasi dikirim (jika fitur notifikasi aktif).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-002 — Buat Reservasi — Guest (Tanpa Login)

| Field | Detail |
|---|---|
| **ID** | C-002 |
| **Modul** | Reservasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Role Penguji** | Tamu/Guest |

**Langkah-Langkah**:
1. Buka halaman utama tanpa login.
2. Navigasi ke form reservasi publik.
3. Isi nama, nomor telepon, keluhan.
4. Pilih dokter dan tanggal.
5. Submit.

**Hasil yang Diharapkan**:
- Reservasi berhasil dibuat tanpa akun.
- Reservasi tersimpan sebagai reservasi guest.
- Konfirmasi tampil di layar.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-003 — Lihat Daftar Reservasi Pasien

| Field | Detail |
|---|---|
| **ID** | C-003 |
| **Modul** | Reservasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `pasien.a@test.local` / `Test@1234` |

**Prasyarat**: Pasien sudah memiliki minimal 1 reservasi.

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Navigasi ke **Riwayat Reservasi** / **Reservasi Saya**.
3. Lihat daftar reservasi.

**Hasil yang Diharapkan**:
- Daftar reservasi tampil dengan benar.
- Hanya reservasi milik Pasien A yang tampil.
- Status setiap reservasi tampil (Menunggu/Dikonfirmasi/Selesai).
- Informasi dokter dan tanggal tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-004 — Batalkan Reservasi

| Field | Detail |
|---|---|
| **ID** | C-004 |
| **Modul** | Reservasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `pasien.a@test.local` / `Test@1234` |

**Prasyarat**: Pasien memiliki reservasi dengan status "Menunggu".

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buka daftar reservasi.
3. Pilih reservasi yang statusnya "Menunggu".
4. Klik **Batalkan** / **Cancel**.
5. Konfirmasi pembatalan.

**Hasil yang Diharapkan**:
- Reservasi berhasil dibatalkan.
- Status berubah menjadi **Dibatalkan**.
- Notifikasi pembatalan muncul.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-005 — Admin Konfirmasi Reservasi

| Field | Detail |
|---|---|
| **ID** | C-005 |
| **Modul** | Reservasi — Admin |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Prasyarat**: Terdapat reservasi dengan status "Menunggu Konfirmasi".

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke menu **Manajemen Reservasi**.
3. Temukan reservasi dari Pasien A.
4. Klik **Konfirmasi** / **Setujui**.
5. Simpan perubahan.

**Hasil yang Diharapkan**:
- Status reservasi berubah menjadi **Dikonfirmasi**.
- Pasien mendapat notifikasi konfirmasi.
- Jadwal dokter terupdate (slot booked bertambah).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-006 — Admin Tolak Reservasi

| Field | Detail |
|---|---|
| **ID** | C-006 |
| **Modul** | Reservasi — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Reservasi**.
3. Pilih reservasi yang masih "Menunggu".
4. Klik **Tolak** / **Reject**.
5. Simpan.

**Hasil yang Diharapkan**:
- Status reservasi berubah menjadi **Ditolak**.
- Reservasi tidak bisa dikonfirmasi ulang.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-007 — IDOR — Pasien Lihat Reservasi Pasien Lain

| Field | Detail |
|---|---|
| **ID** | C-007 |
| **Modul** | Keamanan — Reservasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |
| **Kredensial** | `pasien.b@test.local` / `Test@1234` |

**Prasyarat**: Pasien A memiliki reservasi dengan ID tertentu (misal ID: 5).

**Langkah-Langkah**:
1. Login sebagai **Pasien B** (bukan pemilik reservasi).
2. Coba akses langsung: `GET /api/user/reservations/5` (ID milik Pasien A).

**Hasil yang Diharapkan**:
- Akses **DITOLAK** dengan HTTP 403 Forbidden.
- Data reservasi Pasien A tidak terekspos ke Pasien B.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-008 — Reservasi Duplikat pada Slot yang Sama

| Field | Detail |
|---|---|
| **ID** | C-008 |
| **Modul** | Reservasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Boundary Test |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buat reservasi untuk dokter dan jadwal tertentu.
3. Coba buat reservasi **kedua** untuk dokter dan jadwal yang **sama persis**.

**Hasil yang Diharapkan**:
- Sistem menolak reservasi duplikat (atau menampilkan peringatan slot penuh).
- Error message yang jelas.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### C-009 — Filter dan Pencarian Reservasi (Admin)

| Field | Detail |
|---|---|
| **ID** | C-009 |
| **Modul** | Reservasi — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka halaman **Manajemen Reservasi**.
3. Filter berdasarkan status: "Menunggu".
4. Verifikasi hanya reservasi dengan status tersebut tampil.
5. Filter berdasarkan tanggal tertentu.
6. Cari berdasarkan nama pasien.

**Hasil yang Diharapkan**:
- Filter dan pencarian berfungsi dengan benar.
- Data yang tampil sesuai dengan filter yang dipilih.
- Pagination berfungsi jika data banyak.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul D — Jadwal Dokter

---

### D-001 — Lihat Jadwal Dokter (Publik)

| Field | Detail |
|---|---|
| **ID** | D-001 |
| **Modul** | Jadwal Dokter |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Role Penguji** | Tamu / Guest |

**Langkah-Langkah**:
1. Buka halaman utama tanpa login.
2. Navigasi ke halaman **Dokter** atau **Jadwal Praktik**.
3. Lihat jadwal dokter yang tersedia.

**Hasil yang Diharapkan**:
- Daftar dokter dengan jadwal tampil.
- Informasi: nama dokter, spesialisasi, tanggal, waktu, lokasi.
- Slot yang masih tersedia ditampilkan.
- Tidak diperlukan login untuk melihat jadwal publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### D-002 — Dokter Tambah Jadwal

| Field | Detail |
|---|---|
| **ID** | D-002 |
| **Modul** | Jadwal Dokter |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Langkah-Langkah**:
1. Login sebagai Dokter Yulita Dora.
2. Navigasi ke **Jadwal Saya** / **Manage Schedules**.
3. Klik **Tambah Jadwal** / **Add Schedule**.
4. Pilih tanggal (30 hari ke depan).
5. Pilih rentang waktu: `09.00-11.00`.
6. Pilih lokasi: `Pondok Indah`.
7. Set total slot: 5.
8. Simpan.

**Hasil yang Diharapkan**:
- Jadwal baru berhasil disimpan.
- Jadwal tampil di kalender dokter.
- Jadwal tampil di halaman publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### D-003 — Dokter Edit Jadwal

| Field | Detail |
|---|---|
| **ID** | D-003 |
| **Modul** | Jadwal Dokter |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka jadwal yang sudah ada.
3. Ubah rentang waktu atau lokasi.
4. Simpan.

**Hasil yang Diharapkan**:
- Jadwal berhasil diperbarui.
- Perubahan tampil di halaman publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### D-004 — Dokter Hapus Jadwal

| Field | Detail |
|---|---|
| **ID** | D-004 |
| **Modul** | Jadwal Dokter |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka daftar jadwal.
3. Pilih jadwal yang belum ada pemesanan.
4. Klik **Hapus**.
5. Konfirmasi.

**Hasil yang Diharapkan**:
- Jadwal berhasil dihapus.
- Tidak tampil lagi di kalender publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### D-005 — Admin Lihat Semua Jadwal Dokter

| Field | Detail |
|---|---|
| **ID** | D-005 |
| **Modul** | Jadwal Dokter — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Jadwal Dokter**.
3. Lihat semua jadwal semua dokter.

**Hasil yang Diharapkan**:
- Semua jadwal dokter tampil.
- Bisa difilter per dokter atau per tanggal.
- Informasi slot tersedia/terpakai tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul E — Antrean Dokter & Manajemen Kunjungan

---

### E-001 — Dokter Lihat Antrean Hari Ini

| Field | Detail |
|---|---|
| **ID** | E-001 |
| **Modul** | Antrean Dokter |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Prasyarat**: Terdapat reservasi yang sudah dikonfirmasi untuk dokter Yulita Dora pada hari ini.

**Langkah-Langkah**:
1. Login sebagai Dokter Yulita Dora.
2. Navigasi ke **Antrean** / **Queue** / **Konsultasi Hari Ini**.
3. Lihat daftar pasien yang akan dikonsultasi.

**Hasil yang Diharapkan**:
- Daftar antrean pasien tampil dengan informasi:
  - Nama pasien
  - Waktu reservasi
  - Keluhan
  - Status kunjungan
- Hanya reservasi untuk dokter yang sedang login yang tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### E-002 — Dokter Mulai Konsultasi (Start Visit)

| Field | Detail |
|---|---|
| **ID** | E-002 |
| **Modul** | Kunjungan — Inisiasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Prasyarat**:
- Terdapat reservasi dikonfirmasi untuk dr. Yulita Dora.
- Reservasi tersebut belum dimulai.

**Langkah-Langkah**:
1. Login sebagai Dokter Yulita Dora.
2. Buka halaman **Antrean**.
3. Temukan pasien Pasien A di antrean.
4. Klik **Mulai Konsultasi** / **Start**.

**Hasil yang Diharapkan**:
- **Kunjungan (Visit) otomatis dibuat** dengan nomor format `VST-YYYYMMDD-XXXXXX`.
- **Rekam Medis otomatis dibuat** dengan nomor format `MR-YYYYMMDD-XXXXXX`.
- Status kunjungan: `in_progress`.
- Status Rekam Medis: `draft` atau `in_progress`.
- Dokter diarahkan ke halaman rekam medis pasien.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### E-003 — Dokter Selesaikan Konsultasi

| Field | Detail |
|---|---|
| **ID** | E-003 |
| **Modul** | Kunjungan — Penyelesaian |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Kunjungan dalam status `in_progress`.

**Langkah-Langkah**:
1. Login sebagai Dokter yang memiliki kunjungan aktif.
2. Setelah mengisi rekam medis, klik **Selesaikan** / **Complete Visit**.

**Hasil yang Diharapkan**:
- Status kunjungan berubah menjadi `completed`.
- `completed_at` ter-set otomatis.
- Pasien tidak bisa ditambahkan ke antrean yang sama lagi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### E-004 — Pasien Lihat Riwayat Kunjungan

| Field | Detail |
|---|---|
| **ID** | E-004 |
| **Modul** | Kunjungan — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `pasien.a@test.local` / `Test@1234` |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Navigasi ke **Riwayat Kunjungan** / **Visits**.
3. Lihat daftar kunjungan.

**Hasil yang Diharapkan**:
- Hanya kunjungan milik Pasien A yang tampil.
- Informasi: nomor kunjungan, dokter, tanggal, status.
- Kunjungan yang selesai menampilkan link ke rekam medis.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### E-005 — IDOR — Dokter Lain Lihat Kunjungan Dokter Pertama

| Field | Detail |
|---|---|
| **ID** | E-005 |
| **Modul** | Keamanan — Kunjungan |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Prasyarat**: Dokter A memiliki kunjungan dengan ID tertentu.

**Langkah-Langkah**:
1. Login sebagai **Dokter B** (bukan pemilik kunjungan).
2. Coba akses: `GET /api/doctor/visits/{id_kunjungan_dokter_A}`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Data kunjungan dokter A tidak terekspos.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul F — Rekam Medis

---

### F-001 — Rekam Medis Otomatis Dibuat Saat Konsultasi Dimulai

| Field | Detail |
|---|---|
| **ID** | F-001 |
| **Modul** | Rekam Medis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Dokter memulai konsultasi (Test Case E-002 berhasil).

**Langkah-Langkah**:
1. Setelah E-002 berhasil, periksa apakah rekam medis otomatis dibuat.
2. Cek nomor rekam medis (format `MR-YYYYMMDD-XXXXXX`).
3. Cek status rekam medis.

**Hasil yang Diharapkan**:
- Rekam Medis ada di database dengan `visit_id` yang benar.
- Status: `draft` atau `in_progress`.
- `patient_id` dan `doctor_id` terisi benar.
- Nomor rekam medis unik dan terformat.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-002 — Dokter Lihat Rekam Medis Pasien

| Field | Detail |
|---|---|
| **ID** | F-002 |
| **Modul** | Rekam Medis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Langkah-Langkah**:
1. Login sebagai Dokter Yulita Dora.
2. Navigasi ke **Rekam Medis** / **Medical Records**.
3. Buka rekam medis pasien yang aktif.

**Hasil yang Diharapkan**:
- Detail rekam medis tampil: nomor MR, pasien, dokter, status, tanggal.
- Tabs/section untuk SOAP, Diagnosis, Prosedur, Odontogram tersedia.
- `is_read_only: false` untuk rekam medis yang masih aktif.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-003 — Dokter Finalisasi Rekam Medis

| Field | Detail |
|---|---|
| **ID** | F-003 |
| **Modul** | Rekam Medis — Finalisasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Rekam medis terisi SOAP, Diagnosis, dan Prosedur.

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis yang statusnya `in_progress`.
3. Klik **Finalisasi** / **Finalize Medical Record**.
4. Konfirmasi.

**Hasil yang Diharapkan**:
- Status rekam medis berubah menjadi `finalized`.
- `finalized_at` ter-set dengan timestamp saat ini.
- Rekam medis masih bisa diupdate pada status `finalized` (belum locked).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-004 — Dokter Kunci Rekam Medis (Lock)

| Field | Detail |
|---|---|
| **ID** | F-004 |
| **Modul** | Rekam Medis — Penguncian |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Rekam medis dalam status `finalized`.

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis yang statusnya `finalized`.
3. Klik **Kunci** / **Lock Medical Record**.
4. Konfirmasi.

**Hasil yang Diharapkan**:
- Status rekam medis berubah menjadi `locked`.
- `locked_at` ter-set dengan timestamp.
- `is_read_only: true`.
- Semua sub-entitas (SOAP, Diagnosis, Prosedur, Odontogram) menjadi **read-only**.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-005 — Edit SOAP pada Rekam Medis Terkunci (Blocked)

| Field | Detail |
|---|---|
| **ID** | F-005 |
| **Modul** | Rekam Medis — Read-Only |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Read-Only Test |

**Prasyarat**: Rekam medis dalam status `locked`.

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis yang sudah dikunci.
3. Coba edit SOAP Note.

**Hasil yang Diharapkan**:
- Edit **DITOLAK** dengan HTTP 422 Unprocessable Entity.
- Pesan error: "Rekam medis sudah dikunci" atau sejenisnya.
- Data SOAP tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-006 — Tambah Diagnosis pada Rekam Medis Terkunci (Blocked)

| Field | Detail |
|---|---|
| **ID** | F-006 |
| **Modul** | Rekam Medis — Read-Only |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Read-Only Test |

**Prasyarat**: Rekam medis dalam status `locked`.

**Langkah-Langkah**:
1. Coba tambah diagnosis baru ke rekam medis yang terkunci.

**Hasil yang Diharapkan**:
- HTTP 422 Unprocessable Entity.
- Diagnosis baru tidak ditambahkan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-007 — Tambah Prosedur pada Rekam Medis Terkunci (Blocked)

| Field | Detail |
|---|---|
| **ID** | F-007 |
| **Modul** | Rekam Medis — Read-Only |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Read-Only Test |

**Langkah-Langkah**:
1. Coba tambah prosedur baru ke rekam medis yang terkunci.

**Hasil yang Diharapkan**:
- HTTP 422 Unprocessable Entity.
- Prosedur baru tidak ditambahkan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-008 — Edit Odontogram pada Rekam Medis Terkunci (Blocked)

| Field | Detail |
|---|---|
| **ID** | F-008 |
| **Modul** | Rekam Medis — Read-Only |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Read-Only Test |

**Langkah-Langkah**:
1. Coba update tooth state odontogram pada rekam medis terkunci.

**Hasil yang Diharapkan**:
- HTTP 422 Unprocessable Entity.
- Odontogram tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-009 — Pasien Lihat Rekam Medis Sendiri

| Field | Detail |
|---|---|
| **ID** | F-009 |
| **Modul** | Rekam Medis — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `pasien.a@test.local` / `Test@1234` |

**Prasyarat**: Pasien A memiliki rekam medis yang sudah selesai.

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Navigasi ke **Rekam Medis Saya** / **Medical Records**.
3. Buka rekam medis.
4. Lihat detail: SOAP, Diagnosis, Prosedur, Odontogram.

**Hasil yang Diharapkan**:
- Data rekam medis milik Pasien A tampil lengkap.
- Antarmuka read-only (tidak ada tombol edit).
- SOAP, Diagnosis, Prosedur, Odontogram dapat dilihat.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-010 — IDOR — Pasien B Akses Rekam Medis Pasien A

| Field | Detail |
|---|---|
| **ID** | F-010 |
| **Modul** | Keamanan — Rekam Medis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |
| **Kredensial** | `pasien.b@test.local` / `Test@1234` |

**Prasyarat**: Pasien A memiliki rekam medis dengan ID tertentu.

**Langkah-Langkah**:
1. Login sebagai **Pasien B**.
2. Coba akses: `GET /api/user/medical-records/{id_mr_pasien_A}`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Data rekam medis Pasien A tidak terekspos.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### F-011 — Kunci Rekam Medis yang Belum Final (Blocked)

| Field | Detail |
|---|---|
| **ID** | F-011 |
| **Modul** | Rekam Medis — State Machine |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Prasyarat**: Rekam medis dalam status `draft` atau `in_progress`.

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba langsung mengunci rekam medis (skip finalisasi).

**Hasil yang Diharapkan**:
- Operasi **DITOLAK** dengan error validasi.
- State machine hanya mengizinkan: `finalized` → `locked`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul G — SOAP Note Terstruktur

---

### G-001 — Dokter Buat SOAP Note Baru

| Field | Detail |
|---|---|
| **ID** | G-001 |
| **Modul** | SOAP Note |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Prasyarat**: Rekam medis aktif, status bukan `locked`.

**Data Test**:
- Subjective: "Pasien mengeluhkan sakit gigi belakang kanan sejak 3 hari lalu."
- Objective: "Terdapat karies oklusal pada elemen 46. Nyeri pada perkusi (+)."
- Assessment: "Karies dentin profunda dengan pulpitis reversibel elemen 46."
- Plan: "Penambalan komposit kelas I oklusal elemen 46."

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis pasien yang aktif.
3. Navigasi ke tab **SOAP**.
4. Isi keempat field: Subjective, Objective, Assessment, Plan.
5. Klik **Simpan** / **Save**.

**Hasil yang Diharapkan**:
- SOAP Note berhasil disimpan.
- Revision Number: 1.
- Keempat field tersimpan dengan benar.
- `created_by` = ID dokter yang login.
- Tidak ada error.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### G-002 — Dokter Update SOAP Note (Revision)

| Field | Detail |
|---|---|
| **ID** | G-002 |
| **Modul** | SOAP Note |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: SOAP Note sudah ada (G-001 berhasil).

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis dengan SOAP yang sudah ada.
3. Edit field **Plan**: "Penambalan komposit kelas I oklusal elemen 46, dan konsultasi lanjutan."
4. Klik **Simpan**.

**Hasil yang Diharapkan**:
- SOAP Note berhasil diperbarui.
- **Revision Number bertambah** (dari 1 menjadi 2).
- `updated_by` = ID dokter yang login.
- Field lain tidak berubah.
- Hanya ada 1 SOAP Note per rekam medis (upsert, bukan insert baru).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### G-003 — SOAP Note Hanya Ada 1 per Rekam Medis (1:1)

| Field | Detail |
|---|---|
| **ID** | G-003 |
| **Modul** | SOAP Note — Constraint |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Regression Test |

**Langkah-Langkah**:
1. Periksa database setelah G-002.
2. Hitung jumlah baris di tabel `soap_notes` dengan `medical_record_id` yang sama.

**Hasil yang Diharapkan**:
- Hanya ada **1** baris SOAP Note per `medical_record_id`.
- UNIQUE constraint pada kolom `medical_record_id` aktif.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### G-004 — Pasien Lihat SOAP Note (Read-Only)

| Field | Detail |
|---|---|
| **ID** | G-004 |
| **Modul** | SOAP Note — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buka rekam medis.
3. Lihat SOAP Note.

**Hasil yang Diharapkan**:
- SOAP Note tampil dengan keempat field.
- Tidak ada tombol edit/delete untuk pasien.
- Informasi revision number tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### G-005 — SOAP Note XSS Injection Test

| Field | Detail |
|---|---|
| **ID** | G-005 |
| **Modul** | SOAP Note — Keamanan |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba isi field Subjective dengan: `<script>alert('XSS')</script>`.
3. Simpan.
4. Buka halaman yang menampilkan SOAP Note.

**Hasil yang Diharapkan**:
- Script **tidak** dieksekusi.
- Data tersimpan sebagai plain text (tag HTML di-strip atau di-escape).
- Tidak ada popup JavaScript muncul.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### G-006 — SOAP Note IDOR — Dokter Lain Lihat SOAP

| Field | Detail |
|---|---|
| **ID** | G-006 |
| **Modul** | SOAP Note — Keamanan |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter B.
2. Coba akses: `GET /api/doctor/medical-records/{id_mr_dokter_A}/soap`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- SOAP Note milik pasien Dokter A tidak terekspos ke Dokter B.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul H — Diagnosis Klinis & ICD-10

---

### H-001 — Cari Kode ICD-10

| Field | Detail |
|---|---|
| **ID** | H-001 |
| **Modul** | Diagnosis — ICD-10 |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka form Diagnosis di rekam medis aktif.
3. Ketik di kolom pencarian ICD-10: `K02`.
4. Lihat hasil pencarian.

**Hasil yang Diharapkan**:
- Hasil pencarian muncul dengan kode dan deskripsi.
- Minimal 1 hasil yang mengandung `K02`.
- Pencarian responsif (real-time atau on-submit).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-002 — Tambah Diagnosis Primer

| Field | Detail |
|---|---|
| **ID** | H-002 |
| **Modul** | Diagnosis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Data Test**:
- Nama: "Karies Dentin Profunda Elemen 46"
- Tipe: Primary (Utama)
- ICD-10: K02.1

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis aktif, tab **Diagnosis**.
3. Klik **Tambah Diagnosis**.
4. Isi nama, tipe "Primary", pilih ICD-10 K02.1.
5. Klik **Simpan**.

**Hasil yang Diharapkan**:
- Diagnosis berhasil disimpan.
- Tipe: `primary`.
- ICD-10 Code: `K02.1` tersimpan bersama deskripsinya.
- `doctor_id` = ID dokter yang login.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-003 — Tambah Diagnosis Sekunder

| Field | Detail |
|---|---|
| **ID** | H-003 |
| **Modul** | Diagnosis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Data Test**:
- Nama: "Gingivitis Lokal"
- Tipe: Secondary (Sekunder)
- ICD-10: K05.1

**Langkah-Langkah**:
1. (Lanjutan dari H-002) Klik **Tambah Diagnosis** lagi.
2. Isi nama "Gingivitis Lokal", tipe "Secondary", ICD-10 K05.1.
3. Simpan.

**Hasil yang Diharapkan**:
- Diagnosis sekunder berhasil ditambahkan.
- Rekam medis sekarang memiliki 2 diagnosis.
- Tipe diagnosis utama tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-004 — Duplikasi Diagnosis Diblokir

| Field | Detail |
|---|---|
| **ID** | H-004 |
| **Modul** | Diagnosis — Duplikasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Coba tambah diagnosis dengan nama yang **sama persis** dengan yang sudah ada.
2. Atau coba tambah diagnosis dengan ICD-10 yang **sama** dengan yang sudah ada.
3. Simpan.

**Hasil yang Diharapkan**:
- Sistem **menolak** dengan HTTP 422.
- Pesan: "Diagnosis sudah ada" atau sejenisnya.
- Duplikat tidak tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-005 — Auto-Downgrade Diagnosis Primer

| Field | Detail |
|---|---|
| **ID** | H-005 |
| **Modul** | Diagnosis — Logika Bisnis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Regression Test |

**Langkah-Langkah**:
1. Pastikan sudah ada 1 diagnosis dengan tipe `primary` (dari H-002).
2. Tambah diagnosis baru dengan tipe `primary`.
3. Simpan.

**Hasil yang Diharapkan**:
- Diagnosis baru tersimpan sebagai `primary`.
- Diagnosis `primary` yang lama **otomatis berubah** menjadi `secondary`.
- Hanya ada 1 diagnosis `primary` aktif.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-006 — Edit Diagnosis

| Field | Detail |
|---|---|
| **ID** | H-006 |
| **Modul** | Diagnosis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka daftar diagnosis di rekam medis aktif.
3. Pilih salah satu diagnosis.
4. Edit catatan/notes.
5. Simpan.

**Hasil yang Diharapkan**:
- Diagnosis berhasil diperbarui.
- Field yang tidak diubah tetap sama.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-007 — Hapus Diagnosis

| Field | Detail |
|---|---|
| **ID** | H-007 |
| **Modul** | Diagnosis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka daftar diagnosis di rekam medis aktif.
3. Pilih diagnosis sekunder.
4. Klik **Hapus**.
5. Konfirmasi.

**Hasil yang Diharapkan**:
- Diagnosis berhasil dihapus.
- Tidak tampil lagi di daftar.
- Diagnosis lain tidak terpengaruh.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-008 — Pasien Lihat Daftar Diagnosis

| Field | Detail |
|---|---|
| **ID** | H-008 |
| **Modul** | Diagnosis — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buka rekam medis.
3. Lihat tab Diagnosis.

**Hasil yang Diharapkan**:
- Diagnosis tampil urutan: primer → sekunder → diferensial.
- Kode ICD-10 dan deskripsi tampil.
- Tidak ada tombol edit/delete untuk pasien.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-009 — IDOR — Dokter B Tambah Diagnosis ke Rekam Medis Dokter A

| Field | Detail |
|---|---|
| **ID** | H-009 |
| **Modul** | Keamanan — Diagnosis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter B.
2. Coba `POST /api/doctor/medical-records/{id_mr_dokter_A}/diagnoses`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Diagnosis tidak ditambahkan ke rekam medis Dokter A.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### H-010 — IDOR — Pasien B Lihat Diagnosis Pasien A

| Field | Detail |
|---|---|
| **ID** | H-010 |
| **Modul** | Keamanan — Diagnosis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Pasien B.
2. Coba `GET /api/user/medical-records/{id_mr_pasien_A}/diagnoses`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Data diagnosis Pasien A tidak terekspos.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul I — Prosedur Klinis

---

### I-001 — Cari Katalog Prosedur

| Field | Detail |
|---|---|
| **ID** | I-001 |
| **Modul** | Prosedur Klinis — Katalog |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka form Prosedur.
3. Ketik pencarian: `PROC-002`.
4. Atau ketik: `Komposit`.

**Hasil yang Diharapkan**:
- Hasil pencarian tampil dengan kode, nama, dan kategori prosedur.
- PROC-002 (Penambalan Komposit) ditemukan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-002 — Tambah Prosedur Klinis

| Field | Detail |
|---|---|
| **ID** | I-002 |
| **Modul** | Prosedur Klinis |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Data Test**:
- Katalog Prosedur: PROC-002 (Penambalan Komposit)
- Diagnosis Terkait: Diagnosis Primer dari H-002
- Nomor Gigi: 46
- Status: `completed`
- Catatan: "Penambalan komposit resin kelas I oklusal elemen 46 selesai dikerjakan."

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis aktif, tab **Prosedur**.
3. Klik **Tambah Prosedur**.
4. Pilih PROC-002 dari katalog.
5. Pilih diagnosis terkait.
6. Isi nomor gigi: `46`.
7. Set status: `completed`.
8. Isi catatan.
9. Simpan.

**Hasil yang Diharapkan**:
- Prosedur berhasil disimpan.
- `performed_at` otomatis ter-set (karena status `completed`).
- `performed_by` = ID dokter yang login.
- Nomor gigi tersimpan: 46.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-003 — Tambah Prosedur Kedua (Scaling)

| Field | Detail |
|---|---|
| **ID** | I-003 |
| **Modul** | Prosedur Klinis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Data Test**:
- Katalog: PROC-001 (Scaling & Root Planing)
- Status: `planned`

**Langkah-Langkah**:
1. Tambah prosedur kedua: PROC-001.
2. Set status: `planned`.
3. Simpan.

**Hasil yang Diharapkan**:
- Prosedur kedua berhasil ditambahkan.
- `performed_at` = null (karena status `planned`).
- Rekam medis sekarang memiliki 2 prosedur.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-004 — Update Status Prosedur ke Completed

| Field | Detail |
|---|---|
| **ID** | I-004 |
| **Modul** | Prosedur Klinis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Prasyarat**: Prosedur dengan status `planned` sudah ada (dari I-003).

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka daftar prosedur.
3. Edit prosedur PROC-001 yang `planned`.
4. Ubah status menjadi `completed`.
5. Simpan.

**Hasil yang Diharapkan**:
- Status berubah menjadi `completed`.
- `performed_at` otomatis ter-set saat perubahan status.
- `performed_by` = ID dokter.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-005 — Hapus Prosedur

| Field | Detail |
|---|---|
| **ID** | I-005 |
| **Modul** | Prosedur Klinis |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka daftar prosedur di rekam medis aktif.
3. Hapus salah satu prosedur.
4. Konfirmasi.

**Hasil yang Diharapkan**:
- Prosedur berhasil dihapus.
- Tidak tampil lagi di daftar.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-006 — Prosedur dengan Katalog Tidak Aktif (Blocked)

| Field | Detail |
|---|---|
| **ID** | I-006 |
| **Modul** | Prosedur Klinis — Validasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Nonaktifkan salah satu prosedur di katalog (`active = false`).
2. Coba tambah prosedur dengan katalog yang tidak aktif tersebut.

**Hasil yang Diharapkan**:
- Sistem menolak dengan error validasi.
- Hanya katalog aktif yang bisa digunakan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-007 — Pasien Lihat Daftar Prosedur

| Field | Detail |
|---|---|
| **ID** | I-007 |
| **Modul** | Prosedur Klinis — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buka rekam medis.
3. Lihat tab Prosedur.

**Hasil yang Diharapkan**:
- Daftar prosedur tampil: nama, kode, nomor gigi, status, tanggal dilakukan.
- Tidak ada tombol edit/delete.
- Dokter yang melakukan tampil (nama dokter).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### I-008 — IDOR — Dokter B Hapus Prosedur Dokter A

| Field | Detail |
|---|---|
| **ID** | I-008 |
| **Modul** | Keamanan — Prosedur |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter B.
2. Coba `DELETE /api/doctor/procedures/{id_prosedur_dokter_A}`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Prosedur tidak terhapus.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul J — Odontogram Elektronik

---

### J-001 — Lihat Odontogram (Auto-Create)

| Field | Detail |
|---|---|
| **ID** | J-001 |
| **Modul** | Odontogram |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka rekam medis aktif.
3. Navigasi ke tab **Odontogram**.

**Hasil yang Diharapkan**:
- Odontogram dibuat otomatis jika belum ada.
- Tampilan gigi (FDI notation) terrender.
- Semua gigi dalam kondisi default `normal`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-002 — Update Kondisi Satu Gigi

| Field | Detail |
|---|---|
| **ID** | J-002 |
| **Modul** | Odontogram |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Data Test**:
- Nomor Gigi: `46` (gigi molar pertama kanan bawah)
- Kondisi: `caries`
- Permukaan: `O` (oklusal)

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka tab Odontogram di rekam medis aktif.
3. Klik gigi nomor 46 pada diagram.
4. Pilih kondisi: `caries`.
5. Pilih permukaan: `O`.
6. Simpan.

**Hasil yang Diharapkan**:
- Kondisi gigi 46 berhasil diperbarui menjadi `caries`.
- Tampilan diagram odontogram menunjukkan gigi 46 dengan warna/simbol karies.
- Data tersimpan di database.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-003 — Update Kondisi Beberapa Gigi Sekaligus (Bulk)

| Field | Detail |
|---|---|
| **ID** | J-003 |
| **Modul** | Odontogram — Bulk |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Data Test**:
- Gigi 36: kondisi `missing`
- Gigi 11: kondisi `crown`
- Gigi 21: kondisi `normal`

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Buka Odontogram.
3. Update beberapa gigi sekaligus menggunakan fitur bulk update.
4. Simpan semua.

**Hasil yang Diharapkan**:
- Semua gigi berhasil diperbarui dalam satu operasi atomik.
- Jika satu gagal, semua di-rollback (transaksi database).
- Semua perubahan tersimpan dengan benar.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-004 — Validasi Nomor Gigi FDI Tidak Valid

| Field | Detail |
|---|---|
| **ID** | J-004 |
| **Modul** | Odontogram — Validasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Validation Test |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba update gigi dengan nomor di luar standar FDI: `99`.

**Hasil yang Diharapkan**:
- Sistem menolak dengan HTTP 422.
- Pesan error: "Nomor gigi tidak valid" atau sejenisnya.
- Hanya gigi 11-48 (permanen) dan 51-85 (sulung) yang diterima.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-005 — Validasi Kondisi Gigi Tidak Valid

| Field | Detail |
|---|---|
| **ID** | J-005 |
| **Modul** | Odontogram — Validasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Validation Test |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba update kondisi gigi dengan nilai tidak valid: `kondisi_aneh`.

**Hasil yang Diharapkan**:
- Sistem menolak dengan HTTP 422.
- Kondisi yang valid: `normal`, `caries`, `restoration`, `missing`, `crown`, `root_canal`, `bridge`, `implant`, `fracture`, `sealant`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-006 — Odontogram 1:1 per Rekam Medis

| Field | Detail |
|---|---|
| **ID** | J-006 |
| **Modul** | Odontogram — Constraint |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Regression Test |

**Langkah-Langkah**:
1. Setelah J-002 berhasil, periksa database.
2. Hitung jumlah baris di tabel `odontograms` dengan `medical_record_id` yang sama.

**Hasil yang Diharapkan**:
- Hanya ada **1** baris odontogram per rekam medis.
- UNIQUE constraint aktif pada `medical_record_id`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-007 — Satu Nomor Gigi per Odontogram

| Field | Detail |
|---|---|
| **ID** | J-007 |
| **Modul** | Odontogram — Constraint |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Regression Test |

**Langkah-Langkah**:
1. Update gigi 46 dua kali berturut-turut dengan kondisi berbeda.
2. Periksa database — hitung baris di `tooth_states` dengan gigi yang sama.

**Hasil yang Diharapkan**:
- Hanya ada **1** baris per kombinasi `(odontogram_id, tooth_number)`.
- Update kedua meng-overwrite data pertama (upsert).
- Composite UNIQUE constraint aktif.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-008 — Pasien Lihat Odontogram

| Field | Detail |
|---|---|
| **ID** | J-008 |
| **Modul** | Odontogram — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien A.
2. Buka rekam medis.
3. Lihat tab Odontogram.

**Hasil yang Diharapkan**:
- Diagram odontogram tampil dalam mode read-only.
- Kondisi gigi yang sudah diisi dokter tampil dengan benar.
- Tidak ada tombol edit untuk pasien.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-009 — IDOR — Dokter B Edit Odontogram Dokter A

| Field | Detail |
|---|---|
| **ID** | J-009 |
| **Modul** | Keamanan — Odontogram |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter B.
2. Coba `POST /api/doctor/medical-records/{id_mr_dokter_A}/odontogram/tooth`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Odontogram tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### J-010 — IDOR — Pasien B Lihat Odontogram Pasien A

| Field | Detail |
|---|---|
| **ID** | J-010 |
| **Modul** | Keamanan — Odontogram |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Pasien B.
2. Coba `GET /api/user/medical-records/{id_mr_pasien_A}/odontogram`.

**Hasil yang Diharapkan**:
- HTTP 403 Forbidden.
- Data odontogram Pasien A tidak terekspos.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul K — Keanggotaan (Membership)

---

### K-001 — Lihat Tier Keanggotaan (Publik)

| Field | Detail |
|---|---|
| **ID** | K-001 |
| **Modul** | Keanggotaan |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Buka halaman **Membership** tanpa login.
2. Lihat informasi level keanggotaan.

**Hasil yang Diharapkan**:
- Informasi level Gold, Platinum, Diamond tampil.
- Manfaat setiap level dijelaskan.
- Tidak diperlukan login untuk melihat informasi tier.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-002 — Lihat Status Keanggotaan Pasien

| Field | Detail |
|---|---|
| **ID** | K-002 |
| **Modul** | Keanggotaan — Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Membership** / **Keanggotaan Saya**.
3. Lihat level, status, dan poin.

**Hasil yang Diharapkan**:
- Level keanggotaan tampil (Gold/Platinum/Diamond).
- Poin keanggotaan tampil.
- Tanggal mulai dan berakhir keanggotaan tampil.
- Status: Active.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-003 — Request Upgrade Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-003 |
| **Modul** | Keanggotaan — Upgrade |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Prasyarat**: Pasien belum di level tertinggi.

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Upgrade Keanggotaan**.
3. Lihat opsi upgrade yang tersedia.
4. Pilih level yang lebih tinggi.
5. Klik **Ajukan Upgrade**.

**Hasil yang Diharapkan**:
- Request upgrade berhasil diajukan.
- Status request: `pending`.
- Admin mendapat notifikasi/bisa melihat request di dashboard.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-004 — Admin Setujui Upgrade Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-004 |
| **Modul** | Keanggotaan — Admin |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Prasyarat**: Request upgrade dari K-003 sudah ada.

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Keanggotaan** → **Upgrade Request**.
3. Temukan request dari pasien.
4. Klik **Setujui** / **Approve**.
5. Invoice otomatis dibuat.

**Hasil yang Diharapkan**:
- Request disetujui.
- Invoice pembayaran otomatis dibuat.
- Status request berubah menjadi `approved`.
- Pasien mendapat notifikasi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-005 — Admin Tolak Upgrade Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-005 |
| **Modul** | Keanggotaan — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Admin membuka upgrade request yang pending.
2. Klik **Tolak** / **Reject**.
3. Isi alasan penolakan.
4. Konfirmasi.

**Hasil yang Diharapkan**:
- Request ditolak.
- Status request: `rejected`.
- Pasien mendapat notifikasi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-006 — Admin Update Level Keanggotaan Manual

| Field | Detail |
|---|---|
| **ID** | K-006 |
| **Modul** | Keanggotaan — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka detail keanggotaan pasien tertentu.
3. Ubah level secara manual (PATCH `/api/admin/membership/{id}/level`).
4. Simpan.

**Hasil yang Diharapkan**:
- Level keanggotaan berhasil diperbarui.
- History perubahan level tercatat.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-007 — Admin Update Poin Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-007 |
| **Modul** | Keanggotaan — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka detail keanggotaan pasien.
3. Perbarui poin (PATCH `/api/admin/membership/{id}/points`).

**Hasil yang Diharapkan**:
- Poin berhasil diperbarui.
- Saldo poin pasien terupdate.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-008 — Pasien Tukar Poin

| Field | Detail |
|---|---|
| **ID** | K-008 |
| **Modul** | Keanggotaan — Poin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien (pastikan memiliki poin).
2. Navigasi ke halaman tukar poin.
3. Masukkan jumlah poin yang ingin ditukar.
4. Konfirmasi.

**Hasil yang Diharapkan**:
- Poin berhasil ditukarkan.
- Saldo poin berkurang sesuai yang ditukar.
- Catatan redeem tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-009 — Lihat Riwayat Transaksi Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-009 |
| **Modul** | Keanggotaan — Riwayat |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke riwayat transaksi keanggotaan.

**Hasil yang Diharapkan**:
- Daftar transaksi tampil dengan tanggal, jumlah, dan tipe.
- Riwayat upgrade level tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### K-010 — Admin Lihat Distribusi Level Keanggotaan

| Field | Detail |
|---|---|
| **ID** | K-010 |
| **Modul** | Keanggotaan — Analitik |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Analitik Keanggotaan** / membership analytics.
3. Lihat distribusi level (Gold/Platinum/Diamond).

**Hasil yang Diharapkan**:
- Data distribusi level tampil (angka atau grafik).
- Informasi sesuai dengan data di database.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul L — Pembayaran & Simulasi

---

### L-001 — Lihat Invoice

| Field | Detail |
|---|---|
| **ID** | L-001 |
| **Modul** | Pembayaran — Invoice |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Prasyarat**: Invoice sudah dibuat (dari K-004).

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke halaman **Pembayaran** / **Invoice**.
3. Lihat daftar invoice.

**Hasil yang Diharapkan**:
- Invoice tampil dengan detail: nomor, jumlah, status, tanggal.
- Status invoice: `unpaid` atau `pending`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-002 — Simulasi Pembayaran Berhasil (Settlement)

| Field | Detail |
|---|---|
| **ID** | L-002 |
| **Modul** | Pembayaran — Simulasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Prasyarat**: Invoice dengan status unpaid tersedia.

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Buka invoice yang belum dibayar.
3. Klik **Bayar** / **Pay Now**.
4. Sistem mengarahkan ke simulasi pembayaran.
5. Klik **Simulate Settlement** / **Bayar Berhasil**.

**Hasil yang Diharapkan**:
- Pembayaran berhasil diproses.
- Status invoice berubah menjadi `paid` / `settlement`.
- **Keanggotaan otomatis diaktifkan/diupgrade** setelah pembayaran berhasil.
- Level keanggotaan pasien terupdate.
- Riwayat transaksi tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-003 — Simulasi Pembayaran Gagal (Deny)

| Field | Detail |
|---|---|
| **ID** | L-003 |
| **Modul** | Pembayaran — Simulasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Buka invoice yang belum dibayar.
2. Klik **Simulate Deny** / **Simulasi Gagal**.

**Hasil yang Diharapkan**:
- Status pembayaran: `deny` / `failed`.
- Keanggotaan **tidak** diupgrade.
- Pasien bisa mencoba pembayaran lagi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-004 — Simulasi Pembayaran Kedaluwarsa (Expire)

| Field | Detail |
|---|---|
| **ID** | L-004 |
| **Modul** | Pembayaran — Simulasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Buka invoice aktif.
2. Klik **Simulate Expire** / **Kedaluwarsa**.

**Hasil yang Diharapkan**:
- Status pembayaran: `expire`.
- Invoice tidak bisa dibayar setelah expire.
- Keanggotaan tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-005 — Simulasi Pembayaran Dibatalkan (Cancel)

| Field | Detail |
|---|---|
| **ID** | L-005 |
| **Modul** | Pembayaran — Simulasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Negative Test |

**Langkah-Langkah**:
1. Buka invoice aktif.
2. Klik **Simulate Cancel** / **Batalkan**.

**Hasil yang Diharapkan**:
- Status pembayaran: `cancel`.
- Keanggotaan tidak berubah.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-006 — Cek Status Pembayaran

| Field | Detail |
|---|---|
| **ID** | L-006 |
| **Modul** | Pembayaran |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Buka halaman pembayaran.
3. Lihat status transaksi saat ini.

**Hasil yang Diharapkan**:
- Status transaksi tampil dengan jelas.
- Riwayat semua transaksi tersedia.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### L-007 — Admin Lihat Semua Invoice

| Field | Detail |
|---|---|
| **ID** | L-007 |
| **Modul** | Pembayaran — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Invoice** / `/api/admin/membership/invoices`.
3. Lihat semua invoice dari semua pasien.

**Hasil yang Diharapkan**:
- Semua invoice tampil dengan detail lengkap.
- Bisa difilter berdasarkan status (paid/unpaid).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul M — Administrasi Konten

---

### M-001 — Lihat Blog/Artikel (Publik)

| Field | Detail |
|---|---|
| **ID** | M-001 |
| **Modul** | Blog |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Buka halaman **Blog** tanpa login.
2. Lihat daftar artikel.
3. Klik salah satu artikel.

**Hasil yang Diharapkan**:
- Daftar artikel tampil.
- Detail artikel tampil dengan konten lengkap.
- Tidak diperlukan login.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-002 — Admin Buat Artikel Blog

| Field | Detail |
|---|---|
| **ID** | M-002 |
| **Modul** | Blog — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Konten** → **Blog**.
3. Klik **Tambah Artikel**.
4. Isi judul, konten, slug, dan gambar thumbnail.
5. Simpan.

**Hasil yang Diharapkan**:
- Artikel berhasil dibuat.
- Tampil di halaman publik Blog.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-003 — Admin Buat Promo

| Field | Detail |
|---|---|
| **ID** | M-003 |
| **Modul** | Promo — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Promo**.
3. Tambah promo baru.
4. Simpan.

**Hasil yang Diharapkan**:
- Promo berhasil dibuat.
- Tampil di halaman publik Promo.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-004 — Admin Klaim Promo untuk Pasien

| Field | Detail |
|---|---|
| **ID** | M-004 |
| **Modul** | Promo — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Cari pasien melalui `/api/admin/users/search`.
3. Klaim promo untuk pasien tersebut.

**Hasil yang Diharapkan**:
- Promo berhasil diklaim untuk pasien.
- Riwayat klaim tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-005 — Admin Manajemen Galeri

| Field | Detail |
|---|---|
| **ID** | M-005 |
| **Modul** | Galeri — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Galeri**.
3. Upload gambar baru.
4. Simpan.
5. Verifikasi di halaman publik galeri.

**Hasil yang Diharapkan**:
- Gambar berhasil diupload.
- Tampil di galeri publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-006 — Admin Manajemen Testimoni

| Field | Detail |
|---|---|
| **ID** | M-006 |
| **Modul** | Testimoni — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Tambah testimoni baru.
3. Simpan.

**Hasil yang Diharapkan**:
- Testimoni berhasil ditambah.
- Tampil di halaman publik (jika ada).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-007 — Admin Manajemen Popup

| Field | Detail |
|---|---|
| **ID** | M-007 |
| **Modul** | Popup — Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Tambah popup aktif baru dengan gambar dan periode tampil.
3. Buka halaman publik.

**Hasil yang Diharapkan**:
- Popup tampil saat halaman dibuka.
- Hanya popup aktif yang tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-008 — Admin Manajemen Dokter

| Field | Detail |
|---|---|
| **ID** | M-008 |
| **Modul** | Dokter — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Navigasi ke **Manajemen Dokter**.
3. Tambah dokter baru dengan nama, email, password, dan spesialisasi.
4. Simpan.

**Hasil yang Diharapkan**:
- Dokter baru berhasil dibuat.
- Dokter bisa login dengan kredensial yang dibuat.
- Profil dokter tampil di halaman publik.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-009 — Admin Reset Password Dokter

| Field | Detail |
|---|---|
| **ID** | M-009 |
| **Modul** | Dokter — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka daftar dokter.
3. Pilih dokter.
4. Klik **Reset Password**.
5. Masukkan password baru.

**Hasil yang Diharapkan**:
- Password dokter berhasil direset.
- Dokter bisa login dengan password baru.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### M-010 — Upload File/Gambar

| Field | Detail |
|---|---|
| **ID** | M-010 |
| **Modul** | Upload — Umum |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Gunakan fitur upload file (`POST /api/upload`).
3. Upload file gambar JPEG/PNG ≤2MB.

**Hasil yang Diharapkan**:
- File berhasil diupload.
- URL file dikembalikan dalam respons.
- File dapat diakses melalui URL yang diberikan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul N — Notifikasi

---

### N-001 — Lihat Daftar Notifikasi

| Field | Detail |
|---|---|
| **ID** | N-001 |
| **Modul** | Notifikasi |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Klik ikon notifikasi di navbar.
3. Lihat daftar notifikasi.

**Hasil yang Diharapkan**:
- Daftar notifikasi tampil.
- Notifikasi yang belum dibaca ditandai berbeda.
- Unread count tampil di badge.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### N-002 — Tandai Semua Notifikasi Dibaca

| Field | Detail |
|---|---|
| **ID** | N-002 |
| **Modul** | Notifikasi |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien (pastikan ada notifikasi belum dibaca).
2. Klik **Tandai Semua Dibaca** / **Mark All as Read**.

**Hasil yang Diharapkan**:
- Semua notifikasi ditandai dibaca.
- Unread count berubah menjadi 0.
- Badge notifikasi hilang atau menunjukkan 0.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### N-003 — Hapus Notifikasi Individual

| Field | Detail |
|---|---|
| **ID** | N-003 |
| **Modul** | Notifikasi |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Buka daftar notifikasi.
3. Klik **Hapus** pada salah satu notifikasi.

**Hasil yang Diharapkan**:
- Notifikasi berhasil dihapus.
- Notifikasi tidak tampil lagi dalam daftar.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### N-004 — Bersihkan Semua Notifikasi

| Field | Detail |
|---|---|
| **ID** | N-004 |
| **Modul** | Notifikasi |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Klik **Hapus Semua** / **Clear All**.
3. Konfirmasi.

**Hasil yang Diharapkan**:
- Semua notifikasi dihapus.
- Daftar notifikasi kosong.
- Unread count = 0.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### N-005 — Cek Jumlah Notifikasi Belum Dibaca

| Field | Detail |
|---|---|
| **ID** | N-005 |
| **Modul** | Notifikasi |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Lihat badge notifikasi di navbar.
3. Buka notifikasi, tandai satu dibaca.
4. Badge berkurang.

**Hasil yang Diharapkan**:
- Badge menampilkan jumlah yang benar.
- Berkurang saat notifikasi dibaca.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul O — Konsultasi & Pengaduan

---

### O-001 — Pasien Ajukan Konsultasi

| Field | Detail |
|---|---|
| **ID** | O-001 |
| **Modul** | Konsultasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke **Konsultasi Online** / **Ask a Doctor**.
3. Isi pertanyaan konsultasi.
4. Submit.

**Hasil yang Diharapkan**:
- Konsultasi berhasil diajukan.
- Status: `pending`.
- Dokter/Admin dapat melihat konsultasi baru.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### O-002 — Dokter Balas Konsultasi

| Field | Detail |
|---|---|
| **ID** | O-002 |
| **Modul** | Konsultasi |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Prasyarat**: Konsultasi dari O-001 tersedia.

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Navigasi ke **Konsultasi** / **Inbox**.
3. Buka konsultasi dari pasien.
4. Isi jawaban.
5. Simpan.

**Hasil yang Diharapkan**:
- Jawaban berhasil disimpan.
- Status konsultasi berubah menjadi `answered`.
- Pasien dapat melihat jawaban.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### O-003 — Pasien Ajukan Pengaduan

| Field | Detail |
|---|---|
| **ID** | O-003 |
| **Modul** | Pengaduan |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Navigasi ke **Pengaduan** / **Complaints**.
3. Isi judul dan isi pengaduan.
4. Submit.

**Hasil yang Diharapkan**:
- Pengaduan berhasil diajukan.
- Status: `open` / `pending`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### O-004 — Admin Proses Pengaduan

| Field | Detail |
|---|---|
| **ID** | O-004 |
| **Modul** | Pengaduan — Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka daftar pengaduan.
3. Buka pengaduan dari O-003.
4. Update status dan tambah tanggapan.

**Hasil yang Diharapkan**:
- Status pengaduan diperbarui.
- Tanggapan tersimpan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Modul P — Dashboard & Analitik

---

### P-001 — Dashboard Admin — Ringkasan Analitik

| Field | Detail |
|---|---|
| **ID** | P-001 |
| **Modul** | Dashboard Admin |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `clinic@aestheticpondokindah.local` / `admin123` |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Buka halaman **Dashboard** / **Clinic Dashboard**.
3. Lihat ringkasan analitik.

**Hasil yang Diharapkan**:
- Statistik tampil: total pasien, reservasi hari ini, pendapatan, dll.
- Data relevan dan terkini.
- Grafik/chart tampil (jika ada).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### P-002 — Dashboard Dokter

| Field | Detail |
|---|---|
| **ID** | P-002 |
| **Modul** | Dashboard Dokter |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `yulita.dora@aestheticpondokindah.local` / `doctor123` |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Lihat Dashboard Dokter.

**Hasil yang Diharapkan**:
- Antrean hari ini tampil.
- Statistik kunjungan dokter tampil.
- Jadwal praktik tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### P-003 — Dashboard Pasien

| Field | Detail |
|---|---|
| **ID** | P-003 |
| **Modul** | Dashboard Pasien |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Happy Path |
| **Kredensial** | `user@aestheticpondokindah.local` / `user123` |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Lihat Dashboard Pasien / User Dashboard.

**Hasil yang Diharapkan**:
- Info keanggotaan tampil (level, poin).
- Reservasi mendatang tampil.
- Riwayat kunjungan singkat tampil.
- Notifikasi terbaru tampil.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### P-004 — Analitik Admin — Summary

| Field | Detail |
|---|---|
| **ID** | P-004 |
| **Modul** | Analitik Admin |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Happy Path |

**Langkah-Langkah**:
1. Login sebagai Admin.
2. Akses analitik summary: `GET /api/admin/analytics/summary`.

**Hasil yang Diharapkan**:
- Data summary dikembalikan.
- Format data valid (JSON).

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Skenario Keamanan Lanjutan

---

### SEC-001 — Brute Force Login

| Field | Detail |
|---|---|
| **ID** | SEC-001 |
| **Modul** | Keamanan — Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Coba login dengan email yang sama 10 kali berturut-turut dengan password salah.
2. Perhatikan respons sistem.

**Hasil yang Diharapkan**:
- Tidak ada informasi sensitif yang terekspos.
- (Opsional) Rate limiting diterapkan setelah beberapa percobaan gagal.
- Respons error konsisten.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-002 — SQL Injection pada Form Login

| Field | Detail |
|---|---|
| **ID** | SEC-002 |
| **Modul** | Keamanan — Injeksi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Pada form login, masukkan di field Email: `' OR '1'='1`.
2. Masukkan password sembarang.
3. Submit.

**Hasil yang Diharapkan**:
- Login **GAGAL**.
- Sistem **tidak** terpengaruh oleh injeksi SQL.
- Laravel Eloquent menggunakan prepared statements secara default.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-003 — XSS pada Form Reservasi

| Field | Detail |
|---|---|
| **ID** | SEC-003 |
| **Modul** | Keamanan — XSS |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Buat reservasi dengan field keluhan berisi: `<img src=x onerror=alert('XSS')>`.
3. Buka halaman yang menampilkan keluhan ini (misalnya di dashboard Admin).

**Hasil yang Diharapkan**:
- Script/HTML tidak dieksekusi.
- Teks tampil sebagai plain text atau di-escape.
- Tidak ada popup JavaScript.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-004 — Token Tidak Valid / Kadaluarsa

| Field | Detail |
|---|---|
| **ID** | SEC-004 |
| **Modul** | Keamanan — Sesi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Ambil token yang valid saat login.
2. Logout (token di-revoke).
3. Coba gunakan token lama untuk mengakses API: `GET /api/auth/me`.

**Hasil yang Diharapkan**:
- HTTP 401 Unauthorized.
- Token yang sudah di-revoke tidak bisa digunakan lagi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-005 — Akses API tanpa Token

| Field | Detail |
|---|---|
| **ID** | SEC-005 |
| **Modul** | Keamanan — Autentikasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Tanpa token (atau tanpa header Authorization).
2. Coba akses: `GET /api/user/medical-records`.
3. Coba akses: `GET /api/doctor/queue`.

**Hasil yang Diharapkan**:
- HTTP 401 Unauthorized.
- Tidak ada data yang dikembalikan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-006 — Mass Assignment Attack

| Field | Detail |
|---|---|
| **ID** | SEC-006 |
| **Modul** | Keamanan — Model |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Pasien.
2. Coba update profil dengan menambahkan field `role: "clinic_admin"` dalam body request.
3. Lihat hasilnya.

**Hasil yang Diharapkan**:
- Field `role` tidak berubah.
- Laravel `$fillable` melindungi model dari mass assignment.
- Role pasien tetap `user`.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-007 — IDOR Lengkap — Rekam Medis

| Field | Detail |
|---|---|
| **ID** | SEC-007 |
| **Modul** | Keamanan — IDOR |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Pasien B login.
2. Coba akses semua endpoint rekam medis Pasien A:
   - `GET /api/user/medical-records/{id_pasien_A}`
   - `GET /api/user/medical-records/{id}/soap`
   - `GET /api/user/medical-records/{id}/diagnoses`
   - `GET /api/user/medical-records/{id}/procedures`
   - `GET /api/user/medical-records/{id}/odontogram`

**Hasil yang Diharapkan**:
- Semua endpoint mengembalikan HTTP 403 Forbidden.
- Tidak ada data medis Pasien A yang terekspos ke Pasien B.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-008 — IDOR Dokter ke Dokter Lain

| Field | Detail |
|---|---|
| **ID** | SEC-008 |
| **Modul** | Keamanan — IDOR |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Dokter B login.
2. Coba akses rekam medis milik pasien Dokter A:
   - `POST /api/doctor/medical-records/{id_mr_dokter_A}/soap`
   - `POST /api/doctor/medical-records/{id_mr_dokter_A}/diagnoses`
   - `POST /api/doctor/medical-records/{id_mr_dokter_A}/procedures`
   - `POST /api/doctor/medical-records/{id_mr_dokter_A}/odontogram/tooth`

**Hasil yang Diharapkan**:
- Semua endpoint mengembalikan HTTP 403 Forbidden.
- Tidak ada data yang ditulis ke rekam medis Dokter A.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-009 — Validasi Input Negatif — Field yang Wajib Kosong

| Field | Detail |
|---|---|
| **ID** | SEC-009 |
| **Modul** | Validasi Input |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Validation Test |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba buat diagnosis tanpa field `name`.
3. Coba buat prosedur tanpa `procedure_catalog_id`.
4. Coba buat reservasi tanpa memilih dokter atau tanggal.

**Hasil yang Diharapkan**:
- Setiap request mengembalikan HTTP 422 dengan pesan validasi yang jelas.
- Data tidak tersimpan tanpa field wajib.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### SEC-010 — Akses Endpoint Admin oleh Dokter

| Field | Detail |
|---|---|
| **ID** | SEC-010 |
| **Modul** | Keamanan — Otorisasi |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Security Test |

**Langkah-Langkah**:
1. Login sebagai Dokter.
2. Coba akses: `GET /api/admin/users`.
3. Coba akses: `GET /api/admin/membership`.
4. Coba akses: `PATCH /api/admin/membership/{id}/level`.

**Hasil yang Diharapkan**:
- Semua endpoint mengembalikan HTTP 403 Forbidden.
- Data admin tidak terekspos ke dokter.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Pengujian Responsivitas

---

### RESP-001 — Tampilan Desktop (1920×1080)

| Field | Detail |
|---|---|
| **ID** | RESP-001 |
| **Modul** | UI Responsif |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Responsiveness Test |

**Perangkat**: Desktop browser, resolusi 1920×1080  
**Browser**: Chrome/Firefox/Edge versi terbaru

**Halaman yang Diuji**:
- [ ] Halaman Home
- [ ] Halaman Dokter
- [ ] Halaman Blog
- [ ] Halaman Login
- [ ] Dashboard Admin (Clinic Dashboard)
- [ ] Dashboard Dokter
- [ ] Dashboard Pasien
- [ ] Halaman Rekam Medis
- [ ] Halaman Odontogram

**Hasil yang Diharapkan**:
- Layout tidak overflow.
- Semua elemen terlihat dan dapat diklik.
- Teks terbaca dengan baik.
- Gambar proporsional.
- Navbar/sidebar tampil sepenuhnya.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-002 — Tampilan Laptop (1366×768)

| Field | Detail |
|---|---|
| **ID** | RESP-002 |
| **Modul** | UI Responsif |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Responsiveness Test |

**Perangkat**: Laptop browser, resolusi 1366×768

**Halaman yang Diuji**:
- [ ] Semua halaman utama seperti RESP-001

**Hasil yang Diharapkan**:
- Tidak ada elemen yang terpotong.
- Tabel dengan banyak kolom dapat discroll horizontal.
- Sidebar dapat di-collapse jika diperlukan.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-003 — Tampilan Tablet (768×1024 — iPad)

| Field | Detail |
|---|---|
| **ID** | RESP-003 |
| **Modul** | UI Responsif |
| **Prioritas** | 🟡 Tinggi |
| **Tipe** | Responsiveness Test |

**Perangkat**: iPad atau emulator tablet, resolusi 768×1024

**Halaman yang Diuji**:
- [ ] Halaman Home
- [ ] Halaman Booking (Mobile Booking)
- [ ] Dashboard Pasien (User Dashboard)
- [ ] Halaman Login

**Hasil yang Diharapkan**:
- Layout berubah ke mode tablet (2-kolom atau adaptive).
- Navigasi mobile tampil (hamburger menu atau bottom nav).
- Form dapat diisi dengan mudah.
- Tombol cukup besar untuk diklik dengan jari.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-004 — Tampilan Mobile Android (360×800)

| Field | Detail |
|---|---|
| **ID** | RESP-004 |
| **Modul** | UI Responsif |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Responsiveness Test |

**Perangkat**: Android phone browser atau emulator, 360×800

**Halaman yang Diuji**:
- [ ] Mobile Home (MobileHome)
- [ ] Mobile Login (MobileLogin)
- [ ] Mobile Booking (MobileBooking + MobileBookingDoctor + MobileBookingSchedule + MobileBookingConfirm)
- [ ] Mobile Riwayat (MobileRiwayat)
- [ ] Mobile Akun (MobileAkun)
- [ ] Mobile Konsultasi (MobileKonsultasi)

**Hasil yang Diharapkan**:
- Halaman mobile khusus (MobileXxx) tampil.
- Bottom navigation bar tampil dan berfungsi.
- Scroll vertikal mulus.
- Input field dapat diketik dengan keyboard mobile.
- Tidak ada horizontal scroll yang tidak disengaja.
- Gambar dan ikon proporsional.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-005 — Tampilan Mobile iPhone (375×812 — iPhone X)

| Field | Detail |
|---|---|
| **ID** | RESP-005 |
| **Modul** | UI Responsif |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Responsiveness Test |

**Perangkat**: iPhone X atau emulator (375×812), Safari browser

**Halaman yang Diuji**:
- [ ] Semua halaman mobile seperti RESP-004

**Hasil yang Diharapkan**:
- Tidak ada elemen yang tertutup oleh notch/home indicator.
- Safari rendering konsisten dengan Chrome.
- Touch events berfungsi.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-006 — Mode Landscape Mobile

| Field | Detail |
|---|---|
| **ID** | RESP-006 |
| **Modul** | UI Responsif |
| **Prioritas** | 🟢 Normal |
| **Tipe** | Responsiveness Test |

**Perangkat**: Mobile dalam mode landscape (800×360 atau 812×375)

**Langkah-Langkah**:
1. Buka aplikasi di mobile.
2. Putar perangkat ke mode landscape.
3. Navigasi ke beberapa halaman.

**Hasil yang Diharapkan**:
- Layout menyesuaikan ke mode landscape.
- Tidak ada elemen yang overlap.
- Konten tetap terbaca.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

### RESP-007 — Alur Booking Mobile End-to-End

| Field | Detail |
|---|---|
| **ID** | RESP-007 |
| **Modul** | Mobile — Booking |
| **Prioritas** | 🔴 Kritis |
| **Tipe** | Happy Path |

**Langkah-Langkah** (di perangkat mobile):
1. Buka Mobile Home.
2. Klik **Booking** / **Buat Reservasi**.
3. Pilih layanan / dokter (MobileBookingDoctor).
4. Pilih tanggal (MobileBookingSchedule).
5. Konfirmasi reservasi (MobileBookingConfirm).
6. Lihat konfirmasi sukses (MobileBookingSuccess).

**Hasil yang Diharapkan**:
- Alur 5 langkah dapat diselesaikan di mobile.
- Setiap halaman loading dengan cepat (<3 detik).
- Tombol "Lanjut" dan "Kembali" berfungsi.
- Reservasi tersimpan di database.

**Hasil Aktual**: _______________

**Status**: ☐ LULUS &nbsp;&nbsp; ☐ GAGAL

**Catatan**: _______________

---

## Pengujian UX (Checklist Kegunaan)

---

### UX-001 — Checklist Kegunaan — Resepsionis / Admin

| Kriteria | Deskripsi | ☐/✓ |
|---|---|---|
| Login mudah | Form login dapat ditemukan dan digunakan dalam <30 detik | ☐ |
| Navigasi menu jelas | Menu admin dapat ditemukan tanpa panduan | ☐ |
| Manajemen reservasi | Admin bisa cari, filter, dan update reservasi dengan mudah | ☐ |
| Konfirmasi visual | Setiap aksi (simpan, hapus) menampilkan feedback (success/error toast) | ☐ |
| Pesan error deskriptif | Pesan error menjelaskan masalah, bukan hanya "Error" | ☐ |
| Loading state | Ada indikator loading saat data sedang dimuat | ☐ |
| Konfirmasi hapus | Dialog konfirmasi muncul sebelum menghapus data penting | ☐ |
| Aksi undo (jika ada) | Tersedia opsi batalkan untuk aksi yang tidak bisa dibatalkan | ☐ |
| Pagination tersedia | Daftar panjang memiliki pagination atau infinite scroll | ☐ |
| Pencarian cepat | Fitur pencarian user/reservasi bisa digunakan <10 detik | ☐ |
| Dashboard informatif | Dashboard menampilkan informasi kunci tanpa perlu klik lebih lanjut | ☐ |
| Konsistensi warna | Warna tombol aksi konsisten (misal: biru=simpan, merah=hapus) | ☐ |

---

### UX-002 — Checklist Kegunaan — Dokter

| Kriteria | Deskripsi | ☐/✓ |
|---|---|---|
| Antrean mudah diakses | Antrean hari ini langsung tampil di dashboard | ☐ |
| Mulai konsultasi cepat | Hanya butuh 1-2 klik untuk mulai konsultasi | ☐ |
| SOAP mudah diisi | Form SOAP terstruktur dan mudah digunakan | ☐ |
| Pencarian ICD-10 cepat | Pencarian ICD menampilkan hasil dalam <2 detik | ☐ |
| Tambah prosedur intuitif | Pilih dari katalog lebih mudah daripada mengetik manual | ☐ |
| Odontogram visual | Diagram odontogram tampil visual dan interaktif | ☐ |
| Status read-only jelas | Indikasi rekam medis yang terkunci terlihat dengan jelas | ☐ |
| Navigasi antar tab | Berpindah antara SOAP/Diagnosis/Prosedur/Odontogram mudah | ☐ |
| Lihat riwayat pasien | Dokter bisa lihat kunjungan pasien sebelumnya | ☐ |
| Finalisasi dengan konfirmasi | Ada konfirmasi sebelum finalisasi/kunci rekam medis | ☐ |

---

### UX-003 — Checklist Kegunaan — Pasien

| Kriteria | Deskripsi | ☐/✓ |
|---|---|---|
| Registrasi mudah | Bisa daftar dalam <2 menit | ☐ |
| Booking intuitif | Proses booking dapat diselesaikan <3 menit | ☐ |
| Status reservasi jelas | Status reservasi mudah dipahami (Menunggu/Dikonfirmasi/Selesai) | ☐ |
| Rekam medis mudah diakses | Pasien bisa temukan rekam medis dalam <5 klik | ☐ |
| Informasi membership | Level dan poin keanggotaan tampil di dashboard | ☐ |
| Notifikasi informatif | Notifikasi menjelaskan apa yang terjadi dengan jelas | ☐ |
| Onboarding tersedia | Terdapat panduan awal untuk pengguna baru (Onboarding screen) | ☐ |
| Mobile-friendly | Semua fitur utama dapat digunakan di mobile | ☐ |
| Privacy terjaga | Pasien tidak bisa akses data pasien lain | ☐ |
| Tombol logout mudah ditemukan | Logout dapat dilakukan dalam <3 klik | ☐ |

---

## Alur Kerja Klinik Lengkap — Skenario Dunia Nyata

---

### WORKFLOW-001 — Alur Klinis Penuh: Pasien Baru hingga Rekam Medis Terkunci

**Peran yang Terlibat**: Pasien A, Admin, Dokter Yulita Dora  
**Waktu Estimasi**: 30–45 menit  
**Prioritas**: 🔴 Kritis

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Pasien A | Registrasi akun baru | Akun berhasil dibuat | ☐ |
| 2 | Pasien A | Login ke aplikasi | Berhasil masuk ke user dashboard | ☐ |
| 3 | Pasien A | Lihat jadwal dokter Yulita Dora | Jadwal tampil dengan slot tersedia | ☐ |
| 4 | Pasien A | Buat reservasi untuk dokter Yulita, keluhan: sakit gigi | Reservasi dibuat, status: Menunggu | ☐ |
| 5 | Admin | Login, buka Manajemen Reservasi | Reservasi Pasien A tampil | ☐ |
| 6 | Admin | Konfirmasi reservasi Pasien A | Status berubah menjadi Dikonfirmasi | ☐ |
| 7 | Dokter | Login sebagai drg. Yulita Dora | Dashboard dokter tampil | ☐ |
| 8 | Dokter | Buka Antrean, lihat Pasien A | Pasien A muncul di daftar antrean | ☐ |
| 9 | Dokter | Klik "Mulai Konsultasi" Pasien A | Visit & Medical Record otomatis dibuat | ☐ |
| 10 | Dokter | Isi SOAP Note (S/O/A/P lengkap) | SOAP tersimpan, Revision: 1 | ☐ |
| 11 | Dokter | Cari ICD-10 "K02", tambah diagnosis primer K02.1 | Diagnosis tersimpan sebagai primary | ☐ |
| 12 | Dokter | Tambah prosedur PROC-002 (Penambalan), nomor gigi 46, status completed | Prosedur tersimpan, performed_at terisi | ☐ |
| 13 | Dokter | Update odontogram: gigi 46 → caries | Tooth state tersimpan | ☐ |
| 14 | Dokter | Klik "Finalisasi Rekam Medis" | Status berubah menjadi finalized | ☐ |
| 15 | Dokter | Klik "Kunci Rekam Medis" | Status berubah menjadi locked | ☐ |
| 16 | Dokter | Coba edit SOAP pada rekam medis yang dikunci | HTTP 422 — Edit ditolak | ☐ |
| 17 | Pasien A | Login, buka Rekam Medis Saya | Data klinis tampil dalam mode read-only | ☐ |
| 18 | Pasien B | Login, coba akses rekam medis Pasien A | HTTP 403 — Akses ditolak | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

### WORKFLOW-002 — Alur Keanggotaan: Upgrade hingga Aktivasi

**Peran yang Terlibat**: Pasien, Admin  
**Waktu Estimasi**: 15–20 menit  
**Prioritas**: 🔴 Kritis

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Pasien | Login | Dashboard dengan info membership tampil | ☐ |
| 2 | Pasien | Buka halaman Membership | Info tier Gold/Platinum/Diamond tampil | ☐ |
| 3 | Pasien | Ajukan Request Upgrade ke level Platinum | Request dibuat, status: pending | ☐ |
| 4 | Admin | Login, buka Manajemen Keanggotaan | Request Pasien tampil | ☐ |
| 5 | Admin | Approve upgrade request | Invoice pembayaran otomatis dibuat | ☐ |
| 6 | Pasien | Buka Invoice, lihat tagihan | Invoice tampil dengan jumlah yang sesuai | ☐ |
| 7 | Pasien | Klik Bayar, Simulate Settlement | Pembayaran berhasil | ☐ |
| 8 | Sistem | Event processing otomatis | Keanggotaan Pasien terupgrade ke Platinum | ☐ |
| 9 | Pasien | Refresh dashboard | Level membership tampil: Platinum | ☐ |
| 10 | Admin | Verifikasi di dashboard analitik | Data keanggotaan terupdate di sistem | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

### WORKFLOW-003 — Alur Mobile Booking (End-to-End di Perangkat Mobile)

**Peran yang Terlibat**: Pasien baru  
**Waktu Estimasi**: 10 menit  
**Prioritas**: 🔴 Kritis

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Tamu | Buka aplikasi di mobile | Mobile Home tampil dengan cepat (<3 detik) | ☐ |
| 2 | Tamu | Klik "Booking" di bottom nav | MobileBooking halaman tampil | ☐ |
| 3 | Tamu | Pilih dokter di MobileBookingDoctor | Daftar dokter tampil dengan spesialisasi | ☐ |
| 4 | Tamu | Pilih jadwal di MobileBookingSchedule | Kalender/pilihan jadwal tampil | ☐ |
| 5 | Tamu | Isi detail booking (nama, telepon, keluhan) | Form dapat diisi di mobile | ☐ |
| 6 | Tamu | Konfirmasi di MobileBookingConfirm | Data rangkuman booking tampil | ☐ |
| 7 | Tamu | Submit booking | MobileBookingSuccess tampil | ☐ |
| 8 | Admin | Cek di dashboard, reservasi tampil | Reservasi guest baru masuk ke sistem | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

### WORKFLOW-004 — Alur Multi-Diagnosis & Multi-Prosedur

**Peran yang Terlibat**: Dokter  
**Waktu Estimasi**: 20 menit  
**Prioritas**: 🟡 Tinggi

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Dokter | Buka rekam medis aktif (status in_progress) | Rekam medis tampil | ☐ |
| 2 | Dokter | Tambah Diagnosis 1: Karies Elemen 36, K02.1, primary | Tersimpan sebagai primary | ☐ |
| 3 | Dokter | Tambah Diagnosis 2: Gingivitis, K05.1, secondary | Tersimpan sebagai secondary | ☐ |
| 4 | Dokter | Tambah Diagnosis 3: Periodontitis Kronis, K05.3, differential | Tersimpan sebagai differential | ☐ |
| 5 | Dokter | Pasien lihat diagnoses — urutan tampil | Tampil: primary → secondary → differential | ☐ |
| 6 | Dokter | Tambah Prosedur 1: Scaling (PROC-001), status planned | Tersimpan tanpa performed_at | ☐ |
| 7 | Dokter | Tambah Prosedur 2: Penambalan (PROC-002), gigi 36, completed | Tersimpan dengan performed_at = now | ☐ |
| 8 | Dokter | Update Prosedur 1 (Scaling) ke status completed | performed_at ter-set otomatis | ☐ |
| 9 | Dokter | Coba tambah Diagnosis duplikat (K02.1 lagi) | HTTP 422 — Duplikat ditolak | ☐ |
| 10 | Dokter | Bulk update odontogram: gigi 36=missing, 46=caries | Semua tersimpan atomik | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

### WORKFLOW-005 — Skenario Keamanan IDOR Komprehensif

**Peran yang Terlibat**: Pasien A, Pasien B, Dokter A, Dokter B  
**Waktu Estimasi**: 15 menit  
**Prioritas**: 🔴 Kritis

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Dokter A | Mulai konsultasi Pasien A — MR A dibuat | MR A dengan ID tertentu | ☐ |
| 2 | Dokter A | Isi SOAP, Diagnosis, Prosedur, Odontogram | Data tersimpan | ☐ |
| 3 | Pasien B | Login, coba GET MR A dari endpoint pasien | HTTP 403 | ☐ |
| 4 | Pasien B | Coba GET SOAP MR A | HTTP 403 | ☐ |
| 5 | Pasien B | Coba GET Diagnosis MR A | HTTP 403 | ☐ |
| 6 | Pasien B | Coba GET Prosedur MR A | HTTP 403 | ☐ |
| 7 | Pasien B | Coba GET Odontogram MR A | HTTP 403 | ☐ |
| 8 | Dokter B | Login, coba POST SOAP ke MR A | HTTP 403 | ☐ |
| 9 | Dokter B | Coba POST Diagnosis ke MR A | HTTP 403 | ☐ |
| 10 | Dokter B | Coba POST Prosedur ke MR A | HTTP 403 | ☐ |
| 11 | Dokter B | Coba PUT Odontogram MR A | HTTP 403 | ☐ |
| 12 | Dokter B | Coba DELETE Prosedur milik Dokter A | HTTP 403 | ☐ |
| 13 | Pasien A | Login, GET MR A (endpoint pasien) | HTTP 200 — Akses berhasil sebagai pemilik | ☐ |
| 14 | Dokter A | GET/POST MR A (endpoint dokter) | HTTP 200 — Akses berhasil sebagai dokter pemilik | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

### WORKFLOW-006 — Alur Konten Admin

**Peran yang Terlibat**: Admin  
**Waktu Estimasi**: 20 menit  
**Prioritas**: 🟢 Normal

| Langkah | Aktor | Aksi | Hasil yang Diharapkan | ✓ |
|---|---|---|---|---|
| 1 | Admin | Login ke Clinic Dashboard | Dashboard admin tampil | ☐ |
| 2 | Admin | Buat artikel blog baru | Artikel berhasil dibuat | ☐ |
| 3 | Tamu | Buka halaman Blog | Artikel baru tampil di daftar | ☐ |
| 4 | Admin | Buat promo baru dengan periode berlaku | Promo berhasil dibuat | ☐ |
| 5 | Tamu | Buka halaman Promo | Promo baru tampil | ☐ |
| 6 | Admin | Upload gambar ke galeri | Gambar berhasil diupload | ☐ |
| 7 | Admin | Tambah testimoni | Testimoni berhasil ditambah | ☐ |
| 8 | Admin | Buat popup aktif | Popup aktif tersimpan | ☐ |
| 9 | Tamu | Buka halaman utama | Popup tampil otomatis | ☐ |
| 10 | Admin | Tambah dokter baru | Dokter berhasil dibuat | ☐ |
| 11 | Dokter Baru | Login dengan kredensial yang dibuat admin | Login berhasil | ☐ |

**Status Keseluruhan**: ☐ LULUS SEMUA &nbsp;&nbsp; ☐ ADA YANG GAGAL

---

## Template Laporan Bug

Gunakan template berikut untuk setiap bug yang ditemukan selama pengujian:

---

### 🐛 LAPORAN BUG

| Field | Isi |
|---|---|
| **Bug ID** | BUG-XXXX-[Nomor] |
| **Tanggal Ditemukan** | DD/MM/YYYY HH:MM |
| **Penguji** | Nama lengkap penguji |
| **Environment** | Development / Staging / Production |
| **Browser / Perangkat** | Chrome 125 / iPhone 13 / dll. |
| **Resolusi Layar** | 1920×1080 / 375×812 / dll. |
| **URL / Halaman** | URL lengkap tempat bug ditemukan |

---

**Modul**: `[Nama Modul: Autentikasi / Reservasi / Rekam Medis / dll.]`

**Komponen**: `[Nama Komponen: Form Login / Odontogram / dll.]`

**Severity**:
- ☐ 🔴 **Critical** — Sistem crash / data hilang / keamanan terkompromi
- ☐ 🟠 **High** — Fitur utama tidak berjalan
- ☐ 🟡 **Medium** — Fitur berjalan tapi ada masalah UI/UX
- ☐ 🟢 **Low** — Masalah kosmetik / typo

**Priority**:
- ☐ 🔴 **P1** — Harus diperbaiki sebelum rilis
- ☐ 🟠 **P2** — Diperbaiki di sprint berikutnya
- ☐ 🟡 **P3** — Dapat dijadwalkan di backlog
- ☐ 🟢 **P4** — Nice to have

---

**Langkah Reproduksi**:
```
1. 
2. 
3. 
```

**Hasil yang Diharapkan**:
```
[Jelaskan apa yang seharusnya terjadi]
```

**Hasil Aktual**:
```
[Jelaskan apa yang sebenarnya terjadi]
```

**Pesan Error** (jika ada):
```
[Copy-paste pesan error / stack trace / HTTP response]
```

**Screenshot / Recording**:
```
[Lampirkan screenshot atau link ke video rekaman]
```

**HTTP Request / Response** (jika relevan):
```
Request:
[Method] [URL]
Headers: ...
Body: ...

Response:
HTTP [Status Code]
Body: ...
```

**Status Bug**: `Open` / `In Progress` / `Resolved` / `Closed` / `Won't Fix`

**Ditugaskan ke**: _____________________

**Tanggal Diperbaiki**: ___________________

**Verifikasi oleh**: _____________________

---

## Checklist Rilis Produksi

Gunakan checklist ini SEBELUM setiap rilis ke production. Semua item harus ✅ sebelum rilis.

---

### ☑️ Backend Deployment

| Item | Penanggung Jawab | Status |
|---|---|---|
| `php artisan migrate --force` berhasil dijalankan | Backend Dev | ☐ |
| `php artisan db:seed` berhasil dijalankan | Backend Dev | ☐ |
| Tidak ada migration yang pending | Backend Dev | ☐ |
| File `.env` konfigurasi production sudah benar | DevOps | ☐ |
| `APP_DEBUG=false` di production | DevOps | ☐ |
| `APP_ENV=production` di production | DevOps | ☐ |
| Database MySQL terhubung | Backend Dev | ☐ |
| Laravel Sanctum dikonfigurasi | Backend Dev | ☐ |
| Storage `php artisan storage:link` sudah dijalankan | Backend Dev | ☐ |
| `php artisan config:cache` sudah dijalankan | DevOps | ☐ |
| `php artisan route:cache` sudah dijalankan | DevOps | ☐ |
| `php artisan view:cache` sudah dijalankan | DevOps | ☐ |

---

### ☑️ Frontend Deployment

| Item | Penanggung Jawab | Status |
|---|---|---|
| `npm run build` berhasil — 0 error | Frontend Dev | ☐ |
| TypeScript `tsc --noEmit` — 0 error | Frontend Dev | ☐ |
| Build output di folder `public_html/assets/` | DevOps | ☐ |
| `index.html` tersedia di root | DevOps | ☐ |
| API base URL mengarah ke production server | Frontend Dev | ☐ |

---

### ☑️ Verifikasi Fungsional Pasca-Deploy

| Item | Tester | Status |
|---|---|---|
| Login Admin berhasil | QA | ☐ |
| Login Dokter berhasil | QA | ☐ |
| Login Pasien berhasil | QA | ☐ |
| Registrasi pasien baru berhasil | QA | ☐ |
| Lihat jadwal dokter (publik) berhasil | QA | ☐ |
| Buat reservasi berhasil | QA | ☐ |
| Admin konfirmasi reservasi berhasil | QA | ☐ |
| Dokter mulai konsultasi — Visit & MR dibuat | QA | ☐ |
| SOAP Note bisa dibuat dan diupdate | QA | ☐ |
| Diagnosis bisa ditambah dengan ICD-10 | QA | ☐ |
| Prosedur klinis bisa ditambah | QA | ☐ |
| Odontogram bisa diupdate | QA | ☐ |
| Rekam medis bisa difinalisasi | QA | ☐ |
| Rekam medis bisa dikunci (locked) | QA | ☐ |
| Edit ditolak pada rekam medis locked (422) | QA | ☐ |
| Pasien bisa lihat rekam medis sendiri | QA | ☐ |
| Upgrade keanggotaan berhasil | QA | ☐ |
| Simulasi pembayaran settlement berhasil | QA | ☐ |
| IDOR pasien ke pasien lain — 403 | QA | ☐ |
| IDOR dokter ke dokter lain — 403 | QA | ☐ |
| Upload file berhasil | QA | ☐ |
| Halaman publik (Home, Blog, Promo) tampil | QA | ☐ |
| Mobile booking end-to-end berhasil | QA | ☐ |

---

### ☑️ Data & Database

| Item | Penanggung Jawab | Status |
|---|---|---|
| 13 dokter tersedia di database | Database Admin | ☐ |
| 8 kode ICD-10 tersedia | Database Admin | ☐ |
| 6 prosedur katalog tersedia | Database Admin | ☐ |
| Jadwal dokter tersedia (≥2 per dokter) | Database Admin | ☐ |
| Tidak ada orphan records di tabel klinis | Database Admin | ☐ |
| UNIQUE constraints aktif di `soap_notes`, `odontograms`, `tooth_states` | Database Admin | ☐ |
| Foreign key constraints aktif dengan cascade rules yang benar | Database Admin | ☐ |

---

### ☑️ Keamanan

| Item | Penanggung Jawab | Status |
|---|---|---|
| IDOR protection aktif di semua endpoint klinis | Security | ☐ |
| Read-only enforcement pada rekam medis terkunci | Security | ☐ |
| Input sanitization (strip_tags) aktif | Security | ☐ |
| Laravel Sanctum token revocation berfungsi | Security | ☐ |
| Role-based access control dikonfigurasi | Security | ☐ |
| `APP_DEBUG=false` diverifikasi | Security | ☐ |
| HTTPS aktif (SSL certificate valid) | DevOps | ☐ |

---

### ☑️ Final Sign-Off

| Peran | Nama | Tanda Tangan | Tanggal |
|---|---|---|---|
| Technical Lead | | | |
| QA Lead | | | |
| Product Owner | | | |
| Security Reviewer | | | |
| Release Manager | | | |

**Status Rilis**: ☐ **DISETUJUI** &nbsp;&nbsp; ☐ **DITUNDA**

**Tanggal Rilis**: _______________

**Versi Rilis**: _______________

---

## Glosarium

| Istilah | Definisi |
|---|---|
| **Aggregate Root** | Entitas utama yang mengontrol akses ke semua sub-entitas dalam satu domain. Rekam Medis adalah Aggregate Root untuk SOAP, Diagnosis, Prosedur, dan Odontogram. |
| **CRUD** | Create, Read, Update, Delete — operasi dasar pada data |
| **FDI** | Fédération Dentaire Internationale — sistem penomoran gigi internasional (11-48 untuk gigi permanen, 51-85 untuk gigi sulung) |
| **Happy Path** | Skenario pengujian yang mengikuti alur normal tanpa kesalahan |
| **HTTP 200** | OK — Request berhasil diproses |
| **HTTP 201** | Created — Data baru berhasil dibuat |
| **HTTP 401** | Unauthorized — Tidak ada atau token tidak valid |
| **HTTP 403** | Forbidden — Autentikasi valid tapi tidak punya izin |
| **HTTP 404** | Not Found — Resource tidak ditemukan |
| **HTTP 422** | Unprocessable Entity — Data tidak valid (validasi gagal) |
| **ICD-10** | International Classification of Diseases, 10th Revision — standar kode penyakit internasional |
| **IDOR** | Insecure Direct Object Reference — celah keamanan dimana pengguna bisa mengakses resource orang lain hanya dengan mengganti ID |
| **Invoice** | Tagihan pembayaran yang dibuat saat upgrade keanggotaan disetujui |
| **Locked** | Status rekam medis yang telah dikunci. Tidak bisa diedit oleh siapapun |
| **Medical Record / Rekam Medis** | Catatan klinis resmi seorang pasien untuk satu kunjungan. Berisi SOAP, Diagnosis, Prosedur, dan Odontogram |
| **Membership** | Program keanggotaan pasien dengan level Gold, Platinum, Diamond |
| **Negative Test** | Pengujian yang memverifikasi bahwa sistem menangani input salah/kondisi error dengan benar |
| **Odontogram** | Representasi grafis kondisi gigi-geligi pasien |
| **RC (Release Candidate)** | Versi perangkat lunak yang disiapkan untuk rilis produksi setelah melewati semua pengujian |
| **Read-Only** | Kondisi dimana data hanya bisa dibaca, tidak bisa diubah |
| **Sanctum** | Laravel Sanctum — sistem autentikasi API berbasis token |
| **SOAP** | Subjective, Objective, Assessment, Plan — format dokumentasi klinis medis terstruktur |
| **Sprint** | Periode pengembangan iteratif (biasanya 1-4 minggu) dalam metodologi Agile |
| **UAT** | User Acceptance Testing — pengujian yang dilakukan oleh pengguna nyata untuk memvalidasi sistem |
| **Visit / Kunjungan** | Satu sesi konsultasi antara pasien dan dokter di klinik |
| **XSS** | Cross-Site Scripting — serangan injeksi kode berbahaya ke browser pengguna |

---

*Dokumen ini dihasilkan secara otomatis berdasarkan analisis kode sumber Aesthetic Pondok Indah Dental Clinic Management System.*  
*Versi: 1.0.0 | Sprint Coverage: 1–5 | 200+ Test Cases | Tanggal: 31 Juli 2026*

---

**© 2026 Aesthetic Pondok Indah Dental Clinic. All Rights Reserved.**
