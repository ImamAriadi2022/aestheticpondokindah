<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\DoctorSchedule;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'treatment_interest' => ['nullable', 'string', 'max:255'],
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'doctor_schedule_id' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
            'date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string', 'max:20'],
            'complaint' => ['nullable', 'string', 'max:500'],
            'source' => ['nullable', 'string', 'max:50'],
        ]);

        $scheduleId = $validated['doctor_schedule_id'] ?? null;
        $doctorId = $validated['doctor_id'] ?? null;
        $date = $validated['date'] ?? null;

        // Strict Doctor Schedule Validation
        if ($scheduleId) {
            $schedule = DoctorSchedule::with('user')->find($scheduleId);
            if (!$schedule) {
                return response()->json(['message' => 'Jadwal praktik dokter tidak ditemukan.'], 422);
            }
            if ($schedule->is_full) {
                return response()->json(['message' => 'Jadwal praktik dokter pada tanggal dan jam ini sudah penuh. Silakan pilih jadwal lain.'], 422);
            }
            $doctorId = $schedule->user_id;
            $date = $schedule->date->format('Y-m-d');
            $preferredTime = $validated['preferred_time'] ?? $schedule->time_range;
        } elseif ($doctorId && $date) {
            $schedule = DoctorSchedule::with('user')
                ->where('user_id', $doctorId)
                ->whereDate('date', $date)
                ->first();

            if (!$schedule) {
                $doc = User::find($doctorId);
                $docName = $doc ? $doc->name : 'Dokter';
                return response()->json([
                    'message' => "Dokter {$docName} tidak memiliki jadwal praktik pada tanggal {$date}. Silakan pilih tanggal yang memiliki jadwal praktik aktif."
                ], 422);
            }

            if ($schedule->is_full) {
                return response()->json(['message' => 'Jadwal praktik dokter pada tanggal dan jam ini sudah penuh. Silakan pilih jadwal lain.'], 422);
            }

            $scheduleId = $schedule->id;
            $preferredTime = $validated['preferred_time'] ?? $schedule->time_range;
        } else {
            return response()->json(['message' => 'Silakan pilih dokter dan tanggal jadwal praktik yang tersedia.'], 422);
        }

        $reservation = DB::transaction(function () use ($validated, $doctorId, $scheduleId, $date, $preferredTime) {
            return Reservation::create([
                'user_id' => null,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'treatment_interest' => $validated['treatment_interest'] ?? null,
                'doctor_id' => $doctorId,
                'doctor_schedule_id' => $scheduleId,
                'date' => $date,
                'preferred_time' => $preferredTime,
                'complaint' => $validated['complaint'] ?? ($validated['treatment_interest'] ?? 'Permintaan Reservasi Guest'),
                'branch_name' => 'Aesthetic Pondok Indah Main Branch',
                'source' => $validated['source'] ?? 'guest_web',
                'status' => 'Baru',
                'payment_status' => 'Belum Bayar',
            ]);
        });

        $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'id' => (string) $reservation->id,
            'code' => $code,
            'name' => $reservation->name,
            'phone' => $reservation->phone,
            'email' => $reservation->email,
            'treatment_interest' => $reservation->treatment_interest,
            'doctor_id' => $reservation->doctor_id ? (string) $reservation->doctor_id : null,
            'doctor_schedule_id' => $reservation->doctor_schedule_id ? (string) $reservation->doctor_schedule_id : null,
            'date' => optional($reservation->date)->format('Y-m-d'),
            'preferred_time' => $reservation->preferred_time,
            'complaint' => $reservation->complaint,
            'status' => $reservation->status,
            'source' => $reservation->source,
            'message' => 'Reservasi Guest berhasil dibuat dan tersinkronisasi dengan jadwal dokter.',
            'registration_encouragement' => [
                'title' => 'Bergabunglah Menjadi Member Aesthetic Pondok Indah!',
                'benefits' => [
                    'Lacak status reservasi dan riwayat rekam medis digital secara real-time',
                    'Dapatkan poin membership tiap perawatan untuk ditukar promo menarik',
                    'Prioritas booking jadwal periksa dengan dokter spesialis',
                ],
                'register_link' => '/login?mode=register',
            ]
        ], 201);
    }
}
