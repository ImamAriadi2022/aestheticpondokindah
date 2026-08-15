<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ClinicSetting;
use Illuminate\Http\JsonResponse;

class AboutPublicController extends Controller
{
    private const KEY = 'clinic_about_profile';

    public function show(): JsonResponse
    {
        $setting = ClinicSetting::where('key', self::KEY)->first();
        $default = [
            'hero_title' => 'About The Company Aesthetic Pondok Indah',
            'hero_subtitle' => 'At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.',
            'story_title' => 'Professional Care that Puts You First',
            'story_paragraphs' => [
                'Aesthetic Pondok Indah Dental Clinic didirikan dengan visi menghadirkan perawatan gigi berstandar tinggi yang mengutamakan kenyamanan, estetika alami, dan kesehatan jangka panjang.',
                'Dengan tim dokter spesialis berpengalaman dan teknologi modern, kami berkomitmen memberikan perawatan yang personal dan presisi untuk setiap pasien.',
            ],
            'stats' => [
                ['value' => '15+', 'label' => 'Tahun Pengalaman', 'sublabel' => 'Melayani dengan standar terbaik'],
                ['value' => '10k+', 'label' => 'Pasien Bahagia', 'sublabel' => 'Tersenyum lebih percaya diri'],
                ['value' => '25+', 'label' => 'Dokter Spesialis', 'sublabel' => 'Berpengalaman & tersertifikasi'],
                ['value' => '99%', 'label' => 'Tingkat Kepuasan', 'sublabel' => 'Ulasan positif dari pasien'],
            ],
            'values' => [
                ['title' => 'Patient-Centered Excellence', 'description' => 'Kenyamanan dan kepuasan pasien adalah prioritas mutlak kami dalam setiap tindakan.'],
                ['title' => 'Modern Technology', 'description' => 'Peralatan berstandar internasional untuk diagnosa akurat dan tindakan minim rasa sakit.'],
                ['title' => 'Highest Hygiene Standards', 'description' => 'Proses sterilisasi multi-tahap demi menjaga keamanan dan kebersihan maksimal.'],
            ],
        ];

        return response()->json($setting ? $setting->value : $default);
    }
}
