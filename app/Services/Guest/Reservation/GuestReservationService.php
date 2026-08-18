<?php

namespace App\Services\Guest\Reservation;

use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Reservation\ReservationAudit;
use App\Models\Shared\User\User;
use App\Services\Shared\Notification\NotificationService;
use Illuminate\Support\Facades\DB;

class GuestReservationService
{
    public function createReservation(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            // Find existing user by phone if available
            $userId = null;
            if (!empty($data['phone'])) {
                $user = User::query()->where('whatsapp', $data['phone'])->first();
                if ($user) {
                    $userId = $user->id;
                }
            }

            $reservation = Reservation::create([
                'user_id' => $userId,
                'doctor_id' => $data['doctor_id'] ?? null,
                'doctor_schedule_id' => $data['doctor_schedule_id'] ?? null,
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'gender' => $data['gender'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'treatment_interest' => $data['treatment_interest'] ?? null,
                'complaint' => $data['complaint'] ?? null,
                'date' => $data['date'],
                'preferred_time' => $data['preferred_time'] ?? null,
                'branch_name' => $data['branch_name'] ?? null,
                'source' => 'guest',
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            ReservationAudit::create([
                'reservation_id' => $reservation->id,
                'action' => 'created',
                'new_status' => 'pending',
                'notes' => 'Reservasi dibuat oleh tamu',
            ]);

            NotificationService::sendToAdmins(
                'Reservasi Baru Masuk',
                "Reservasi baru dari {$reservation->name} untuk tanggal {$reservation->date}",
                'reservation',
                '/dashboard/clinic?tab=reservasi',
                ['reservation_id' => (string) $reservation->id]
            );

            return $reservation;
        });
    }
}
