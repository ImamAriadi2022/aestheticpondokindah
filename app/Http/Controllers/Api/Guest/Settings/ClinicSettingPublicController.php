<?php

namespace App\Http\Controllers\Api\Guest\Settings;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ClinicSettingPublicController extends Controller
{
    /**
     * GET /api/public/settings
     * Returns all public-safe clinic settings (key => value pairs).
     */
    public function index(): JsonResponse
    {
        $settings = Cache::remember('public_clinic_settings', now()->addHours(6), function () {
            $allowedKeys = [
                'booking_terms',
                'booking_whatsapp_number',
                'clinic_general_info',
                'pdf_terms_and_conditions',
                'pdf_informed_consent',
                'clinic_about_profile',
                'clinic_legal_privacy_policy',
                'clinic_legal_terms_of_service',
            ];

            return ClinicSetting::whereIn('key', $allowedKeys)
                ->get(['key', 'value', 'label'])
                ->keyBy('key')
                ->map(fn($s) => $s->value);
        });

        return response()->json($settings);
    }
}
