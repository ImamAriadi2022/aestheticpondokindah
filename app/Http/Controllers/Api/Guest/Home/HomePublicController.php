<?php

namespace App\Http\Controllers\Api\Guest\Home;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Admin\PublicInfo\HomeAdminController;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class HomePublicController extends Controller
{
    private const KEY = 'clinic_home_content';

    public function show(): JsonResponse
    {
        $merged = Cache::remember('public_home_content', now()->addHours(6), function () {
            $setting = ClinicSetting::where('key', self::KEY)->first();
            $default = HomeAdminController::getDefaultData();

            return $setting && is_array($setting->value)
                ? array_merge($default, $setting->value)
                : $default;
        });

        return response()->json($merged);
    }
}
