<?php

namespace App\Services\Guest\Analytics;

use App\Models\Admin\Analytics\PageVisit;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AnalyticsVisitService
{
    /**
     * Record anonymous page visit event.
     *
     * @param Request $request
     * @return PageVisit
     */
    public function recordVisit(Request $request): PageVisit
    {
        $path = $request->input('path') ?? $request->input('landingPage') ?? $request->input('landing_page') ?? '/';
        $fullUrl = $request->input('full_url') ?? $request->input('fullUrl') ?? $request->fullUrl();
        $referrer = $request->input('referrer') ?? $request->header('referer');
        $source = $request->input('source') ?? $request->input('utmSource') ?? $request->input('utm_source') ?? 'direct';
        $campaign = $request->input('campaign') ?? $request->input('utmCampaign') ?? $request->input('utm_campaign');
        $visitorId = $request->input('visitor_id') ?? $request->input('visitorId');
        $deviceType = $request->input('device_type') ?? $request->input('deviceType');
        $screenResolution = $request->input('screen_resolution') ?? $request->input('screenResolution');

        return PageVisit::create([
            'path' => substr((string) $path, 0, 255),
            'full_url' => substr((string) $fullUrl, 0, 1000),
            'referrer' => $referrer ? substr((string) $referrer, 0, 1000) : null,
            'source' => substr((string) $source, 0, 50),
            'campaign' => $campaign ? substr((string) $campaign, 0, 100) : null,
            'visitor_id' => $visitorId ? substr((string) $visitorId, 0, 64) : null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'device_type' => $deviceType ? substr((string) $deviceType, 0, 30) : null,
            'screen_resolution' => $screenResolution ? substr((string) $screenResolution, 0, 30) : null,
            'visited_at' => Carbon::now(),
        ]);
    }
}
