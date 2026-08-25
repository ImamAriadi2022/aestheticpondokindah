<?php

namespace App\Http\Controllers\Api\Guest\Home;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\PublicInfo\HomeAdminController;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;

class HomePublicController extends Controller
{
    private const KEY = 'clinic_home_content';

    public function show(): JsonResponse
    {
        $setting = ClinicSetting::where('key', self::KEY)->first();
        $default = HomeAdminController::getDefaultData();

        $merged = $setting && is_array($setting->value)
            ? array_merge($default, $setting->value)
            : $default;

        return response()->json($merged);
    }
}
