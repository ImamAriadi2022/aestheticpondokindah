# Panduan Mobile Notification System — Aesthetic Pondok Indah

Dokumen ini menjelaskan arsitektur **Mobile Notification System**, integrasi Firebase / Web Push / Device Tokens, REST API backend Laravel, Deep Link Navigation, dan LocalStorage fallback untuk offline support.

---

## 1. Arsitektur Notifikasi

Sistem notifikasi dibangun dengan 3 arsitektur terintegrasi:

1. **Backend Layer (Laravel 12)**:
   * Skema database `notifications` dan `user_device_tokens`.
   * Endpoint `NotificationController` untuk registrasi device token, membaca daftar notifikasi, menandai dibaca, dan menghapus riwayat notifikasi.
2. **Frontend Layer (React 19 + TypeScript)**:
   * Client API `notificationApi.ts` yang otomatis melakukan sinkronisasi dengan server dan mendukung fallback offline `LocalStorage`.
   * `PwaManager.tsx` & `firebaseNotification.ts` yang menangani permintaan izin notifikasi browser, push token, notifikasi lokal, dan navigasi deep link.
3. **UI Layer (Notification Center)**:
   * Modal `NotificationCenterModal.tsx` dengan indikator belum dibaca, pemfilteran tipe notifikasi, tombol tandai semua dibaca, dan hapus riwayat.
   * Dynamic Badge Counter pada ikon bel `NewMobileDashboardLayout.tsx`.

---

## 2. Format Payload Notifikasi & Deep Linking

| Tipe Notifikasi | Ikon UI | Target Deep Link | Penjelasan |
| :--- | :---: | :--- | :--- |
| **`appointment`** | 📅 | `/#/booking` | Notifikasi konfirmasi, perubahan jadwal, atau pengingat janji temu pasien. |
| **`membership`** | 👑 | `/#/membership` | Notifikasi kenaikan tier membership, bonus poin, atau transaksi loyalty. |
| **`promo`** | 🏷️ | `/#/promo` | Notifikasi penawaran khusus, diskon perawatan, dan voucher promo. |
| **`article`** | 📰 | `/#/blog` | Notifikasi rilis artikel kesehatan gigi & edukasi pasien terbaru. |
| **`general`** | 🔔 | `/#/settings` | Notifikasi umum akun, keamanan, atau pengumuman klinik. |

---

## 3. Lifecycle Token & Keamanan

1. **Token Generation**:
   * Token perangkat unik di-generate dan disimpan secara aman.
   * Dikirim otomatis ke backend via `POST /api/user/device-token` saat pengguna terautentikasi.
2. **Token Invalidation**:
   * Token dihapus dari backend via `DELETE /api/user/device-token` saat pengguna melakukan Logout.
3. **Security Standards**:
   * FCM Server Key dan Private Credentials **TIDAK PERNAH** disimpan di frontend.
   * Hanya device token terenkripsi yang ditransmisikan via HTTPS.

---

## 4. Dukungan Mode Offline

* Saat pengguna tidak memiliki koneksi internet, notifikasi tersimpan dalam cache `apig_notifications_cache_v1` di LocalStorage.
* Pengguna tetap dapat membaca notifikasi, menandai dibaca, atau menghapus notifikasi dalam mode offline.
* Saat terhubung kembali ke internet, status notifikasi otomatis ter-sinkronisasi dengan server Laravel.
