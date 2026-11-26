<?php

namespace App\Http\Controllers\Api\Guest\Service;

use App\Http\Controllers\Controller;
use App\Models\Guest\Service\ClinicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ClinicServicePublicController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Cache::remember('public_clinic_services_all', now()->addHours(6), function () {
            return ClinicService::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        });

        return response()->json($services);
    }

    public function show(string $slug): JsonResponse
    {
        $cacheKey = 'public_clinic_service_' . md5($slug);
        $service = Cache::remember($cacheKey, now()->addHours(6), function () use ($slug) {
            return ClinicService::where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();
        });

        return response()->json($service);
    }
}
