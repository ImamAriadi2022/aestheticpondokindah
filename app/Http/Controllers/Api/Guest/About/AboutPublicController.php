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

        $merged = $setting && is_array($setting->value)
            ? array_merge($default, $setting->value)
            : $default;

        return response()->json($merged);
    }
}
