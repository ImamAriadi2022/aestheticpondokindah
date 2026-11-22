<?php

namespace App\Services\Guest\Analytics;

use App\Models\Admin\Analytics\PageVisit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AnalyticsVisitService
{
    private static ?bool $hasSessionIdColumn = null;

    /**
     * Record anonymous page visit / UTM acquisition event with session deduplication.
     *
     * @param Request $request
     * @return array{recorded: bool, visit: PageVisit}
     */
    public function recordVisit(Request $request): array
    {
        $rawLandingPath = $request->input('landing_path')
            ?? $request->input('landing_page')
            ?? $request->input('landingPage')
            ?? $request->input('path')
            ?? '/';

        $landingPage = $this->normalizePath((string) $rawLandingPath);

        $rawReferrer = $request->input('referrer') ?? $request->header('referer');
        $referrer = is_string($rawReferrer) && trim($rawReferrer) !== ''
            ? substr(trim($rawReferrer), 0, 1000)
            : null;

        $rawSource = $request->input('utm_source')
            ?? $request->input('utmSource')
            ?? $request->input('source');

        $source = $this->resolveSource(is_string($rawSource) ? $rawSource : null, $referrer);

        $rawMedium = $request->input('utm_medium')
            ?? $request->input('utmMedium')
            ?? $request->input('medium');
        $medium = $this->normalizeToken(is_string($rawMedium) ? $rawMedium : null, 50);

        $rawCampaign = $request->input('utm_campaign')
            ?? $request->input('utmCampaign')
            ?? $request->input('campaign');
        $campaign = $this->normalizeToken(is_string($rawCampaign) ? $rawCampaign : null, 100);

        $rawVisitorId = $request->input('visitor_id') ?? $request->input('visitorId');
        $visitorId = is_string($rawVisitorId) && trim($rawVisitorId) !== ''
            ? substr(trim($rawVisitorId), 0, 64)
            : null;

        $rawSessionId = $request->input('session_id') ?? $request->input('sessionId');
        $sessionId = is_string($rawSessionId) && trim($rawSessionId) !== ''
            ? substr(trim($rawSessionId), 0, 100)
            : null;

        $supportsSessionId = $this->supportsSessionId();

        // Deduplicate within the same browsing session for identical UTM attribution
        if ($supportsSessionId && $sessionId !== null) {
            $existingQuery = PageVisit::query()
                ->where('session_id', $sessionId)
                ->where('source', $source)
                ->where('visited_at', '>=', Carbon::now()->subHours(24));

            if ($medium === null) {
                $existingQuery->whereNull('medium');
            } else {
                $existingQuery->where('medium', $medium);
            }

            if ($campaign === null) {
                $existingQuery->whereNull('campaign');
            } else {
                $existingQuery->where('campaign', $campaign);
            }

            $existing = $existingQuery->first();
            if ($existing) {
                return [
                    'recorded' => false,
                    'visit' => $existing,
                ];
            }
        }

        $payload = [
            'visitor_id' => $visitorId,
            'source' => $source,
            'medium' => $medium,
            'campaign' => $campaign,
            'referrer' => $referrer,
            'landing_page' => $landingPage,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'visited_at' => Carbon::now(),
        ];

        if ($supportsSessionId) {
            $payload['session_id'] = $sessionId;
        }

        $visit = PageVisit::create($payload);

        return [
            'recorded' => true,
            'visit' => $visit,
        ];
    }

    private function supportsSessionId(): bool
    {
        if (self::$hasSessionIdColumn === null) {
            try {
                self::$hasSessionIdColumn = Schema::hasColumn('page_visits', 'session_id');
            } catch (\Throwable $e) {
                self::$hasSessionIdColumn = false;
            }
        }

        return self::$hasSessionIdColumn;
    }

    private function normalizeToken(?string $value, int $maxLength): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = mb_strtolower(trim($value), 'UTF-8');
        if ($normalized === '') {
            return null;
        }

        return substr($normalized, 0, $maxLength);
    }

    private function normalizePath(string $path): string
    {
        $trimmed = trim($path);
        if ($trimmed === '') {
            return '/';
        }

        // Strip full URL down to pathname if a full URL was sent
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            $parsedPath = parse_url($trimmed, PHP_URL_PATH);
            $trimmed = is_string($parsedPath) && $parsedPath !== '' ? $parsedPath : '/';
        }

        if (!str_starts_with($trimmed, '/')) {
            $trimmed = '/' . $trimmed;
        }

        return substr($trimmed, 0, 255);
    }

    private function resolveSource(?string $rawSource, ?string $referrer): string
    {
        $normalized = $this->normalizeToken($rawSource, 50);

        // Treat explicit non-direct utm_source as authoritative
        if ($normalized !== null && $normalized !== 'direct') {
            return $this->canonicalizeSourceAlias($normalized);
        }

        // If utm_source was empty or defaulted to 'direct', inspect referrer fallback
        if ($referrer !== null) {
            $host = mb_strtolower((string) (parse_url($referrer, PHP_URL_HOST) ?? ''), 'UTF-8');
            $refLower = mb_strtolower($referrer, 'UTF-8');

            // Ignore self-referrers from the clinic domain or local dev hosts
            if (
                $host !== ''
                && !str_contains($host, 'aestheticpondokindah.com')
                && $host !== 'localhost'
                && $host !== '127.0.0.1'
            ) {
                if (str_contains($host, 'instagram') || str_contains($refLower, 'l.instagram')) {
                    return 'instagram';
                }
                if (str_contains($host, 'facebook') || str_contains($host, 'fb.com') || str_contains($host, 'fb.me')) {
                    return 'facebook';
                }
                if (str_contains($host, 'tiktok')) {
                    return 'tiktok';
                }
                if (str_contains($host, 'google')) {
                    return 'google';
                }
                if (str_contains($host, 'whatsapp') || str_contains($host, 'wa.me')) {
                    return 'whatsapp';
                }
                if (str_contains($host, 'youtube') || str_contains($host, 'youtu.be')) {
                    return 'youtube';
                }

                return 'other';
            }
        }

        return 'direct';
    }

    private function canonicalizeSourceAlias(string $source): string
    {
        return match ($source) {
            'ig', 'insta', 'l.instagram.com', 'instagram.com' => 'instagram',
            'fb', 'm.facebook.com', 'l.facebook.com', 'facebook.com' => 'facebook',
            'tt', 'tiktok.com', 'vm.tiktok.com' => 'tiktok',
            'wa', 'wa.me', 'whatsapp.com' => 'whatsapp',
            'yt', 'youtu.be', 'youtube.com' => 'youtube',
            'google.com', 'google.co.id' => 'google',
            default => $source,
        };
    }
}
