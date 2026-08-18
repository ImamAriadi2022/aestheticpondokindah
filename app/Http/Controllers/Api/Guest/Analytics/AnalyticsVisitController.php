<?php

namespace App\Http\Controllers\Api\Guest\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Guest\Analytics\AnalyticsVisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsVisitController extends Controller
{
    public function __construct(private readonly AnalyticsVisitService $analyticsVisitService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $this->analyticsVisitService->recordVisit($request);

        return response()->json(['success' => true]);
    }
}
