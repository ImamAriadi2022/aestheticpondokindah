<?php

namespace App\Http\Controllers\Api\Guest\Analytics;

use App\Http\Controllers\Controller;
use App\Models\Admin\Analytics\PageVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsVisitController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitorId' => ['nullable', 'string', 'max:64'],
            'referrer' => ['nullable', 'string'],
            'landingPage' => ['required', 'string', 'max:255'],
            'utmSource' => ['nullable', 'string', 'max:50'],
            'utmMedium' => ['nullable', 'string', 'max:50'],
            'utmCampaign' => ['nullable', 'string', 'max:100'],
        ]);

        $referrer = trim((string) ($validated['referrer'] ?? ''));
        $utmSource = strtolower(trim((string) ($validated['utmSource'] ?? '')));
        $utmMedium = strtolower(trim((string) ($validated['utmMedium'] ?? '')));
        $utmCampaign = trim((string) ($validated['utmCampaign'] ?? ''));

        $source = null;
        $medium = null;

        if ($utmSource !== '') {
            $source = $utmSource;
            $medium = $utmMedium !== '' ? $utmMedium : 'campaign';
        } else {
            $ref = strtolower($referrer);
            if ($ref === '') {
                $source = 'direct';
                $medium = 'direct';
            } elseif (Str::contains($ref, ['google.', 'bing.', 'yahoo.'])) {
                $source = 'search';
                $medium = 'organic';
            } elseif (Str::contains($ref, ['instagram.com'])) {
                $source = 'instagram';
                $medium = 'social';
            } elseif (Str::contains($ref, ['facebook.com', 'fb.com'])) {
                $source = 'facebook';
                $medium = 'social';
            } elseif (Str::contains($ref, ['tiktok.com'])) {
                $source = 'tiktok';
                $medium = 'social';
            } else {
                $source = 'referral';
                $medium = 'referral';
            }
        }

        PageVisit::create([
            'visitor_id' => $validated['visitorId'] ?? null,
            'source' => $source,
            'medium' => $medium,
            'campaign' => $utmCampaign !== '' ? $utmCampaign : null,
            'referrer' => $referrer !== '' ? $referrer : null,
            'landing_page' => $validated['landingPage'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'visited_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }
}
