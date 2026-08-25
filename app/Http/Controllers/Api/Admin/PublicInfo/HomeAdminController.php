<?php

namespace App\Http\Controllers\Api\Admin\PublicInfo;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use App\Services\Shared\Media\ImageOptimizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeAdminController extends Controller
{
    private const KEY = 'clinic_home_content';

    public static function getDefaultData(): array
    {
        return [
            'hero_tagline' => 'Aesthetic Pondok Indah Dental Clinic',
            'hero_headline_line1' => 'The solution to',
            'hero_headline_line2' => 'brighten your',
            'hero_headline_highlight' => 'smile',
            'hero_subheadline' => 'Smile Confidently with Veneers!',
            'hero_description' => 'Professional and Trusted Aesthetic Dentistry',
            'hero_promo_badge' => 'Get 10% Off When You Consult for Veneers This Month!',
            'hero_rating_text' => '180+ Satisfied Customer',
            'hero_image' => '/dokter/drg. Yulita Dora.webp',
            'floating_services_title' => 'Our Services Include:',
            'floating_services' => [
                'Aesthetic Dentistry Consultation',
                'Pre-Veneer',
                'Smile Design',
            ],
            'cta_whatsapp_text' => 'Konsultasi WhatsApp',
            'cta_whatsapp_url' => 'https://wa.me/6281990114949',
            'booking_button_text' => 'Jadwalkan Janji Temu',
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
            'hero_tagline' => ['nullable', 'string', 'max:255'],
            'hero_headline_line1' => ['required', 'string', 'max:255'],
            'hero_headline_line2' => ['nullable', 'string', 'max:255'],
            'hero_headline_highlight' => ['nullable', 'string', 'max:255'],
            'hero_subheadline' => ['nullable', 'string', 'max:255'],
            'hero_description' => ['nullable', 'string', 'max:500'],
            'hero_promo_badge' => ['nullable', 'string', 'max:255'],
            'hero_rating_text' => ['nullable', 'string', 'max:255'],
            'hero_image' => ['nullable', 'string'],
            'floating_services_title' => ['nullable', 'string', 'max:255'],
            'floating_services' => ['nullable', 'array'],
            'floating_services.*' => ['string', 'max:255'],
            'cta_whatsapp_text' => ['nullable', 'string', 'max:255'],
            'cta_whatsapp_url' => ['nullable', 'string', 'max:500'],
            'booking_button_text' => ['nullable', 'string', 'max:255'],
        ]);

        // Process hero image if base64 DataURL was uploaded
        if (!empty($validated['hero_image']) && str_starts_with($validated['hero_image'], 'data:image')) {
            try {
                $stored = ImageOptimizationService::optimizeAndStore($validated['hero_image'], 'hero', 1920, 1920, 82);
                $validated['hero_image'] = asset('storage/' . $stored);
            } catch (\Throwable $e) {
                // keep fallback
            }
        }

        $setting = ClinicSetting::updateOrCreate(
            ['key' => self::KEY],
            ['value' => $validated]
        );

        return response()->json([
            'message' => 'Konten beranda berhasil diperbarui.',
            'home' => $setting->value,
        ]);
    }
}
