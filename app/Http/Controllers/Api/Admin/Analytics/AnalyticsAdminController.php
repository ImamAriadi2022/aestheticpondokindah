<?php

namespace App\Http\Controllers\Api\Admin\Analytics;

use App\Http\Controllers\Controller;
use App\Models\Admin\Analytics\PageVisit;
use App\Models\Shared\Reservation\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsAdminController extends Controller
{
    public function summary(Request $request)
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
            ->get()
            ->map(function ($row) {
                return [
                    'label' => (string) $row->source,
                    'value' => (int) $row->visits,
                ];
            })
            ->values();

        $totalVisitors = array_sum($visitors);
        $totalVisits = PageVisit::query()->whereBetween('visited_at', [$from, $to])->count();
        $bookingStatus = Reservation::query()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['status' => (string) $row->status, 'count' => (int) $row->count])
            ->values();
        $topPages = PageVisit::query()
            ->whereBetween('visited_at', [$from, $to])
            ->selectRaw('COALESCE(NULLIF(landing_page, ""), "/") as page, COUNT(*) as views')
            ->groupBy('page')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => ['page' => (string) $row->page, 'views' => (int) $row->views])
            ->values();

        return response()->json([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'daily' => [
                'labels' => $labels,
                'visitors' => $visitors,
            ],
            'sources' => $sources,
            'totals' => [
                'visitors' => $totalVisitors,
                'visits' => $totalVisits,
                'bookings' => (int) $bookingStatus->sum('count'),
            ],
            'booking_status' => $bookingStatus,
            'top_pages' => $topPages,
        ]);
    }
}
