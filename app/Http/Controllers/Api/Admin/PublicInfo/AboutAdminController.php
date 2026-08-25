<?php

namespace App\Http\Controllers\Api\Admin\PublicInfo;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use App\Services\Shared\Media\ImageOptimizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AboutAdminController extends Controller
{
    private const KEY = 'clinic_about_profile';

    public static function getDefaultData(): array
    {
        return [
            'hero_title' => 'About The Company Aesthetic Pondok Indah',
            'hero_subtitle' => 'At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.',
            'story_tag' => 'Cerita Kami',
            'story_title' => 'Professional Care that Puts You First',
            'story_image' => '/about/tentang3.webp',
            'badge_title' => 'Top',
            'badge_subtitle' => 'Dental Clinic in Jakarta',
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
            'cta_whatsapp_text' => 'Konsultasi WhatsApp',
            'cta_whatsapp_url' => 'https://wa.me/6281990114949',
        ];
    }

    public function show(): JsonResponse
    {
        $setting = ClinicSetting::where('key', self::KEY)->first();
        $default = self::getDefaultData();

        $merged = $setting && is_array($setting->value)
            ? array_merge($default, $setting->value)
            : $default;

        return response()->json($merged);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hero_title' => ['required', 'string', 'max:255'],
            'hero_subtitle' => ['required', 'string'],
            'story_tag' => ['nullable', 'string', 'max:100'],
            'story_title' => ['required', 'string', 'max:255'],
            'story_image' => ['nullable', 'string'],
            'badge_title' => ['nullable', 'string', 'max:100'],
            'badge_subtitle' => ['nullable', 'string', 'max:255'],
            'story_paragraphs' => ['required', 'array'],
            'story_paragraphs.*' => ['string'],
            'stats' => ['required', 'array'],
            'stats.*.value' => ['required', 'string', 'max:50'],
            'stats.*.label' => ['required', 'string', 'max:100'],
            'stats.*.sublabel' => ['nullable', 'string', 'max:255'],
            'values' => ['required', 'array'],
            'values.*.title' => ['required', 'string', 'max:150'],
            'values.*.description' => ['required', 'string'],
            'cta_whatsapp_text' => ['nullable', 'string', 'max:255'],
            'cta_whatsapp_url' => ['nullable', 'string', 'max:500'],
        ]);

        // Process story image if base64 DataURL
        if (!empty($validated['story_image']) && str_starts_with($validated['story_image'], 'data:image')) {
            try {
                $stored = ImageOptimizationService::optimizeAndStore($validated['story_image'], 'about', 1920, 1920, 82);
                $validated['story_image'] = asset('storage/' . $stored);
            } catch (\Throwable $e) {
                // keep fallback
            }
        }

        $setting = ClinicSetting::updateOrCreate(
            ['key' => self::KEY],
            ['value' => $validated]
        );

        return response()->json([
            'message' => 'Profil dan halaman tentang kami berhasil diperbarui.',
            'about' => $setting->value,
        ]);
    }
}
