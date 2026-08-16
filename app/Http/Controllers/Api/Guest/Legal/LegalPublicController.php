<?php

namespace App\Http\Controllers\Api\Guest\Legal;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;

class LegalPublicController extends Controller
{
    private function getKey(string $type): string
    {
        return 'clinic_legal_' . ($type === 'terms_of_service' ? 'terms_of_service' : 'privacy_policy');
    }

    public function show(string $type): JsonResponse
    {
        $key = $this->getKey($type);
        $setting = ClinicSetting::where('key', $key)->first();

        $default = [
            'type' => $type,
            'title' => $type === 'terms_of_service' ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi',
            'last_updated' => '1 Januari 2026',
            'content' => $type === 'terms_of_service'
                ? "Selamat datang di Aesthetic Pondok Indah Dental Clinic. Syarat dan ketentuan berikut mengatur penggunaan seluruh layanan kami, baik melalui website, aplikasi, maupun kunjungan langsung ke klinik.\n\n1. Pendaftaran & Reservasi\nPasien diharapkan memberikan data yang akurat saat melakukan reservasi online.\n\n2. Pembatalan & Penjadwalan Ulang\nPenjadwalan ulang dapat dilakukan minimal 24 jam sebelum waktu janji temu."
                : "Aesthetic Pondok Indah Dental Clinic menghargai dan melindungi privasi setiap pasien dan pengunjung website kami.\n\n1. Informasi yang Kami Kumpulkan\nKami mengumpulkan data nama, kontak telepon, email, dan riwayat kesehatan untuk keperluan pelayanan medis yang aman.\n\n2. Penggunaan Informasi\nInformasi medis hanya digunakan oleh tim dokter yang berwenang demi keselamatan dan kenyamanan tindakan.",
        ];

        return response()->json($setting ? $setting->value : $default);
    }
}
