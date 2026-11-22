<?php

namespace App\Http\Controllers\Api\Admin\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Admin\Analytics\AnalyticsAdminService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsAdminController extends Controller
{
    public function __construct(private readonly AnalyticsAdminService $analyticsService)
    {
    }

    public function overview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $rawStart = $validated['start_date'] ?? $validated['from'] ?? null;
        $rawEnd = $validated['end_date'] ?? $validated['to'] ?? null;

        $to = $rawEnd ? Carbon::parse($rawEnd)->endOfDay() : Carbon::now()->endOfDay();
        $from = $rawStart
            ? Carbon::parse($rawStart)->startOfDay()
            : $to->copy()->subDays(29)->startOfDay();

        if ($to->lt($from)) {
            return response()->json(['message' => 'Rentang tanggal tidak valid.'], 422);
        }

        $result = $this->analyticsService->getOverview($from, $to);

        return response()->json($result);
    }

    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
        ]);

        $from = Carbon::parse($validated['from'])->startOfDay();
        $to = Carbon::parse($validated['to'])->endOfDay();

        if ($to->lt($from)) {
            return response()->json(['message' => 'Rentang tanggal tidak valid.'], 422);
        }

        $result = $this->analyticsService->getSummary($from, $to);

        return response()->json($result);
    }
}
