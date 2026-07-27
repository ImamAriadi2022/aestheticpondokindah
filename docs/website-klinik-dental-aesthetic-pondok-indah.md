# Dokumentasi Website Sistem Klinik Dental Aesthetic Pondok Indah

## Ringkasan
Website ini adalah aplikasi web untuk Aesthetic Pondok Indah Dental Clinic yang menggabungkan:

- Tampilan publik (company profile klinik)
- Informasi layanan dan edukasi pasien
- Fitur booking via WhatsApp
- Chatbot (AESPI Bot) untuk info cepat dan triase keluhan sederhana
- Sistem dashboard berbasis role (User, Doctor, Clinic) untuk simulasi operasional klinik

Aplikasi dibangun dengan React + Vite dan menggunakan TailwindCSS untuk styling. Routing menggunakan React Router. Untuk pengembangan backend/edge tersedia Cloudflare Worker (Hono) beserta konfigurasi Wrangler.

## Target Pengguna
- Pasien / calon pasien (publik)
- Admin klinik (role: clinic)
- Dokter (role: doctor)

## Struktur Halaman Utama (Public Site)
Berikut halaman publik yang tersedia:

- `/` Beranda
- `/about` Tentang
- `/doctors` Dokter
- `/services` Layanan
- `/blog` Blog (artikel edukasi)
- `/blog/:slug` Detail artikel
- `/cerita` Cerita (testimoni, galeri, video)
- `/contact` Kontak
- `/privacy-policy` Kebijakan Privasi
- `/terms-of-service` Syarat & Ketentuan

Catatan:
- Chatbot tampil di halaman publik dan otomatis disembunyikan pada area dashboard, settings, dan help.

## Navigasi dan Branding
Komponen header menampilkan:

- Logo klinik
- Menu utama: Beranda, Tentang, Dokter, Layanan, Blog, Cerita
- Tombol `Book Now`
- Tombol `Sign In`

Top bar (desktop) menampilkan:

- WhatsApp: +62 819-9011-4949
- Email: info@aestheticpondokindah.com
- Jam operasional: Senin - Sabtu 10:00 - 18:00 WIB

## Booking Appointment (via WhatsApp)
Fitur booking dibuat untuk mempermudah pasien tanpa harus membuat akun.

Alur booking:

1. Pengunjung menekan tombol `Book Now` di header.
2. Muncul form booking berisi:
   - Nama lengkap
   - Nomor HP
   - Tanggal
   - Pilih dokter
3. Saat submit, sistem akan membuka WhatsApp dengan template pesan yang sudah terisi.
4. Admin klinik melakukan konfirmasi lanjutan melalui WhatsApp.

Keunggulan:

- Tanpa login
- Proses cepat
- Mudah dipakai di mobile

## Chatbot AESPI Bot
Website menyediakan chatbot bernama AESPI Bot untuk membantu pengunjung.

Kemampuan utama:

- Menjawab pertanyaan umum berbasis kata kunci, misalnya:
  - Kontak
  - Jam operasional
  - Lokasi
  - Informasi klinik
  - Info layanan
  - Cara booking
  - Cara daftar akun dan lupa password
  - Info dokter
  - Promo
  - Blog dan konten edukasi

- Triase keluhan (dental triage) sederhana:
  - Menggali keluhan utama (misalnya sakit gigi, bengkak, sensitivitas, gusi berdarah, sariawan, bau mulut, masalah braces, pasca cabut, gigi patah)
  - Menanyakan skala nyeri 0-10
  - Menanyakan durasi dan pemicu
  - Mengecek tanda bahaya (red flags) seperti demam + bengkak, perdarahan berat, sulit menelan/bernapas, trauma
  - Memberikan saran awal yang aman dan mendorong kunjungan klinik bila diperlukan

Integrasi CTA:

- Pada konteks tertentu, chatbot menampilkan tombol untuk mengarahkan ke WhatsApp agar pasien bisa lanjut konsultasi/booking.

Catatan penting untuk operasional:

- Chatbot saat ini berbasis rule dan knowledge base internal (bukan AI eksternal), sehingga jawaban konsisten dan aman untuk informasi dasar.

## Layanan Klinik (Services)
Halaman `/services` menampilkan katalog layanan dental premium.

Fitur halaman layanan:

- Grid list layanan dengan ringkasan singkat
- Modal detail layanan berisi:
  - Deskripsi
  - Tahapan perawatan
  - Daftar dokter umum terkait
  - Bagian dokter spesialis terkait (jika ada)
- CTA konsultasi via WhatsApp

Contoh layanan yang tersedia:

- Dental Whitening
- Root Canal Treatments
- Pediatric Dentistry
- Full Mouth Rehabilitations
- Emergency Dental Services
- Dentures
- Dental Implants
- Wisdom Tooth Removal / Extraction
- Oral Care
- Dental Bridges
- Bone Grafting
- Dental Spa
- Veneers
- Invisalign
- Orthodontics
- Dental Fillings, Inlays & Onlays
- Gum Ablation
- Lip Repositioning
- Crown Lengthening
- Gummy Smile Correction
- Frenectomy

## Halaman Dokter
Halaman `/doctors` berisi:

- Profil dokter dan spesialis (nama, bidang, pendidikan, deskripsi)
- Section tambahan yang menonjolkan:
  - Peralatan modern & standar internasional
  - Sertifikasi
  - Pengalaman
  - Pendekatan personal

## Blog Edukasi
Halaman `/blog` berisi artikel edukasi kesehatan gigi.

Fitur blog:

- Filter kategori
- Card list artikel dengan:
  - Gambar
  - Tanggal
  - Estimasi waktu baca
  - Ringkasan
- Halaman detail artikel `/blog/:slug`

Tujuan:

- Edukasi pasien
- Mendukung SEO
- Meningkatkan kepercayaan calon pasien

## Halaman Kontak
Halaman `/contact` menyediakan:

- Informasi kontak lengkap:
  - Alamat klinik
  - Telepon
  - WhatsApp
  - Email
  - Jam operasional

- Form kirim pesan (simulasi submit pada sisi frontend)
- Tombol cepat untuk chat WhatsApp
- Embed peta Google Maps + tautan ke Maps

## Cerita (Testimoni, Galeri, Video)
Halaman `/cerita` menggabungkan:

- Testimoni
- Galeri
- Video YouTube (embedded)

Tujuan:

- Membangun social proof
- Menampilkan hasil dan suasana klinik

## Sistem Login dan Role
Website menyediakan halaman login:

- `/login` login untuk User dan Doctor
- `/klinik` login khusus Clinic

Fitur login yang tersedia (mode demo):

- Login role-based: user, doctor, clinic
- Registrasi akun user
- Lupa password user
- Login Google (demo)

Catatan:

- Mekanisme login yang terlihat saat ini adalah mode demo (simulasi) dan digunakan untuk mengakses dashboard.

## Dashboard (Area Terproteksi)
Semua halaman dashboard berada di jalur `/dashboard` dan dilindungi oleh `ProtectedRoute`.

Rute dashboard:

- `/dashboard` (redirect / entry point)
- `/dashboard/user` Dashboard pengguna
- `/dashboard/doctor` Dashboard dokter
- `/dashboard/doctor/schedule/new` Form tambah jadwal
- `/dashboard/doctor/schedule/edit/:id` Form edit jadwal
- `/dashboard/clinic` Dashboard klinik
- `/dashboard/clinic/doctor/new` Form tambah dokter
- `/dashboard/clinic/doctor/edit/:id` Form edit dokter

Menu dashboard bergantung pada role:

User:

- Dashboard
- Konsultasi
- Riwayat
- Jadwal Dokter
- Pengaduan

Doctor:

- Dashboard
- Jadwal
- Klien

Clinic:

- Dashboard
- Reservasi
- Pengguna
- Dokter
- Konten
- Analitik

## Fitur Dashboard: User
Fitur inti untuk pengguna (mode demo):

- Melihat jadwal dokter yang tersedia
- Menu konsultasi:
  - Konsultasi cepat
  - Konsultasi terjadwal
- Pengaduan:
  - Daftar pengaduan
  - Detail pengaduan
  - Kategori dan status (misalnya Diproses, Ditanggapi, Selesai)

## Fitur Dashboard: Doctor
Fitur inti untuk dokter (mode demo):

- Melihat ringkasan statistik
- Manajemen jadwal:
  - Daftar jadwal
  - Tambah jadwal
  - Edit jadwal
- Manajemen klien konsultasi:
  - Daftar klien menunggu
  - Melihat hasil konsultasi yang dikirim klien

## Fitur Dashboard: Clinic (Admin Klinik)
Fitur inti untuk admin klinik (mode demo):

- Ringkasan operasional (kartu statistik)
- Reservasi:
  - Filter status
  - Pencarian
  - Detail reservasi
- Manajemen pengguna
- Manajemen dokter:
  - Daftar dokter
  - Jadwal praktik dokter
  - Analisis performa (mock)
- Konten:
  - Area konten artikel
- Analitik:
  - Statistik pengunjung dan ringkasan performa

## Settings dan Help
Halaman tambahan:

- `/settings`
- `/help`

Catatan:

- Chatbot disembunyikan pada halaman-halaman ini.

## Teknologi dan Arsitektur
Frontend:

- React 19
- React Router
- TailwindCSS
- UI components berbasis Radix UI
- Icons: Lucide

Backend / Edge:

- Cloudflare Workers
- Hono
- Konfigurasi Wrangler

Storage dan Services (konfigurasi Cloudflare):

- D1 Database binding: `DB`
- R2 Bucket binding: `R2_BUCKET`
- Service binding: `EMAILS` (emails-service)

Catatan:

- Worker `src/worker/index.ts` saat ini masih minimal (belum mendefinisikan routes API). Bagian ini bisa dikembangkan untuk kebutuhan sistem klinik yang benar-benar live.

## Cara Menjalankan Proyek
Jalankan dev server:

1. Install dependency
2. Start dev server

Perintah:

- `npm install`
- `npm run dev`

Build:

- `npm run build`

## Catatan Pengembangan Lanjutan (Opsional)
Jika website ingin ditingkatkan dari mode demo menjadi sistem klinik real:

- Implementasi backend API (reservasi, jadwal dokter, konsultasi, pengaduan)
- Integrasi database D1 untuk data operasional
- Autentikasi sungguhan (token/session) menggantikan demo auth
- CMS sederhana untuk artikel blog
- Integrasi email service untuk notifikasi booking dan follow-up

