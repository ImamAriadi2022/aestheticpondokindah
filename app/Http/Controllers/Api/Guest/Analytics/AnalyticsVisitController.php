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
        $request->validate([
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:150'],
            'landing_path' => ['nullable', 'string', 'max:255'],
            'landing_page' => ['nullable', 'string', 'max:255'],
            'landingPage' => ['nullable', 'string', 'max:255'],
            'path' => ['nullable', 'string', 'max:255'],
            'session_id' => ['nullable', 'string', 'max:120'],
            'sessionId' => ['nullable', 'string', 'max:120'],
            'visitor_id' => ['nullable', 'string', 'max:100'],
            'visitorId' => ['nullable', 'string', 'max:100'],
            'referrer' => ['nullable', 'string', 'max:1000'],
            'source' => ['nullable', 'string', 'max:100'],
            'utmSource' => ['nullable', 'string', 'max:100'],
            'utmMedium' => ['nullable', 'string', 'max:100'],
            'utmCampaign' => ['nullable', 'string', 'max:150'],
        ]);

        $result = $this->analyticsVisitService->recordVisit($request);

        return response()->json([
            'success' => true,
            'recorded' => $result['recorded'],
            'source' => $result['visit']->source,
        ], $result['recorded'] ? 201 : 200);
    }
}
