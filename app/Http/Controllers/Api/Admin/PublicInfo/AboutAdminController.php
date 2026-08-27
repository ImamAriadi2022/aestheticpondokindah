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

        if ($setting && is_array($setting->value)) {
            $saved = $setting->value;
            $merged = array_merge($default, $saved);

            // Explicitly preserve empty arrays — array_merge cannot distinguish
            // between "key missing" and "key present but empty array []".
            // We must check if the key exists in the saved value and override.
            foreach (['stats', 'values', 'story_paragraphs'] as $arrayKey) {
                if (array_key_exists($arrayKey, $saved)) {
                    $merged[$arrayKey] = is_array($saved[$arrayKey]) ? $saved[$arrayKey] : [];
                }
            }

            return response()->json($merged);
        }

        return response()->json($default);
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
            'story_paragraphs' => ['nullable', 'array'],
            'story_paragraphs.*' => ['string'],
            'stats' => ['nullable', 'array'],
            'stats.*.value' => ['required', 'string', 'max:50'],
            'stats.*.label' => ['required', 'string', 'max:100'],
            'stats.*.sublabel' => ['nullable', 'string', 'max:255'],
            'values' => ['nullable', 'array'],
            'values.*.title' => ['required', 'string', 'max:150'],
            'values.*.description' => ['required', 'string'],
            'cta_whatsapp_text' => ['nullable', 'string', 'max:255'],
            'cta_whatsapp_url' => ['nullable', 'string', 'max:500'],
        ]);

        // Always ensure these keys exist even if sent as null / missing
        $validated['stats'] = $request->has('stats') ? ($validated['stats'] ?? []) : [];
        $validated['values'] = $request->has('values') ? ($validated['values'] ?? []) : [];
        $validated['story_paragraphs'] = $request->has('story_paragraphs') ? ($validated['story_paragraphs'] ?? []) : [];

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
            ['value' => $validated, 'type' => 'json']
        );

        // Return the saved data merged with defaults so the response is always complete
        $saved = is_array($setting->value) ? $setting->value : [];
        $responseData = array_merge(self::getDefaultData(), $saved);
        foreach (['stats', 'values', 'story_paragraphs'] as $arrayKey) {
            if (array_key_exists($arrayKey, $saved)) {
                $responseData[$arrayKey] = is_array($saved[$arrayKey]) ? $saved[$arrayKey] : [];
            }
        }

        return response()->json([
            'message' => 'Profil dan halaman tentang kami berhasil diperbarui.',
            'about' => $responseData,
        ]);
    }
}
