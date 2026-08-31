<?php

namespace App\Http\Controllers\Api\Shared\Docs;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpenApiController extends Controller
{
    /**
     * Return the complete OpenAPI 3.0.3 Specification for Aesthetic Pondok Indah Dental Clinic.
     */
    public function schema(Request $request): JsonResponse
    {
        $baseUrl = url('/api');

        $spec = [
            'openapi' => '3.0.3',
            'info' => [
                'title' => 'Aesthetic Pondok Indah Dental Clinic — REST API Documentation',
                'version' => '2.5.0',
                'description' => 'Dokumentasi resmi REST API Backend Aesthetic Pondok Indah Dental Clinic (Laravel 12 + Sanctum). Mendukung multi-aktor (Guest, Pasien/User, Dokter Spesialis, Developer, dan Admin Klinik) dengan integrasi Zesta AI LiveChat, WhatsApp OTP/Notifikasi Gateway, Midtrans Billing, EMR Odontogram, dan Web Push Notification.',
                'contact' => [
                    'name' => 'Imam Ariadi (Lead Developer)',
                    'url' => 'https://aestheticpondokindah.com',
                    'email' => 'imamariadi775@gmail.com',
                ],
            ],
            'servers' => [
                [
                    'url' => 'https://aestheticpondokindah.com/api',
                    'description' => 'Production Server (aestheticpondokindah.com)',
                ],
                [
                    'url' => $baseUrl,
                    'description' => 'Current Active Server Environment (' . config('app.env') . ')',
                ],
            ],
            'components' => [
                'securitySchemes' => [
                    'BearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'Sanctum Token',
                        'description' => 'Gunakan Sanctum Bearer Token yang didapatkan dari POST /auth/login atau POST /auth/otp/verify.',
                    ],
                ],
            ],
            'paths' => [
                // 1. Authentication & Security
                '/auth/login' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Login Pengguna / Dokter / Admin / Developer',
                        'description' => 'Otentikasi kredensial (WhatsApp / Email + Password) untuk mendapatkan Sanctum Bearer Token.',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['login', 'password'],
                                        'properties' => [
                                            'login' => ['type' => 'string', 'example' => 'imamariadi775@gmail.com', 'description' => 'Nomor WhatsApp atau alamat email'],
                                            'password' => ['type' => 'string', 'example' => 'Persib1933', 'description' => 'Password akun'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Login Berhasil'],
                            '401' => ['description' => 'Kredensial Tidak Valid'],
                        ],
                    ],
                ],
                '/auth/register' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Registrasi Pasien Baru',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['name', 'phone', 'email', 'password', 'password_confirmation'],
                                        'properties' => [
                                            'name' => ['type' => 'string', 'example' => 'Ahmad Wijaya'],
                                            'phone' => ['type' => 'string', 'example' => '+6281234567890'],
                                            'email' => ['type' => 'string', 'example' => 'ahmad@example.com'],
                                            'password' => ['type' => 'string', 'example' => 'password123'],
                                            'password_confirmation' => ['type' => 'string', 'example' => 'password123'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '201' => ['description' => 'Registrasi Berhasil'],
                        ],
                    ],
                ],
                '/auth/otp/send' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Kirim Kode OTP WhatsApp via Zesta Gateway',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['whatsapp'],
                                        'properties' => [
                                            'whatsapp' => ['type' => 'string', 'example' => '+6281234567890'],
                                            'name' => ['type' => 'string', 'example' => 'Imam Ariadi'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => ['description' => 'OTP Berhasil Dikirim'],
                        ],
                    ],
                ],
                '/auth/otp/verify' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Verifikasi OTP WhatsApp & Login/Register Otomatis',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['whatsapp', 'otp'],
                                        'properties' => [
                                            'whatsapp' => ['type' => 'string', 'example' => '+6281234567890'],
                                            'otp' => ['type' => 'string', 'example' => '123456'],
                                            'name' => ['type' => 'string', 'example' => 'Imam Ariadi'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Otentikasi OTP Berhasil'],
                        ],
                    ],
                ],
                '/auth/me' => [
                    'get' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Cek Sesi User Login Aktif',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Data profil user & role aktif']],
                    ],
                ],
                '/auth/refresh' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Perpanjang Masa Aktif Token Sesi',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Token baru diperbarui']],
                    ],
                ],
                '/auth/logout' => [
                    'post' => [
                        'tags' => ['1. Authentication & Session'],
                        'summary' => 'Logout & Cabut Sanctum Token',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Berhasil logout']],
                    ],
                ],

                // 2. Guest Online Consultation (AI + Handoff)
                '/guest/consultations' => [
                    'post' => [
                        'tags' => ['2. Guest Online Consultation (AI & Handoff)'],
                        'summary' => 'Mulai Sesi Konsultasi Online Tamu (Tanpa Akun)',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['patient_name', 'phone', 'topic', 'chief_complaint'],
                                        'properties' => [
                                            'patient_name' => ['type' => 'string', 'example' => 'Dewi Lestari'],
                                            'phone' => ['type' => 'string', 'example' => '+6281234567890'],
                                            'email' => ['type' => 'string', 'example' => 'dewi@example.com'],
                                            'topic' => ['type' => 'string', 'example' => 'Gusi Berdarah / Radang Gusi'],
                                            'chief_complaint' => ['type' => 'string', 'example' => 'Gusi berdarah saat sikat gigi dan agak ngilu.'],
                                            'pain_scale' => ['type' => 'integer', 'example' => 4],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => ['201' => ['description' => 'Sesi dibuat dengan token akses guest dan initial assessment AI']],
                    ],
                ],
                '/guest/consultations/{token}' => [
                    'get' => [
                        'tags' => ['2. Guest Online Consultation (AI & Handoff)'],
                        'summary' => 'Ambil Data & Riwayat Pesan Konsultasi Tamu',
                        'parameters' => [['name' => 'token', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'string']]],
                        'responses' => ['200' => ['description' => 'Detail konsultasi dan riwayat percakapan']],
                    ],
                ],
                '/guest/consultations/{token}/messages' => [
                    'post' => [
                        'tags' => ['2. Guest Online Consultation (AI & Handoff)'],
                        'summary' => 'Kirim Pesan Chat (Otomatis Dibalas Zesta AI / Admin)',
                        'parameters' => [['name' => 'token', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'string']]],
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['body'],
                                        'properties' => [
                                            'body' => ['type' => 'string', 'example' => 'Apakah pembersihan karang gigi sakit dok?'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => ['200' => ['description' => 'Pesan terkirim dan AI merespons']],
                    ],
                ],

                // 3. Public Information & Guest Services
                '/public/settings' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Pengaturan Publik Klinik (Profil, Kontak WA, Operasional)',
                        'responses' => ['200' => ['description' => 'Pengaturan publik klinik']],
                    ],
                ],
                '/public/home' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Konten Etalase Beranda (Hero Banner, Keunggulan)',
                        'responses' => ['200' => ['description' => 'Konten beranda']],
                    ],
                ],
                '/public/doctors' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Daftar Dokter Spesialis Klinik',
                        'responses' => ['200' => ['description' => 'Daftar dokter spesialis']],
                    ],
                ],
                '/public/doctor-schedules' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Jadwal Praktik Dokter & Ketersediaan Slot Janji Temu',
                        'responses' => ['200' => ['description' => 'Daftar jadwal dan slot waktu']],
                    ],
                ],
                '/public/services' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Daftar Layanan & Treatment Gigi',
                        'responses' => ['200' => ['description' => 'Daftar layanan']],
                    ],
                ],
                '/public/promos' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Daftar Promo Spesial Aktif',
                        'responses' => ['200' => ['description' => 'Daftar promo']],
                    ],
                ],
                '/public/posts' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Daftar Artikel & Edukasi Kesehatan Gigi (Blog)',
                        'responses' => ['200' => ['description' => 'Daftar artikel blog']],
                    ],
                ],
                '/public/branches' => [
                    'get' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Daftar Cabang Klinik & Titik Lokasi Maps',
                        'responses' => ['200' => ['description' => 'Daftar cabang']],
                    ],
                ],
                '/public/reservations' => [
                    'post' => [
                        'tags' => ['3. Public Information & Guest Services'],
                        'summary' => 'Kirim Reservasi Pasien Publik / Tamu',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['name', 'phone', 'date', 'preferred_time'],
                                        'properties' => [
                                            'name' => ['type' => 'string', 'example' => 'Budi Santoso'],
                                            'phone' => ['type' => 'string', 'example' => '+6281234567890'],
                                            'complaint' => ['type' => 'string', 'example' => 'Pembersihan Karang Gigi'],
                                            'date' => ['type' => 'string', 'example' => '2026-09-05'],
                                            'preferred_time' => ['type' => 'string', 'example' => '14:00'],
                                            'branch_id' => ['type' => 'integer', 'example' => 1],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => ['201' => ['description' => 'Reservasi berhasil dibuat dan WhatsApp notifikasi dikirim ke pasien']],
                    ],
                ],

                // 4. Patient Portal
                '/user/profile' => [
                    'get' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Profil Pasien Lengkap & Membership Tier',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Profil pengguna']],
                    ],
                    'put' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Perbarui Data Profil Pasien',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Profil berhasil diperbarui']],
                    ],
                ],
                '/user/reservations' => [
                    'get' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Riwayat & Status Janji Temu Pasien',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar reservasi pasien']],
                    ],
                    'post' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Buat Janji Temu Baru (Pasien Login)',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['201' => ['description' => 'Reservasi berhasil dibuat']],
                    ],
                ],
                '/user/consultations' => [
                    'get' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Daftar Konsultasi Online Pasien',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar sesi konsultasi']],
                    ],
                    'post' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Buka Sesi Konsultasi Baru Pasien Terdaftar',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['201' => ['description' => 'Sesi dibuat dan AI mendampingi']],
                    ],
                ],
                '/user/medical-records' => [
                    'get' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Rekam Medis Elektronik (EMR) & Riwayat Perawatan Pasien',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Rekam medis pasien']],
                    ],
                ],
                '/user/invoices/{id}/payment' => [
                    'post' => [
                        'tags' => ['4. Patient Portal & Health Records'],
                        'summary' => 'Buat Transaksi Pembayaran Midtrans Snap',
                        'security' => [['BearerAuth' => []]],
                        'parameters' => [['name' => 'id', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]],
                        'responses' => ['200' => ['description' => 'Snap Token Midtrans']],
                    ],
                ],

                // 5. Doctor Portal & Clinical EMR
                '/doctor/dashboard/stats' => [
                    'get' => [
                        'tags' => ['5. Doctor Portal & Clinical EMR'],
                        'summary' => 'Statistik Dashboard Dokter (Pasien Hari Ini, Antrean, Konsultasi)',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Statistik dokter']],
                    ],
                ],
                '/doctor/schedules' => [
                    'get' => [
                        'tags' => ['5. Doctor Portal & Clinical EMR'],
                        'summary' => 'Kelola Jadwal Praktik Dokter',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Jadwal dokter']],
                    ],
                ],
                '/doctor/queue' => [
                    'get' => [
                        'tags' => ['5. Doctor Portal & Clinical EMR'],
                        'summary' => 'Daftar Antrean Pasien Hari Ini',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Antrean pasien']],
                    ],
                ],
                '/doctor/medical-records' => [
                    'get' => [
                        'tags' => ['5. Doctor Portal & Clinical EMR'],
                        'summary' => 'Daftar Rekam Medis Pasien yang Ditangani',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar EMR']],
                    ],
                ],
                '/doctor/medical-records/{id}/odontogram' => [
                    'post' => [
                        'tags' => ['5. Doctor Portal & Clinical EMR'],
                        'summary' => 'Simpan / Perbarui Diagram Odontogram Gigi Pasien',
                        'security' => [['BearerAuth' => []]],
                        'parameters' => [['name' => 'id', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']]],
                        'responses' => ['200' => ['description' => 'Odontogram tersimpan']],
                    ],
                ],

                // 6. Clinic Admin & CMS
                '/admin/dashboard/stats' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Statistik Ringkasan Manajemen Klinik',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Statistik klinik']],
                    ],
                ],
                '/admin/clinic-settings' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Ambil Seluruh Pengaturan Sistem Klinik',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Pengaturan klinik']],
                    ],
                ],
                '/admin/reservations' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Kelola Seluruh Reservasi Pasien (Konfirmasi / Tolak / WhatsApp)',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar reservasi']],
                    ],
                ],
                '/admin/users' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Kelola Data Pengguna, Pasien, dan Hak Akses',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar user']],
                    ],
                ],
                '/admin/doctors' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Kelola Dokter Spesialis Klinik & Status Praktik',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar dokter']],
                    ],
                ],
                '/admin/services' => [
                    'get' => [
                        'tags' => ['6. Clinic Admin Management & CMS'],
                        'summary' => 'Kelola Master Layanan & Tarif Klinik',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'Daftar layanan']],
                    ],
                ],

                // 7. Push Notifications & Utilities
                '/push/vapid-public-key' => [
                    'get' => [
                        'tags' => ['7. Web Push & Shared Utilities'],
                        'summary' => 'Ambil VAPID Public Key untuk Web Push Browser',
                        'responses' => ['200' => ['description' => 'VAPID Public Key']],
                    ],
                ],
                '/push/subscribe' => [
                    'post' => [
                        'tags' => ['7. Web Push & Shared Utilities'],
                        'summary' => 'Daftarkan Subscription WebPush Browser',
                        'responses' => ['200' => ['description' => 'Subscription tersimpan']],
                    ],
                ],
                '/upload' => [
                    'post' => [
                        'tags' => ['7. Web Push & Shared Utilities'],
                        'summary' => 'Upload Gambar / File / Foto Profil',
                        'security' => [['BearerAuth' => []]],
                        'responses' => ['200' => ['description' => 'URL file terunggah']],
                    ],
                ],
                '/wilayah/provinsi' => [
                    'get' => [
                        'tags' => ['7. Web Push & Shared Utilities'],
                        'summary' => 'Daftar Seluruh Provinsi Indonesia',
                        'responses' => ['200' => ['description' => 'Daftar provinsi']],
                    ],
                ],
            ],
        ];

        return response()->json($spec, 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}