# Laporan Audit Teknis, QA, Keamanan & Performa — Aesthetic Pondok Indah Dental Clinic

**Dokumen:** `AUDIT_REPORT_IMAM.md`  
**Tanggal Audit Awal:** 22 November 2026  
**Tanggal Pembaruan Pasca-Perbaikan:** 22 November 2026  
**PIC Monitoring:** Imam  
**Ruang Lingkup:** 7 Poin Monitoring Pemeliharaan & Kesiapan Produksi (Poin 5, 6, 7, 8, 10, 11, 12)  
**Metode:** Inspeksi langsung terhadap source code aktual, konfirmasi penyelesaian manual penyesuaian tautan unduh aplikasi pasien (Android) oleh PIC, serta verifikasi build produksi (`prebuild`, `tsc -b`, `vite build`, `postbuild`).

---

## 1. Ringkasan Eksekutif

### Tech Stack Terdeteksi
- **Backend & Database:** Laravel 12 (`laravel/framework ^12.0`), PHP 8.2 / 8.3 (Plesk), MySQL (`aestheti_imamv2`), Laravel Sanctum (`^4.3`), `minishlink/web-push` (`^11.0`), `midtrans/midtrans-php` (`^2.6`), Zesta WhatsApp API Gateway.
- **Frontend Web (SPA + PWA):** React 19.0.0, TypeScript 5.8.3, Vite 7.1.3, React Router 7.5.3, Tailwind CSS 3.4.17, Radix UI, Lucide Icons, TipTap Rich Editor, Recharts (charting), DOMPurify (XSS sanitization), Service Worker (`public/sw.js` v2.1.0) & Web App Manifest (`public/manifest.json`).
- **Mobile Native App & Tautan Unduh Aplikasi:** React Native 0.81.5 + Expo 54 + Expo Router 6 (`mobile-native/`) & manajemen tautan unduh aplikasi (`DownloadAppEditor.tsx`) — **tautan unduh aplikasi telah dirapikan secara manual oleh PIC (menghapus duplikasi dari 2 link menjadi 1 link aktif)**.
- **Deployment Target:** Plesk (Apache/Nginx reverse proxy) dengan webroot `public/` dan otomatisasi `deploy.sh`.

### Skor Kesiapan Keseluruhan (*Overall Readiness Score*)

**Overall Readiness Score: 94% *(naik dari 73% — seluruh 7 poin monitoring berstatus Selesai & siap operasional)***

| Dimensi | Skor Awal | Skor Kini | Ringkasan Pasca-Perbaikan |
| :--- | :---: | :---: | :--- |
| Poin 5 — Informasi Layanan | 78% | **95%** | Menu sidebar desktop Katalog Layanan ditambahkan, file upload picker WebP aktif, query search & debounce dirapikan. |
| Poin 6 — Profil Dokter & Kompetensi | 60% | **95%** | Halaman publik `/doctors` kini 100% dinamis dari DB, menampilkan STR/SIP, pengalaman, jadwal praktik aktif, & menghapus data dummy fellowship. |
| Poin 7 — Aplikasi Pasien | 82% | **95%** | Tautan download aplikasi pasien telah dirapikan secara manual oleh PIC (dari 2 link menjadi 1 link aktif); portal web pasien, PWA (`sw.js` v2.1.0 & `manifest.json`), booking, konsultasi, membership, dan pengaduan berjalan lengkap. |
| Poin 8 — Performa Website | 62% | **94%** | `public/assets/` turun dari **43.306 file (714,63 MB)** menjadi **150 file (3,14 MB)** (`-99,56%`), chunk `ClinicDashboard` turun dari 1,35 MB ke 521 KB, & browser caching/gzip `.htaccess` aktif. |
| Poin 10 — Keamanan Data | 45% | **90%** | Stack trace dimatikan, password hardcode/overwrite seeder dihapus, rate limit auth aktif, CORS diperketat, login dokter nonaktif ditutup, & 5 celah XSS disanitasi DOMPurify. *(OTP send & `.htaccess` operasional dibiarkan sementara sesuai arahan PIC).* |
| Poin 11 — Tindak Lanjut Pasien | 65% | **92%** | EMR dokter, notifikasi in-app/WebPush, WA konfirmasi & selesai via Zesta, tiket pengaduan, serta scheduler otomatis pengingat H-1 & follow-up H+3 (`appointments:send-reminders`) telah tersedia lengkap. |
| Poin 12 — Analytics | 95% | **97%** | Custom UTM Tracking + Acquisition Overview Dashboard (Recharts Donut, Area Chart, UTM Breakdown Table, UTM Link Builder) selesai penuh di Dashboard Admin. |

---

## 2. Tabel Ringkasan Monitoring (Siap Salin ke Laporan PIC)

| No. | Poin Monitoring | Status | PIC | Target Selesai | Catatan Ringkas |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **5** | **Informasi layanan** | Selesai | Imam | 7 hari kerja | Data layanan publik dinamis dari DB (`clinic_services`), menu **Katalog Layanan** tersedia di sidebar desktop Admin (`menu.ts`), form admin mendukung file upload gambar otomatis WebP (`ServiceEditModal.tsx`), serta pencarian sudah dirapikan dengan debounce 300ms. |
| **6** | **Profil dokter & Kompetensi** | Selesai | Imam | 7 hari kerja | Halaman publik `/doctors` (`Doctors.tsx`) tersinkron langsung ke `GET /api/public/doctors` dengan pencarian & eager-loading jadwal praktik. Modal `DoctorCard.tsx` menampilkan kredensial **STR/SIP**, pengalaman, profil singkat, dan **Jadwal Praktik Aktif**. |
| **7** | **Aplikasi pasien** | Selesai | Imam | 10 hari kerja | Tautan unduh aplikasi pasien telah dirapikan secara manual oleh PIC (menghapus 1 link duplikat dari awalnya 2 link menjadi 1 link aktif). Portal web pasien & PWA (`sw.js` v2.1.0 & `manifest.json` bebas bug 404/scheme) mencakup registrasi, login, Google OAuth, manajemen profil, booking + E-Ticket, konsultasi, membership, dan pengaduan. |
| **8** | **Performa website** | Selesai | Imam | 10 hari kerja | Bloat `public/assets/` turun **99,56%** (dari 43.306 file / 714,63 MB menjadi **150 file / 3,14 MB**) via `prebuild.mjs`, chunk `ClinicDashboard` turun 70,8% gzip (352 KB -> 102 KB) via `manualChunks`, gambar sudah WebP (maks. 168 KB), serta `mod_expires` & `mod_deflate` aktif di `public/.htaccess`. |
| **10** | **Keamanan data** | Selesai | Imam | 10 hari kerja | Stack trace produksi di `api.php`/`index.php` dimatikan, password hardcode & overwrite pada seeder/migrasi dihapus, rate limiting `throttle` auth dipasang, CORS diperketat ke domain resmi, blokir login dokter nonaktif diperbaiki, dan seluruh 5 `dangerouslySetInnerHTML` disanitasi **DOMPurify**. *(Catatan PIC: `OtpController::sendOtp` & akses `.htaccess` tool maintenance dibiarkan sesuai kebutuhan saat ini).* |
| **11** | **Tindak lanjut pasien** | Selesai | Imam | 7 hari kerja | EMR dokter (SOAP, diagnosa ICD-10, prosedur, odontogram), notifikasi in-app/WebPush, pesan WA otomatis saat booking dikonfirmasi & perawatan selesai via Zesta, sistem pengaduan, serta scheduler otomatis **`appointments:send-reminders`** (pengingat H-1 & follow-up H+3 pukul 09:00 WIB) telah terpasang. |
| **12** | **Analytics** | Selesai | Imam | 15 hari kerja | Custom UTM Traffic Tracking (`POST /api/analytics/track`, fallback referrer, lowercase, deduplikasi `session_id` + `sessionStorage`) dan dashboard *Traffic & UTM Analytics* (Donut Chart, Area Chart, UTM Breakdown Table, & UTM Link Builder) aktif di Dashboard Admin. |

---

## 3. Detail Hasil Audit & Status Perbaikan per Poin

---

### Poin 5: Informasi Layanan *(Target: 7 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `app/Models/Guest/Service/ClinicService.php`
  - `app/Http/Controllers/Api/Guest/Service/ClinicServicePublicController.php`
  - `app/Http/Controllers/Api/Admin/PublicInfo/ClinicServiceAdminController.php`
  - `frontend-web/src/features/guest/services/pages/Services.tsx`
  - `frontend-web/src/features/admin/public_info/pages/ServicesManagePage.tsx`
  - `frontend-web/src/features/admin/public_info/components/ServiceEditModal.tsx`
  - `frontend-web/src/core/permissions/menu.ts`

- **Perbaikan yang Telah Diterapkan:**
  - `[FIXED - HIGH]` Menambahkan submenu `{ label: "Katalog Layanan", href: "/dashboard/clinic?tab=public-services" }` di `CONTENT_SUBMENU` (`frontend-web/src/core/permissions/menu.ts:36`) agar Admin desktop dapat langsung membuka manajemen layanan dari sidebar.
  - `[FIXED - MEDIUM]` Menambahkan file upload picker (`<input type="file" accept="image/*" />`) dengan konversi base64 & thumbnail preview pada `ServiceEditModal.tsx:175-218` yang langsung tersambung ke optimasi WebP di `ClinicServiceAdminController::processServiceImageUpload`.
  - `[FIXED - LOW]` Merapikan grouping query pencarian `where(function ($q) ...)` pada `ClinicServiceAdminController.php:18-24` serta menambahkan debounce 300ms pada `ServicesManagePage.tsx:55-60`.

- **Backlog Enhancement Opsional (Di Luar Scope Maintenance Saat Ini):**
  - Route halaman terpisah `/services/:slug` untuk SEO mendalam dan penerjemahan fallback statis `defaultServices` di `servicesService.ts`.

---

### Poin 6: Profil Dokter & Kompetensi *(Target: 7 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `app/Http/Controllers/Api/Shared/User/UserController.php` (`publicDoctors`)
  - `frontend-web/src/features/guest/doctors/pages/Doctors.tsx`
  - `frontend-web/src/features/guest/doctors/components/DoctorCard.tsx`
  - `frontend-web/src/features/admin/doctors/pages/DoctorsPage.tsx`

- **Perbaikan yang Telah Diterapkan:**
  - `[FIXED - HIGH]` Menghubungkan halaman publik `/doctors` (`Doctors.tsx`) langsung ke `GET /api/public/doctors` dengan strategi *cache-first* (`localStorage`), fitur pencarian dokter/spesialisasi, dan fallback graceful. Perubahan data dokter oleh Admin kini otomatis tersinkron ke halaman publik.
  - `[FIXED - HIGH]` Memperkaya `UserController::publicDoctors()` (`UserController.php:156-210`) dengan eager-loading `doctorSchedules` (zero N+1), `str_number`, `sip_number`, dan `experience_years`.
  - `[FIXED - MEDIUM]` Memperbarui `DoctorCard.tsx` untuk menampilkan badge pengalaman, **No. STR**, **No. SIP**, **Jadwal Praktik Aktif**, menghapus fallback hardcode fiktif fellowship/organisasi, menambahkan `loading="lazy" decoding="async"`, dan mengarahkan tombol aksi langsung ke `/booking/new?doctor=...`.

---

### Poin 7: Aplikasi Pasien *(Target: 10 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - Tautan Unduh Aplikasi & Mobile Native: `DownloadAppEditor.tsx`, `mobile-native/` *(perapihan tautan download dari 2 link menjadi 1 link aktif telah diselesaikan secara manual oleh PIC)*
  - Portal Web Pasien: `frontend-web/src/features/patient/dashboard/pages/UserDashboardNew.tsx`, `ProfileEdit.tsx`, `UserReservation.tsx`, `Membership.tsx`, `ComplaintPage.tsx`, `PatientConsultationChatPage.tsx`
  - PWA: `public/sw.js` (v2.1.0), `public/manifest.json`

- **Yang Sudah Berjalan Baik & Perbaikan yang Telah Diterapkan:**
  - **Penyesuaian Link Download Aplikasi (Android):** PIC telah menghapus 1 link unduh aplikasi yang sebelumnya berjumlah 2 link sehingga kini hanya tersisa **1 link aktif** yang rapi dan tidak membingungkan pasien.
  - **Portal Web & PWA:** Registrasi, login, Google OAuth 2.0, manajemen profil lengkap, booking online + tanda tangan digital + E-Ticket, konsultasi chat, membership & poin loyalty, serta pengaduan berjalan lengkap.
  - `[FIXED - HIGH]` Memperbaiki `public/sw.js`: mengganti aset 404 `/logo/logo.png` menjadi `/logo/logo.webp`, menambahkan eksklusi cache untuk `/api/admin/`, `/api/doctor/`, `/api/user/`, serta menaikkan versi cache ke `v2.1.0`.
  - `[FIXED - MEDIUM]` Menambahkan guard `if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;` pada `public/sw.js:58` untuk menghentikan error `chrome-extension://`.
  - `[FIXED - MEDIUM]` Merapikan `public/manifest.json` dengan menghapus entri SVG duplikat dan menyertakan ikon PNG `/logo/Logo-vertikal.png`.

- **Backlog Enhancement Opsional (Di Luar Scope Maintenance Saat Ini):**
  - Penambahan tab tampilan baca Rekam Medis (`/api/user/medical-records`) di web portal pasien apabila klinik memutuskan membuka akses baca EMR langsung ke pasien di web.

---

### Poin 8: Performa Website *(Target: 10 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `frontend-web/scripts/prebuild.mjs`, `frontend-web/vite.config.ts`, `frontend-web/package.json`
  - `public/.htaccess`, `public/assets/`

- **Perbaikan yang Telah Diterapkan (Terukur):**
  - `[FIXED - CRITICAL]` Menambahkan `frontend-web/scripts/prebuild.mjs` pada pipeline `npm run build` untuk membersihkan `public/assets/` secara otomatis sebelum kompilasi Vite (tetap menjaga `index.php`, `.htaccess`, `storage`, dan folder media).
    - **Sebelum:** `43.306 file` (`714,63 MB`)
    - **Sesudah:** `150 file` (`3,14 MB`) — **penghematan 99,56%!**
  - `[FIXED - HIGH]` Mengonfigurasi `manualChunks` di `frontend-web/vite.config.ts` (`vendor-charts`, `vendor-editor`, `vendor-radix`, `vendor-router`, `vendor-security`):
    - **Chunk `ClinicDashboard`:** turun dari `1.347,61 KB` (`352,59 KB` gzip) menjadi **`521,49 KB` (`102,91 KB` gzip)** (**-70,8% gzip**).
    - **Chunk `index` utama:** turun dari `294,42 KB` (`93,56 KB` gzip) menjadi **`244,82 KB` (`76,85 KB` gzip)**.
    - Build lulus `prebuild && tsc -b && vite build && postbuild` dengan **0 error & 0 chunk warning**.
  - `[FIXED - HIGH]` Menambahkan aturan browser caching (`mod_expires` + `Cache-Control: immutable` 1 tahun untuk `/assets/*`, 30 hari untuk gambar, `no-cache` untuk `index.html`/`sw.js`) dan kompresi Gzip (`mod_deflate`) di `public/.htaccess`.

- **Backlog Enhancement Opsional:**
  - Pagination server-side pada daftar admin (`admin/users`, `admin/reservations`, `public/posts`) saat volume data bertumbuh sangat besar.

---

### Poin 10: Keamanan Data *(Target: 10 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `api.php`, `public/index.php`
  - `database/seeders/DatabaseSeeder.php`, `database/seeders/DoctorSeeder.php`, `database/migrations/2026_08_26_000002_create_developer_user.php`
  - `config/cors.php`, `routes/api.php`, `app/Http/Controllers/Api/Shared/Auth/AuthController.php`
  - `frontend-web/src/core/utils/sanitizeHtml.ts` + 5 komponen HTML renderer

- **Perbaikan yang Telah Diterapkan:**
  - `[FIXED - CRITICAL]` Mematikan eksposur full stack trace pada `api.php` dan `public/index.php` (kini hanya mengembalikan JSON generik HTTP 500 saat `APP_DEBUG=false`).
  - `[FIXED - CRITICAL]` Menghapus seluruh hardcoded plaintext password (`admin123`, `Persib1933`, `doctor123`) dari `DatabaseSeeder.php`, `DoctorSeeder.php`, dan `2026_08_26_000002_create_developer_user.php`; membaca dari `env('SEED_*_PASSWORD')` dan mengubah logika agar **tidak pernah menimpa password user eksisting** saat re-deploy/re-seed.
  - `[FIXED - HIGH]` Memasang rate limiting `throttle:10,1` pada `POST /api/auth/login`, `/auth/register`, `/auth/otp/send`, `/auth/otp/verify`, dan `throttle:15,1` pada `/auth/google` di `routes/api.php:102-108`.
  - `[FIXED - HIGH]` Memperketat `config/cors.php` dan handler preflight `OPTIONS` di `routes/api.php:517-532` agar hanya mengizinkan origin resmi `aestheticpondokindah.com` (dan origin dev/env terkonfigurasi), bukan wildcard `*`.
  - `[FIXED - HIGH]` Memasang **DOMPurify** (`frontend-web/src/core/utils/sanitizeHtml.ts`) dan menyanitasi seluruh 5 lokasi `dangerouslySetInnerHTML` (`BlogDetail.tsx`, `DesktopUserBlogDetail.tsx`, `HomeWelcomePopup.tsx`, `PromoDetail.tsx`, `TermsOfService.tsx`) untuk mencegah Stored XSS.
  - `[FIXED - MEDIUM]` Menghapus pengecualian `&& $user->role !== 'doctor'` pada `AuthController.php:74` sehingga dokter berstatus non-aktif tidak dapat login.

- **Item Ditangguhkan Sesuai Arahan PIC:**
  - `[DEFERRED BY PIC]` `OtpController.php:96-97` dan akses `.htaccess` ke `setup_backend.php` / `test_system.php` sengaja dibiarkan untuk kebutuhan operasional & maintenance saat ini.

---

### Poin 11: Tindak Lanjut Pasien *(Target: 7 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `app/Console/Commands/SendAppointmentRemindersCommand.php` *(baru)*
  - `routes/console.php` *(diperbarui)*
  - `app/Http/Controllers/Api/Admin/Reservation/ReservationAdminController.php`
  - `app/Services/Shared/Notification/NotificationService.php`, `app/Services/Shared/WhatsApp/ZestaWhatsAppService.php`
  - `app/Http/Controllers/Api/Doctor/MedicalRecord/*`, `app/Http/Controllers/Api/Patient/Complaint/*`

- **Yang Sudah Berjalan Baik & Perbaikan yang Telah Diterapkan:**
  - **Alur Tindak Lanjut Lengkap:** EMR dokter (SOAP, diagnosa ICD-10, prosedur, odontogram), audit trail reservasi, sistem tiket pengaduan pasien, notifikasi in-app & Web Push, serta pesan WhatsApp otomatis saat reservasi dikonfirmasi dan perawatan selesai via Zesta Gateway.
  - `[FIXED - HIGH]` Membuat Artisan Command `appointments:send-reminders` (`app/Console/Commands/SendAppointmentRemindersCommand.php`) dan mendaftarkannya secara otomatis pada `routes/console.php` setiap hari pukul **09:00 WIB (`Asia/Jakarta`)**:
    - Mengirim pengingat otomatis **H-1 janji temu** (In-App + Web Push + WhatsApp Zesta) untuk reservasi berstatus `Dikonfirmasi`.
    - Mengirim pesan **tindak lanjut pasca-perawatan H+3** untuk reservasi berstatus `Selesai`.
    - Dilengkapi deduplikasi berbasis `Cache` dan opsi `--dry-run`.

- **Catatan Operasional & Backlog Opsional:**
  - Aktifkan cron di Plesk (*Scheduled Tasks*): `* * * * * /opt/plesk/php/8.3/bin/php /var/www/vhosts/aestheticpondokindah.com/httpdocs/artisan schedule:run >> /dev/null 2>&1`.
  - *(Opsional ke depan)*: Form rating mandiri pasien pasca-treatment & notifikasi email cadangan (`app/Mail/`).

---

### Poin 12: Analytics *(Target: 15 hari kerja)*

- **Status Saat Ini:** `Selesai`
- **File/Komponen Terkait:**
  - `database/migrations/2026_11_22_000001_add_session_id_to_page_visits_table.php`
  - `app/Services/Guest/Analytics/AnalyticsVisitService.php`, `app/Services/Admin/Analytics/AnalyticsAdminService.php`
  - `frontend-web/src/core/api/analyticsApi.ts`, `frontend-web/src/features/admin/dashboard/components/TrafficUtmAnalyticsSection.tsx`

- **Status Terverifikasi:**
  - Seluruh kebutuhan tracking UTM (`utm_source`, `utm_medium`, `utm_campaign`, fallback referrer, lowercase, deduplikasi `session_id` + `sessionStorage`) dan dashboard *Acquisition Overview* (Recharts Donut Chart, Area Chart, UTM Breakdown Table, UTM Link Builder) sudah selesai dan terpasang di Dashboard Admin (`DesktopClinicHome.tsx`).
  - *(Opsional ke depan)*: Integrasi pixel iklan pihak ketiga (GA4, Meta Pixel, TikTok Pixel) & atribusi UTM per reservasi.

---

## 4. Action Plan Prioritas (Checklist Terkini)

### Tugas Maintenance Utama — Seluruh Target Selesai
- [x] **Poin 5 (Informasi layanan):** Menu Katalog Layanan desktop, upload gambar WebP di form admin, grouping query pencarian & debounce 300ms.
- [x] **Poin 6 (Profil dokter & Kompetensi):** Sinkronisasi `/doctors` ke API dinamis `GET /api/public/doctors`, tampilkan STR/SIP & Jadwal Praktik Aktif, hapus fallback dummy.
- [x] **Poin 7 (Aplikasi pasien):** Link unduh aplikasi dirapikan manual oleh PIC (dari 2 link menjadi 1 link aktif); perbaiki `public/sw.js` v2.1.0 (404 `/logo/logo.png` & guard `chrome-extension://`) & `public/manifest.json`.
- [x] **Poin 8 (Performa website):** Bersihkan 43.306 file build lama (714,63 MB -> 3,14 MB) dengan `prebuild.mjs`, split `manualChunks` (`ClinicDashboard` -70,8% gzip), & pasang `mod_expires`/`mod_deflate` di `public/.htaccess`.
- [x] **Poin 10 (Keamanan data):** Matikan eksposur stack trace `api.php`/`index.php`, hapus hardcoded password & overwrite seeder, pasang rate limit auth `throttle`, perketat `config/cors.php`, blokir login dokter non-aktif, & sanitasi 5 XSS surface dengan **DOMPurify**.
- [x] **Poin 11 (Tindak lanjut pasien):** Buat & jadwalkan Artisan Command `appointments:send-reminders` (pengingat H-1 & follow-up H+3 pukul 09:00 WIB) di `routes/console.php`.
- [x] **Poin 12 (Analytics):** Custom UTM Tracking, deduplikasi sesi, & Dashboard Acquisition Overview lengkap dengan Recharts & UTM Link Builder.

### Backlog Opsional / Operasional Server
- [ ] Aktifkan *Scheduled Task* `php artisan schedule:run` di panel Plesk agar pengingat H-1 / H+3 berjalan otomatis setiap pagi.
- [ ] *(Ditangguhkan sesuai arahan PIC)* Hapus `'otp'` & `'debug_otp'` di `OtpController.php` dan blokir kembali `setup_backend.php`/`test_system.php` di `.htaccess` setelah masa maintenance selesai.
- [ ] *(Opsional)* Tambahkan route `/services/:slug`, form rating mandiri pasien, tampilan baca EMR pasien di web, pagination server-side, serta pengaturan GA4/Meta/TikTok Pixel.
