<?php

namespace App\Services\Admin\Settings;

use App\Models\Admin\Settings\ClinicSetting;

class ClinicSettingAdminService
{
    public function getAll(): array
    {
        return ClinicSetting::query()->get()->keyBy('key')->map(fn ($s) => $s->value)->toArray();
    }

    public function getByKey(string $key)
    {
        $setting = ClinicSetting::query()->where('key', $key)->first();
        return $setting ? $setting->value : null;
    }

    public function updateKey(string $key, $value): ClinicSetting
    {
        return ClinicSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
