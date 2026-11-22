<?php

namespace App\Services\Admin\Analytics;

use App\Models\Admin\Analytics\PageVisit;
use App\Models\Shared\Reservation\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class AnalyticsAdminService
{
    private static ?bool $hasSessionIdColumn = null;

    /**
     * Generate UTM Acquisition Overview metrics for the Admin Dashboard.
     *
     * @param Carbon $from
     * @param Carbon $to
     * @return array<string, mixed>
     */
    public function getOverview(Carbon $from, Carbon $to): array
    {
        $maxDays = 366;
        if ($from->diffInDays($to) + 1 > $maxDays) {
            $to = (clone $from)->addDays($maxDays - 1)->endOfDay();
        }

        $totalVisits = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->count();

        $distinctExpr = $this->supportsSessionId()
            ? 'COUNT(DISTINCT COALESCE(session_id, visitor_id, CONCAT(COALESCE(ip_address, ""), "|", SUBSTRING(COALESCE(user_agent, ""), 1, 120)))) as total'
            : 'COUNT(DISTINCT COALESCE(visitor_id, CONCAT(COALESCE(ip_address, ""), "|", SUBSTRING(COALESCE(user_agent, ""), 1, 120)))) as total';

        $uniqueRow = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw($distinctExpr)
            ->first();
        $uniqueVisitors = (int) ($uniqueRow->total ?? 0);

        // Previous period comparison (same number of days immediately before $from)
        $periodDays = (int) $from->copy()->startOfDay()->diffInDays($to->copy()->startOfDay()) + 1;
        $prevTo = $from->copy()->subDay()->endOfDay();
        $prevFrom = $prevTo->copy()->subDays(max($periodDays - 1, 0))->startOfDay();

        $previousVisits = PageVisit::query()
            ->whereBetween('visited_at', [$prevFrom, $prevTo])
            ->count();

        $growthPercentage = 0.0;
        if ($previousVisits > 0) {
            $growthPercentage = round((($totalVisits - $previousVisits) / $previousVisits) * 100, 1);
        } elseif ($totalVisits > 0) {
            $growthPercentage = 100.0;
        }

        // 1. Top Channels grouped by normalized utm_source
        $channelRows = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw("LOWER(COALESCE(NULLIF(TRIM(source), ''), 'direct')) as source_key")
            ->selectRaw('COUNT(*) as visits_count')
            ->groupBy('source_key')
            ->orderByDesc('visits_count')
            ->get();

        $topChannels = $channelRows->map(function ($row) use ($totalVisits) {
            $source = (string) ($row->source_key ?: 'direct');
            $count = (int) $row->visits_count;
            $percentage = $totalVisits > 0 ? round(($count / $totalVisits) * 100, 1) : 0.0;

            return [
                'source' => $source,
                'label' => $this->formatChannelLabel($source),
                'count' => $count,
                'percentage' => $percentage,
            ];
        })->values()->all();

        // 2. Daily Trend (zero-filled across the full date range)
        $dailyRows = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('DATE(visited_at) as day')
            ->selectRaw('COUNT(*) as visits_count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $dailyTrend = [];
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $dateStr = $cursor->toDateString();
            $row = $dailyRows->get($dateStr);
            $dailyTrend[] = [
                'date' => $dateStr,
                'count' => (int) ($row->visits_count ?? 0),
            ];
            $cursor->addDay();
        }

        // 3. Detailed UTM breakdown (source + medium + campaign)
        $detailRows = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw("LOWER(COALESCE(NULLIF(TRIM(source), ''), 'direct')) as utm_source")
            ->selectRaw("LOWER(NULLIF(TRIM(medium), '')) as utm_medium")
            ->selectRaw("LOWER(NULLIF(TRIM(campaign), '')) as utm_campaign")
            ->selectRaw('COUNT(*) as visits_count')
            ->groupBy('utm_source', 'utm_medium', 'utm_campaign')
            ->orderByDesc('visits_count')
            ->limit(100)
            ->get();

        $details = $detailRows->map(function ($row) use ($totalVisits) {
            $count = (int) $row->visits_count;
            $percentage = $totalVisits > 0 ? round(($count / $totalVisits) * 100, 1) : 0.0;

            return [
                'utm_source' => (string) ($row->utm_source ?: 'direct'),
                'utm_medium' => $row->utm_medium !== null ? (string) $row->utm_medium : null,
                'utm_campaign' => $row->utm_campaign !== null ? (string) $row->utm_campaign : null,
                'count' => $count,
                'percentage' => $percentage,
            ];
        })->values()->all();

        // 4. Top landing pages
        $topPages = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw("COALESCE(NULLIF(TRIM(landing_page), ''), '/') as page")
            ->selectRaw('COUNT(*) as views')
            ->groupBy('page')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'page' => (string) $r->page,
                'views' => (int) $r->views,
            ])
            ->values()
            ->all();

        // 5. Reservations & conversion rate
        $totalReservations = Reservation::query()
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $bookingStatus = Reservation::query()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("COALESCE(status, 'pending') as status")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($r) => [
                'status' => (string) $r->status,
                'count' => (int) $r->count,
            ])
            ->values()
            ->all();

        $conversionRate = $totalVisits > 0
            ? round(($totalReservations / $totalVisits) * 100, 2)
            : 0.0;

        return [
            'start_date' => $from->toDateString(),
            'end_date' => $to->toDateString(),
            'total_visits' => (int) $totalVisits,
            'unique_visitors' => $uniqueVisitors,
            'total_reservations' => (int) $totalReservations,
            'conversion_rate' => $conversionRate,
            'previous_period' => [
                'start_date' => $prevFrom->toDateString(),
                'end_date' => $prevTo->toDateString(),
                'total_visits' => (int) $previousVisits,
                'growth_percentage' => $growthPercentage,
            ],
            'top_channels' => $topChannels,
            'daily_trend' => $dailyTrend,
            'details' => $details,
            'top_pages' => $topPages,
            'booking_status' => $bookingStatus,
        ];
    }

    /**
     * Backward-compatible summary metrics for legacy dashboard widgets.
     *
     * @param Carbon $from
     * @param Carbon $to
     * @return array<string, mixed>
     */
    public function getSummary(Carbon $from, Carbon $to): array
    {
        $overview = $this->getOverview($from, $to);

        $labels = array_column($overview['daily_trend'], 'date');
        $visits = array_column($overview['daily_trend'], 'count');

        $sources = array_map(fn (array $ch) => [
            'label' => $ch['source'],
            'value' => $ch['count'],
        ], array_slice($overview['top_channels'], 0, 10));

        return [
            'from' => $overview['start_date'],
            'to' => $overview['end_date'],
            'total_visitors' => $overview['unique_visitors'],
            'total_visits' => $overview['total_visits'],
            'total_reservations' => $overview['total_reservations'],
            'conversion_rate' => $overview['conversion_rate'],
            'totals' => [
                'visitors' => $overview['unique_visitors'],
                'visits' => $overview['total_visits'],
                'bookings' => $overview['total_reservations'],
            ],
            'daily' => [
                'labels' => $labels,
                'visitors' => $visits,
            ],
            'traffic_trend' => [
                'labels' => $labels,
                'visitors' => $visits,
            ],
            'sources' => $sources,
            'top_channels' => $overview['top_channels'],
            'daily_trend' => $overview['daily_trend'],
            'details' => $overview['details'],
            'top_pages' => $overview['top_pages'],
            'booking_status' => $overview['booking_status'],
            'previous_period' => $overview['previous_period'],
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

    private function formatChannelLabel(string $source): string
    {
        return match ($source) {
            'instagram' => 'Instagram',
            'tiktok' => 'TikTok',
            'facebook' => 'Facebook',
            'google' => 'Google',
            'whatsapp' => 'WhatsApp',
            'youtube' => 'YouTube',
            'direct' => 'Direct',
            'other' => 'Other',
            default => ucfirst($source),
        };
    }
}
