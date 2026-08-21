<?php

namespace AppHttpControllersApiAdminSettings;

use AppHttpControllersController;
use AppModelsAdminSettingsClinicSetting;
use IlluminateHttpJsonResponse;
use IlluminateHttpRequest;

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
        $setting = ClinicSetting::where('key', $key)->first();
        if (!$setting) {
            return response()->json(['key' => $key, 'value' => null]);
        }
        return response()->json($setting);
    }

    /**
     * PUT /api/admin/clinic-settings/{key}
     * Update or create a setting value by key.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $value = $request->input('value', $request->all());
        if ($request->has('value')) {
            $value = $request->input('value');
        }

        $type = is_array($value) ? 'json' : 'text';

        $setting = ClinicSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'label' => $request->input('label', ucwords(str_replace('_', ' ', $key))),
                'description' => $request->input('description', null),
            ]
        );

        return response()->json([
            'message' => 'Pengaturan ' . $key . ' berhasil disimpan ke database.',
            'setting' => $setting->fresh(),
        ]);
    }

    /**
     * POST /api/admin/clinic-settings/batch
     * Save multiple settings at once.
     */
    public function saveBatch(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);
        $updated = [];

        foreach ($settings as $key => $val) {
            $type = is_array($val) ? 'json' : 'text';
            $setting = ClinicSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $val,
                    'type' => $type,
                    'label' => ucwords(str_replace('_', ' ', $key)),
                ]
            );
            $updated[$key] = $setting->value;
        }

        return response()->json([
            'message' => 'Seluruh pengaturan klinik berhasil disimpan ke database.',
            'data' => $updated,
        ]);
    }
}
