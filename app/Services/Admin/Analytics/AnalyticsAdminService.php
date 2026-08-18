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
            ->selectRaw('COUNT(DISTINCT COALESCE(visitor_id, CONCAT(ip_address, "|", SUBSTRING(user_agent, 1, 120)))) as visitors')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $dailyMap = $daily->keyBy('day');

        $labels = [];
        $visitors = [];
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $labels[] = $key;
            $visitors[] = (int) optional($dailyMap->get($key))->visitors;
            $cursor->addDay();
        }

        $sources = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('COALESCE(source, "unknown") as source')
            ->selectRaw('COUNT(*) as visits')
            ->groupBy('source')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();

        $totalVisitors = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('COUNT(DISTINCT COALESCE(visitor_id, CONCAT(ip_address, "|", SUBSTRING(user_agent, 1, 120)))) as total')
            ->value('total');

        $totalReservations = Reservation::query()
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $conversionRate = 0.0;
        if ($totalVisitors && $totalVisitors > 0) {
            $conversionRate = round(($totalReservations / $totalVisitors) * 100, 2);
        }

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_visitors' => (int) ($totalVisitors ?? 0),
            'total_reservations' => (int) $totalReservations,
            'conversion_rate' => $conversionRate,
            'traffic_trend' => [
                'labels' => $labels,
                'visitors' => $visitors,
            ],
            'sources' => $sources,
        ];
    }
}
