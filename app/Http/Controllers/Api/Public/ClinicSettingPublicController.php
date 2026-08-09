<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ClinicSetting;
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
        ];

        $settings = ClinicSetting::whereIn('key', $allowedKeys)
            ->get(['key', 'value', 'label'])
            ->keyBy('key')
            ->map(fn($s) => $s->value);

        return response()->json($settings);
    }
}
