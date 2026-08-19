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

        $query = DoctorSchedule::query()->with('user')->orderBy('date')->orderBy('time_range');
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

    public function publicIndex(Request $request): JsonResponse
    {
        $doctorId = $request->query('doctorId') ?? $request->query('doctor_id');
        $date = $request->query('date');
        $startDate = $request->query('startDate') ?? $request->query('start_date');

        $query = DoctorSchedule::query()
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
        $schedules = DoctorSchedule::query()
            ->where('user_id', $user->id)
            ->orderBy('date')
            ->orderBy('time_range')
            ->get()
            ->map(function (DoctorSchedule $s) {
                return [
                    'id' => (string) $s->id,
                    'userId' => (string) $s->user_id,
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
        if ($schedule->user_id !== $request->user()->id) {
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
        if ($schedule->user_id !== $request->user()->id) {
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
        if ($schedule->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus']);
    }
}
