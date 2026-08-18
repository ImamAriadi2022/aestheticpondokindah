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
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:255'],
            'full_url' => ['nullable', 'string', 'max:1000'],
            'referrer' => ['nullable', 'string', 'max:1000'],
            'source' => ['nullable', 'string', 'max:50'],
            'campaign' => ['nullable', 'string', 'max:100'],
            'visitor_id' => ['nullable', 'string', 'max:64'],
            'device_type' => ['nullable', 'string', 'max:30'],
            'screen_resolution' => ['nullable', 'string', 'max:30'],
        ]);

        return PageVisit::create([
            'path' => $validated['path'],
            'full_url' => $validated['full_url'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
            'source' => $validated['source'] ?? 'direct',
            'campaign' => $validated['campaign'] ?? null,
            'visitor_id' => $validated['visitor_id'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_type' => $validated['device_type'] ?? null,
            'screen_resolution' => $validated['screen_resolution'] ?? null,
            'visited_at' => Carbon::now(),
        ]);
    }
}
