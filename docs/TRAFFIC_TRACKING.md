# Panduan Tracking Sumber Trafik Website

## Overview

Website Aesthetic Pondok Indah mendeteksi sumber trafik pengunjung secara otomatis menggunakan:
- **UTM Parameters** (untuk link dari social media/email)
- **HTTP Referer** (untuk link dari website lain)
- **Direct traffic** (pengunjung yang langsung mengetik URL)

## Cara Tracking Sumber Trafik

### 1. Menggunakan UTM Parameters (Rekomendasi untuk Social Media)

Tambahkan parameter UTM di akhir URL website Anda saat memposting link di social media:

```
https://aestheticpondokindah.com/?utm_source=[SOURCE]&utm_medium=[MEDIUM]&utm_campaign=[CAMPAIGN]
```

**Parameter yang digunakan:**
- `utm_source` — Platform sumber (wajib)
- `utm_medium` — Jenis medium (opsional)
- `utm_campaign` — Nama kampanye (opsional)

### 2. Contoh Link untuk Berbagai Platform

#### Instagram
```
https://aestheticpondokindah.com/?utm_source=instagram&utm_medium=social&utm_campaign=promo-mei-2026
```

#### TikTok
```
https://aestheticpondokindah.com/?utm_source=tiktok&utm_medium=social&utm_campaign=tiktok-promo
```

#### Facebook
```
https://aestheticpondokindah.com/?utm_source=facebook&utm_medium=social&utm_campaign=fb-ads
```

#### WhatsApp (Broadcast/Link di Bio)
```
https://aestheticpondokindah.com/?utm_source=whatsapp&utm_medium=social&utm_campaign=wa-broadcast
```

#### Google Ads
```
https://aestheticpondokindah.com/?utm_source=google&utm_medium=cpc&utm_campaign=google-ads-dental
```

#### Email Marketing
```
https://aestheticpondokindah.com/?utm_source=email&utm_medium=email&utm_campaign=newsletter-mei
```

#### YouTube
```
https://aestheticpondokindah.com/?utm_source=youtube&utm_medium=social&utm_campaign=yt-video
```

### 3. Cara Backend Mendeteksi Sumber Trafik

Backend secara otomatis mengkategorisasi sumber trafik berdasarkan prioritas:

| Prioritas | Kondisi | Sumber | Medium |
|-----------|---------|--------|--------|
| 1 | Ada `utm_source` di URL | Nilai `utm_source` | `utm_medium` atau `campaign` |
| 2 | Referrer mengandung `google.com`, `bing.com`, `yahoo.com` | `search` | `organic` |
| 3 | Referrer mengandung `instagram.com` | `instagram` | `social` |
| 4 | Referrer mengandung `facebook.com`, `fb.com` | `facebook` | `social` |
| 5 | Referrer mengandung `tiktok.com` | `tiktok` | `social` |
| 6 | Referrer dari website lain | `referral` | `referral` |
| 7 | Tidak ada referrer | `direct` | `direct` |

**Catatan Penting:**
- Aplikasi Instagram, TikTok, Facebook (in-app browser) **tidak mengirim referer** yang bermakna
- Oleh karena itu, **WAJIB menggunakan UTM parameters** untuk link yang dipost di social media
- Link tanpa UTM dari social media akan tercatat sebagai `direct` atau `unknown`

### 4. Cara Melihat Data Trafik di Dashboard

1. Login sebagai admin klinik
2. Buka menu `/dashboard/clinic`
3. Pilih tab **Analytics**
4. Pilih periode tanggal (1 Hari, 3 Hari, 1 Minggu, 2 Minggu, 1 Bulan, 1 Tahun)
5. Lihat data di card **Kunjungan Website & Sumber Trafik**

**Informasi yang ditampilkan:**
- Grafik batang kunjungan harian (7 hari per halaman, bisa navigasi maju/mundur)
- Total kunjungan dalam 7 hari yang sedang tampil
- Donut chart sumber trafik (Google, Instagram, Direct, dll)
- Jumlah kunjungan per sumber trafik

### 5. Cara Tracking Klik Tombol WhatsApp

Saat user mengklik tombol WhatsApp di website, kunjungan tersebut akan tercatat sebagai:
- **Sumber:** `whatsapp`
- **Medium:** `social`

Ini terjadi karena frontend mengirim data ke backend saat tombol WhatsApp diklik.

### 6. Data yang Disimpan di Database

Tabel `page_visits` menyimpan:
- `visitor_id` — ID unik visitor (dari localStorage)
- `source` — Sumber trafik (google, instagram, direct, dll)
- `medium` — Medium trafik (organic, social, referral, direct)
- `campaign` — Nama kampanye (dari UTM)
- `referrer` — URL referer lengkap
- `landing_page` — Halaman pertama yang diakses
- `ip_address` — IP address visitor
- `user_agent` — Browser/device info
- `visited_at` — Timestamp kunjungan

### 7. Tips untuk Tracking yang Efektif

1. **Selalu gunakan UTM parameters** untuk link di social media
2. **Gunakan nama kampanye yang deskriptif** (misal: `promo-mei-2026` bukan `promo`)
3. **Konsisten penamaan source** (selalu `instagram` bukan `ig` atau `insta`)
4. **Test link sebelum memposting** untuk memastikan tracking berfungsi
5. **Monitor dashboard secara berkala** untuk melihat performa trafik

### 8. Troubleshooting

**Trafik tidak muncul di dashboard:**
- Pastikan migration sudah di-run: `php artisan migrate`
- Cek log backend untuk error
- Pastikan frontend tracking script tidak diblok oleh ad-blocker
- Refresh halaman dashboard setelah ada kunjungan baru

**Trafik tercatat sebagai "Direct" padahal dari social media:**
- Link tidak menggunakan UTM parameters
- Tambahkan `?utm_source=instagram` (atau platform lain) di link

**Trafik dari Google tidak tercatat:**
- Google organic traffic akan tercatat sebagai `search` (bukan `google`)
- Untuk Google Ads, gunakan UTM: `?utm_source=google&utm_medium=cpc`

## Contoh Implementasi Lengkap

### Posting di Instagram Bio
```
🦷 Aesthetic Pondok Indah - Dental Clinic
📍 Jakarta Selatan
📞 +62 812-3456-7890

👇 Booking Sekarang
https://aestheticpondokindah.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio-link
```

### Posting di Instagram Caption (Promo)
```
🎉 Promo Spesial Mei 2026!
Diskon 20% untuk semua treatment dental.

Booking sekarang sebelum habis! 👇
https://aestheticpondokindah.com/?utm_source=instagram&utm_medium=social&utm_campaign=promo-mei-2026

#klinikgigi #dentalclinic #jakarta #aestheticpondokindah
```

### Email Newsletter
```
Subject: Promo Spesial untuk Member!

Halo [Nama],

Kami punya promo spesial untuk Anda bulan ini!

[Link ke Website]
https://aestheticpondokindah.com/?utm_source=email&utm_medium=email&utm_campaign=newsletter-mei-2026

Salam,
Tim Aesthetic Pondok Indah
```

## API Reference

### POST /api/public/analytics/visit

Mencatat kunjungan website.

**Request Body:**
```json
{
  "visitorId": "string (opsional)",
  "referrer": "string (opsional)",
  "landingPage": "string (wajib)",
  "utmSource": "string (opsional)",
  "utmMedium": "string (opsional)",
  "utmCampaign": "string (opsional)"
}
```

**Response:**
```json
{
  "ok": true
}
```

### GET /api/admin/analytics/summary

Mengambil ringkasan analitik untuk periode tertentu.

**Query Parameters:**
- `from` — Tanggal mulai (YYYY-MM-DD)
- `to` — Tanggal akhir (YYYY-MM-DD)

**Response:**
```json
{
  "from": "2026-05-01",
  "to": "2026-05-11",
  "daily": {
    "labels": ["2026-05-01", "2026-05-02", ...],
    "visitors": [120, 145, ...]
  },
  "sources": [
    { "label": "google", "value": 450 },
    { "label": "instagram", "value": 280 },
    { "label": "direct", "value": 120 }
  ],
  "totals": {
    "visitors": 850,
    "visits": 1200
  }
}
```

---

**Dokumentasi ini dibuat pada:** 12 Mei 2026
**Versi:** 1.0
