<?php

namespace App\Http\Controllers\Api\Guest\Settings;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;

class ClinicSettingPublicController extends Controller
{
    /**
     * GET /api/public/settings
     * Returns all public-safe clinic settings (key => value pairs).
     */
    public function index(): JsonResponse
    {
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

        $settings = ClinicSetting::whereIn('key', $allowedKeys)
            ->get(['key', 'value', 'label'])
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        return response()->json($settings);
    }
}
