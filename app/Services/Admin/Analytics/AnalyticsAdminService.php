<?php

namespace App\Services\Admin\Analytics;

use App\Models\Admin\Analytics\PageVisit;
use App\Models\Shared\Reservation\Reservation;
use Carbon\Carbon;

class AnalyticsAdminService
{
    /**
     * Generate summary metrics and daily trends for admin dashboard.
     *
     * @param Carbon $from
     * @param Carbon $to
     * @return array
     */
    public function getSummary(Carbon $from, Carbon $to): array
    {
        $maxDays = 183;
        if ($from->diffInDays($to) + 1 > $maxDays) {
            $to = (clone $from)->addDays($maxDays - 1)->endOfDay();
        }

        $daily = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('DATE(visited_at) as day')
            ->selectRaw('COUNT(*) as visits')
            ->selectRaw('COUNT(DISTINCT COALESCE(visitor_id, CONCAT(ip_address, "|", SUBSTRING(user_agent, 1, 120)))) as visitors')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $dailyMap = $daily->keyBy('day');

        $labels = [];
        $visitors = [];
        $visits = [];
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $labels[] = $key;
            $row = $dailyMap->get($key);
            $visitors[] = (int) ($row->visits ?? $row->visitors ?? 0);
            $visits[] = (int) ($row->visits ?? 0);
            $cursor->addDay();
        }

        $sources = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('COALESCE(source, "direct") as source')
            ->selectRaw('COUNT(*) as visits')
            ->groupBy('source')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn ($s) => ['label' => (string) $s->source, 'value' => (int) $s->visits])
            ->values();

        // Total page visits/clicks in range
        $totalVisits = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->count();

        // Total all-time page visits as dynamic traffic counter
        $allTimeVisits = PageVisit::query()->count();
        $effectiveTotalVisitors = max($totalVisits, $allTimeVisits);

        $totalReservations = Reservation::query()
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $conversionRate = 0.0;
        if ($effectiveTotalVisitors > 0) {
            $conversionRate = round(($totalReservations / $effectiveTotalVisitors) * 100, 2);
        }

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_visitors' => (int) $effectiveTotalVisitors,
            'total_reservations' => (int) $totalReservations,
            'conversion_rate' => $conversionRate,
            'totals' => [
                'visitors' => (int) $effectiveTotalVisitors,
                'visits' => (int) $effectiveTotalVisitors,
                'bookings' => (int) $totalReservations,
            ],
            'daily' => [
                'labels' => $labels,
                'visitors' => $visitors,
            ],
            'traffic_trend' => [
                'labels' => $labels,
                'visitors' => $visitors,
            ],
            'sources' => $sources,
        ];
    }
}
