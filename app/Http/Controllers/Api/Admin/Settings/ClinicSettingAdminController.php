<?php

namespace App\Http\Controllers\Api\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\Admin\Settings\ClinicSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicSettingAdminController extends Controller
{
    /**
     * GET /api/admin/clinic-settings
     * List all clinic settings.
     */
    public function index(): JsonResponse
    {
        $settings = ClinicSetting::orderBy('key')->get();
        return response()->json(['settings' => $settings]);
    }

    /**
     * GET /api/admin/clinic-settings/{key}
     * Get a single setting by key.
     */
    public function show(string $key): JsonResponse
    {
        $setting = ClinicSetting::where('key', $key)->firstOrFail();
        return response()->json($setting);
    }

    /**
     * PUT /api/admin/clinic-settings/{key}
     * Update a setting value by key.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $setting = ClinicSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'value' => ['nullable', 'string', 'max:10000'],
        ]);

        $setting->update(['value' => $validated['value'] ?? null]);

        return response()->json([
            'message' => 'Setting berhasil diperbarui.',
            'setting' => $setting->fresh(),
        ]);
    }
}
