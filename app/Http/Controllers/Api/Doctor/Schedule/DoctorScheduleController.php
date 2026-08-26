<?php

namespace App\Http\Controllers\Api\Doctor\Schedule;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Schedule\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DoctorScheduleController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $doctorId = $request->query('doctorId');

        $query = DoctorSchedule::query()->with('user')->orderByDesc('date')->orderByDesc('created_at')->orderByDesc('id');
        if ($doctorId) {
            $query->where('user_id', $doctorId);
        }

        $items = $query->get()
            ->map(function (DoctorSchedule $s) {
                return [
                    'id' => (string) $s->id,
                    'doctorId' => (string) $s->user_id,
                    'doctorName' => $s->user?->name,
                    'date' => $s->date->format('Y-m-d'),
                    'displayDate' => $s->date->format('d F Y'),
                    'timeRange' => $s->time_range,
                    'location' => $s->location,
                    'totalSlots' => $s->total_slots,
                    'bookedSlots' => $s->booked_slots,
                    'slotsLeft' => $s->slots_left,
                    'isFull' => $s->is_full,
                    'createdAt' => optional($s->created_at)->toISOString(),
                ];
            })
            ->values();

        return response()->json($items);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time_range' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'total_slots' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $schedule = DoctorSchedule::create([
            'user_id' => $data['user_id'],
            'date' => $data['date'],
            'time_range' => $data['time_range'],
            'location' => $data['location'],
            'total_slots' => $data['total_slots'] ?? 10,
            'booked_slots' => 0,
        ]);

        return response()->json([
            'message' => 'Jadwal dokter berhasil ditambahkan',
            'schedule' => [
                'id' => (string) $schedule->id,
                'doctorId' => (string) $schedule->user_id,
                'date' => $schedule->date->format('Y-m-d'),
                'displayDate' => $schedule->date->format('d F Y'),
                'timeRange' => $schedule->time_range,
                'location' => $schedule->location,
                'totalSlots' => $schedule->total_slots,
                'bookedSlots' => $schedule->booked_slots,
                'slotsLeft' => $schedule->slots_left,
                'isFull' => $schedule->is_full,
            ],
        ], 201);
    }

    public function adminDestroy(DoctorSchedule $schedule): JsonResponse
    {
        $schedule->delete();
        return response()->json(['message' => 'Jadwal dokter berhasil dihapus']);
    }

    public function adminSync(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'schedules' => 'required|array',
            'schedules.*.date' => 'nullable|string',
            'schedules.*.day' => 'nullable|string',
            'schedules.*.displayDate' => 'nullable|string',
            'schedules.*.time' => 'required|string',
            'schedules.*.quota' => 'nullable|integer|min:1',
            'schedules.*.location' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = $request->input('user_id');
        $schedules = $request->input('schedules', []);

        $dayMap = [
            'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4,
            'Jumat' => 5, 'Sabtu' => 6, 'Minggu' => 7,
            'Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4,
            'Friday' => 5, 'Saturday' => 6, 'Sunday' => 7,
        ];

        // Clean future unbooked schedules to apply fresh recurring slots
        DoctorSchedule::where('user_id', $userId)
            ->where('booked_slots', 0)
            ->whereDate('date', '>=', now()->toDateString())
            ->delete();

        $created = 0;
        foreach ($schedules as $slot) {
            $specificDate = $slot['date'] ?? null;
            $dayName = $slot['day'] ?? 'Senin';
            $timeRange = $slot['time'] ?? '09:00 - 13:00';
            $quota = (int) ($slot['quota'] ?? 10);
            $location = !empty($slot['location']) ? $slot['location'] : 'Aesthetic Pondok Indah';

            if ($specificDate && preg_match('/^\d{4}-\d{2}-\d{2}$/', $specificDate)) {
                // If an exact date is specified, register directly for that date
                DoctorSchedule::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'date' => $specificDate,
                        'time_range' => $timeRange,
                    ],
                    [
                        'location' => $location,
                        'total_slots' => $quota,
                        'booked_slots' => 0,
                    ]
                );
                $created++;
            } else {
                $targetDayOfWeek = $dayMap[$dayName] ?? 1;
                for ($week = 0; $week < 4; $week++) {
                    $targetDate = now()->startOfWeek()->addWeeks($week)->addDays($targetDayOfWeek - 1);
                    if ($targetDate->toDateString() < now()->toDateString()) {
                        continue;
                    }

                    DoctorSchedule::firstOrCreate(
                        [
                            'user_id' => $userId,
                            'date' => $targetDate->toDateString(),
                            'time_range' => $timeRange,
                        ],
                        [
                            'location' => $location,
                            'total_slots' => $quota,
                            'booked_slots' => 0,
                        ]
                    );
                    $created++;
                }
            }
        }

        return response()->json([
            'message' => 'Jadwal sesi praktik dokter berhasil disinkronkan',
            'created_count' => $created,
        ]);
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $doctorId = $request->query('doctorId') ?? $request->query('doctor_id');
        $date = $request->query('date');
        $startDate = $request->query('startDate') ?? $request->query('start_date');

        $query = DoctorSchedule::query()
            ->whereHas('user', function ($q) {
                $q->where('status', 'active');
            })
            ->with('user')
            ->orderBy('date')
            ->orderBy('time_range');

        if ($doctorId) {
            $query->where('user_id', $doctorId);
        }

        if ($date) {
            $query->whereDate('date', $date);
        } elseif ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        }

        $items = $query->get()
            ->filter(function (DoctorSchedule $s) {
                return !$s->is_full;
            })
            ->map(function (DoctorSchedule $s) {
                return [
                    'id' => (string) $s->id,
                    'doctorId' => (string) $s->user_id,
                    'doctorName' => $s->user?->name,
                    'date' => $s->date->format('Y-m-d'),
                    'displayDate' => $s->date->format('d F Y'),
                    'timeRange' => $s->time_range,
                    'location' => $s->location,
                    'totalSlots' => $s->total_slots,
                    'bookedSlots' => $s->booked_slots,
                    'slotsLeft' => $s->slots_left,
                    'isFull' => $s->is_full,
                ];
            })
            ->values();

        return response()->json($items);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = DoctorSchedule::query()->with('user');

        if ($user) {
            $hasSpecific = DoctorSchedule::where('user_id', $user->id)->exists();
            if ($hasSpecific) {
                $query->where('user_id', $user->id);
            } else {
                $query->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhereHas('user', function ($uq) use ($user) {
                          $uq->where('name', 'LIKE', '%' . $user->name . '%')
                             ->orWhere('role', 'doctor');
                      });
                });
            }
        }

        $schedules = $query
            ->orderByDesc('date')
            ->orderByDesc('time_range')
            ->orderByDesc('id')
            ->get()
            ->map(function (DoctorSchedule $s) {
                return [
                    'id' => (string) $s->id,
                    'userId' => (string) $s->user_id,
                    'doctorId' => (string) $s->user_id,
                    'doctorName' => $s->user?->name ?? 'Dokter Spesialis',
                    'date' => $s->date->format('Y-m-d'),
                    'displayDate' => $s->date->format('d F Y'),
                    'timeRange' => $s->time_range,
                    'location' => $s->location ?? 'Aesthetic Pondok Indah',
                    'totalSlots' => (int) $s->total_slots,
                    'bookedSlots' => (int) $s->booked_slots,
                    'slotsLeft' => (int) $s->slots_left,
                    'isFull' => (bool) $s->is_full,
                    'createdAt' => optional($s->created_at)->toISOString(),
                ];
            })
            ->values();

        return response()->json($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        if (!isset($data['timeRange']) && isset($data['time_range'])) {
            $data['timeRange'] = $data['time_range'];
        }
        if (!isset($data['totalSlots']) && isset($data['total_slots'])) {
            $data['totalSlots'] = $data['total_slots'];
        }
        if (empty($data['location'])) {
            $data['location'] = 'Aesthetic Pondok Indah';
        }

        $validator = Validator::make($data, [
            'date' => 'required|date',
            'timeRange' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'totalSlots' => 'required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = DoctorSchedule::create([
            'user_id' => $request->user()->id,
            'date' => $data['date'],
            'time_range' => $data['timeRange'],
            'location' => $data['location'],
            'total_slots' => $data['totalSlots'],
            'booked_slots' => 0,
        ]);

        return response()->json([
            'message' => 'Jadwal berhasil ditambahkan',
            'schedule' => [
                'id' => (string) $schedule->id,
                'userId' => (string) $schedule->user_id,
                'date' => $schedule->date->format('Y-m-d'),
                'displayDate' => $schedule->date->format('d F Y'),
                'timeRange' => $schedule->time_range,
                'location' => $schedule->location,
                'totalSlots' => $schedule->total_slots,
                'bookedSlots' => $schedule->booked_slots,
                'slotsLeft' => $schedule->slots_left,
                'isFull' => $schedule->is_full,
                'createdAt' => optional($schedule->created_at)->toISOString(),
            ],
        ], 201);
    }

    public function show(Request $request, DoctorSchedule $schedule): JsonResponse
    {
        $user = $request->user();
        $hasAccess = (int) $schedule->user_id === (int) $user->id
            || ($schedule->user && $schedule->user->name === $user->name);

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'id' => (string) $schedule->id,
            'userId' => (string) $schedule->user_id,
            'date' => $schedule->date->format('Y-m-d'),
            'displayDate' => $schedule->date->format('d F Y'),
            'timeRange' => $schedule->time_range,
            'location' => $schedule->location,
            'totalSlots' => $schedule->total_slots,
            'bookedSlots' => $schedule->booked_slots,
            'slotsLeft' => $schedule->slots_left,
            'isFull' => $schedule->is_full,
            'createdAt' => optional($schedule->created_at)->toISOString(),
        ]);
    }

    public function update(Request $request, DoctorSchedule $schedule): JsonResponse
    {
        $user = $request->user();
        $hasAccess = (int) $schedule->user_id === (int) $user->id
            || ($schedule->user && $schedule->user->name === $user->name);

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'nullable|date',
            'timeRange' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'totalSlots' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('date', $data)) $schedule->date = $data['date'];
        if (array_key_exists('timeRange', $data)) $schedule->time_range = $data['timeRange'];
        if (array_key_exists('location', $data)) $schedule->location = $data['location'];
        if (array_key_exists('totalSlots', $data)) {
            $schedule->total_slots = $data['totalSlots'];
        }

        $schedule->save();

        return response()->json([
            'message' => 'Jadwal berhasil diperbarui',
            'schedule' => [
                'id' => (string) $schedule->id,
                'userId' => (string) $schedule->user_id,
                'date' => $schedule->date->format('Y-m-d'),
                'displayDate' => $schedule->date->format('d F Y'),
                'timeRange' => $schedule->time_range,
                'location' => $schedule->location,
                'totalSlots' => $schedule->total_slots,
                'bookedSlots' => $schedule->booked_slots,
                'slotsLeft' => $schedule->slots_left,
                'isFull' => $schedule->is_full,
                'createdAt' => optional($schedule->created_at)->toISOString(),
            ],
        ]);
    }

    public function destroy(Request $request, DoctorSchedule $schedule): JsonResponse
    {
        $user = $request->user();
        $hasAccess = (int) $schedule->user_id === (int) $user->id
            || ($schedule->user && $schedule->user->name === $user->name);

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus']);
    }
}
