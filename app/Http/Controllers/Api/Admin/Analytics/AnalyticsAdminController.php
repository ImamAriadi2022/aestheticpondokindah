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
