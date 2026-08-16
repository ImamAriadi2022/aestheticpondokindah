<?php

namespace App\Http\Controllers\Api\Guest\Service;

use App\Http\Controllers\Controller;
use App\Models\Guest\Service\ClinicService;
use Illuminate\Http\JsonResponse;

class ClinicServicePublicController extends Controller
{
    public function index(): JsonResponse
    {
        $services = ClinicService::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json($services);
    }

    public function show(string $slug): JsonResponse
    {
        $service = ClinicService::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($service);
    }
}
