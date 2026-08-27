<?php

namespace App\Http\Controllers\Api\Guest\About;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\PublicInfo\AboutAdminController;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;

class AboutPublicController extends Controller
{
    private const KEY = 'clinic_about_profile';

    public function show(): JsonResponse
    {
        $setting = ClinicSetting::where('key', self::KEY)->first();
        $default = AboutAdminController::getDefaultData();

        if ($setting && is_array($setting->value)) {
            $saved = $setting->value;
            $merged = array_merge($default, $saved);

            // Explicitly preserve empty arrays from saved data
            foreach (['stats', 'values', 'story_paragraphs'] as $arrayKey) {
                if (array_key_exists($arrayKey, $saved)) {
                    $merged[$arrayKey] = is_array($saved[$arrayKey]) ? $saved[$arrayKey] : [];
                }
            }

            return response()->json($merged);
        }

        return response()->json($default);
    }
}
