<?php

namespace App\Services\Shared\Consultation;

use App\Services\Doctor\Visit\VisitService;
use App\Services\Doctor\MedicalRecord\MedicalRecordService;
use App\Services\Shared\Notification\NotificationService;
use App\Services\Shared\WhatsApp\ZestaWhatsAppService;
use App\Models\Shared\Consultation\Consultation;
use App\Models\Shared\Consultation\ConsultationMessage;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Shared\User\User;
use App\Models\Doctor\Visit\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConsultationService
{
    public function __construct(
        private readonly VisitService $visitService,
        private readonly MedicalRecordService $medicalRecordService,
    ) {
    }

    /**
     * Create an instant (quick) consultation.
     * Accepts either a logged-in patient or an anonymous guest identity.
     */
    public function createQuick(array $validated, ?User $patient, ?array $guestIdentity = null): Consultation
    {
        $isGuest = $patient === null;

        $consultation = Consultation::create([
            'user_id' => $patient?->id,
            'type' => 'quick',
            'status' => 'Menunggu',
            'topic' => $validated['topic'] ?? null,
            'category' => $validated['category'] ?? null,
            'chief_complaint' => $validated['chiefComplaint'],
            'duration' => $validated['duration'] ?? null,
            'pain_scale' => $validated['painScale'] ?? null,
            'allergies' => $validated['allergies'] ?? null,
            'medications' => $validated['medications'] ?? null,
            'prior_treatment' => $validated['priorTreatment'] ?? null,
            'preferred_contact' => $validated['preferredContact'] ?? null,
            'contact_number' => $validated['contactNumber'] ?? null,
            'expectations' => $validated['expectations'] ?? null,
            'attachments' => $validated['attachments'] ?? null,
            'guest_name' => $isGuest ? ($guestIdentity['name'] ?? null) : null,
            'guest_phone' => $isGuest ? ($guestIdentity['phone'] ?? null) : null,
            'guest_email' => $isGuest ? ($guestIdentity['email'] ?? null) : null,
            'access_token' => $isGuest ? Str::random(48) : null,
        ]);

        if ($isGuest) {
            $this->seedGreeting($consultation, $guestIdentity['name'] ?? 'Bapak/Ibu');
        }

        // Generate instant AI Dental Health Assessment & Service Recommendation
        try {
            DentalAiConsultantService::generateInitialAssessment($consultation);
        } catch (\Throwable $e) {
            // Non-blocking
        }

        try {
            NotificationService::sendToAdmins(
                'Konsultasi Baru Menunggu',
                $consultation->participant_name . ' mengirim konsultasi instan: ' . ($consultation->topic ?? 'Keluhan gigi'),
                'consultation',
                '/dashboard/clinic?tab=konsultasi',
                ['consultation_id' => (string) $consultation->id]
            );
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return $consultation;
    }

    /**
     * Admin accepts an instant consultation and starts handling it.
     */
    public function accept(Consultation $consultation, User $admin): Consultation
    {
        $consultation->admin_id = $admin->id;
        if ($consultation->status === 'Menunggu') {
            $consultation->status = 'Dibuka';
        }
        $consultation->save();

        $this->notifyPatient($consultation, 'Konsultasi Diterima', 'Konsultasi Anda sedang ditangani oleh admin kami.', 'accepted');

        return $consultation->fresh();
    }

    /**
     * Admin rejects an instant consultation.
     */
    public function reject(Consultation $consultation, User $admin, ?string $reason = null): Consultation
    {
        $consultation->admin_id = $admin->id;
        $consultation->status = 'Ditolak';
        if ($reason !== null) {
            $consultation->notes = $reason;
        }
        $consultation->save();

        $this->notifyPatient($consultation, 'Konsultasi Ditolak', $reason ?: 'Mohon maaf, konsultasi Anda tidak dapat diproses.', 'rejected');

        return $consultation->fresh();
    }

    /**
     * Transfer a consultation to a doctor (from admin or self-service).
     */
    public function transferToDoctor(Consultation $consultation, User $doctor): Consultation
    {
        $consultation->doctor_id = $doctor->id;
        $consultation->doctor_name = $doctor->name;
        if ($consultation->status === 'Menunggu') {
            $consultation->status = 'Dibuka';
        }
        $consultation->save();

        NotificationService::send(
            (int) $doctor->id,
            'Konsultasi Diteruskan ke Anda',
            $consultation->participant_name . ' menunggu Anda di ruang konsultasi: ' . ($consultation->topic ?? 'Konsultasi'),
            'consultation',
            '/dashboard/doctor?tab=konsultasi',
            ['consultation_id' => (string) $consultation->id]
        );

        return $consultation->fresh();
    }

    /**
     * Doctor starts a scheduled consultation:
     * status Dijadwalkan -> Dibuka and a Visit + Medical Record are created.
     */
    public function start(Consultation $consultation, User $doctor): Consultation
    {
        if (!$consultation->doctor_id) {
            $consultation->doctor_id = $doctor->id;
            $consultation->doctor_name = $doctor->name;
        }

        $visit = $this->ensureVisit($consultation);
        $consultation->visit_id = $visit->id;
        $consultation->status = 'Dibuka';
        $consultation->save();

        try {
            $this->visitService->transitionStatus($visit, 'in_progress');
        } catch (\Throwable $e) {
            // Medical record may already exist; proceed with the visit transition.
        }

        $this->notifyPatient($consultation, 'Konsultasi Dimulai', 'Dokter sudah memulai sesi konsultasi Anda. Silakan bergabung ke link meeting.', 'started');

        return $consultation->fresh(['visit', 'reservation']);
    }

    /**
     * Complete a consultation. When the linked visit is in progress,
     * the visit and its medical record are finalized as well.
     */
    public function complete(Consultation $consultation): Consultation
    {
        $consultation->status = 'Selesai';
        $consultation->save();

        $consultation->messages()->whereNull('read_at')->update(['read_at' => now()]);

        $visit = $consultation->visit;
        if ($visit && $visit->status === 'in_progress') {
            try {
                $this->visitService->transitionStatus($visit, 'completed');
            } catch (\Throwable $e) {
                // ignore terminal-state guard
            }
        }

        if ($visit && $visit->medicalRecord) {
            $record = $visit->medicalRecord;
            if (in_array($record->status, ['draft', 'in_progress'], true)) {
                try {
                    $this->medicalRecordService->transitionStatus($record, 'finalized');
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        }

        $this->notifyPatient($consultation, 'Konsultasi Selesai', 'Terima kasih, konsultasi Anda telah diselesaikan.', 'completed');

        return $consultation->fresh(['visit.medicalRecord']);
    }

    public function sendMessage(Consultation $consultation, ?User $sender, string $role, string $body, ?array $attachments = null): ConsultationMessage
    {
        if (is_array($attachments)) {
            $processed = [];
            foreach ($attachments as $item) {
                if (is_string($item) && str_starts_with($item, 'data:image')) {
                    try {
                        $stored = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($item, 'consultations', 1600, 1600, 82);
                        $processed[] = asset('storage/' . $stored);
                    } catch (\Throwable $e) {
                        $processed[] = $item;
                    }
                } else {
                    $processed[] = $item;
                }
            }
            $attachments = $processed;
        }

        $message = $consultation->messages()->create([
            'sender_id' => $sender?->id,
            'sender_role' => $role,
            'body' => $body,
            'attachments' => $attachments,
        ]);

        $this->notifyRecipients($consultation, $sender, $role, $body);
        $this->dispatchZestaWhatsApp($consultation, $sender, $role, $body);

        // If message is sent by patient/guest, trigger AI Dental Consultant reply
        if ($role === 'patient') {
            try {
                DentalAiConsultantService::generateChatReply($consultation, $body);
            } catch (\Throwable $e) {
                // Non-blocking
            }
        }

        return $message;
    }

    /**
     * Dispatch WhatsApp message to patient via Zesta API when doctor/admin replies.
     */
    private function dispatchZestaWhatsApp(Consultation $consultation, ?User $sender, string $role, string $body): void
    {
        // Only trigger WhatsApp forwarding when admin or doctor sends a message to patient/guest
        if (!in_array($role, ['admin', 'doctor'], true)) {
            return;
        }

        try {
            $patientPhone = $consultation->guest_phone 
                ?: ($consultation->user?->whatsapp ?: ($consultation->user?->phone ?: $consultation->contact_number));

            if (empty($patientPhone)) {
                return;
            }

            $senderName = $sender?->name ?: ($role === 'doctor' ? 'Dokter Klinik' : 'Admin Klinik');
            $patientName = $consultation->participant_name;
            $preview = mb_substr($body, 0, 300);

            $chatUrl = $consultation->access_token
                ? url('/#/konsultasi/guest/' . $consultation->access_token)
                : url('/#/dashboard/user?tab=konsultasi');

            $waText = "Halo {$patientName},\n\n*{$senderName}* membalas pesan konsultasi Anda di Aesthetic Pondok Indah Dental:\n\n\"{$preview}\"\n\nSilakan klik tautan berikut untuk membuka ruang obrolan konsultasi:\n{$chatUrl}";

            ZestaWhatsAppService::sendTextMessage($patientPhone, $waText, $patientName);
        } catch (\Throwable $e) {
            // Fail-safe: external API error must never disrupt chat delivery
        }
    }

    /**
     * Ensure a Visit exists for a scheduled consultation (reusing the linked
     * reservation's visit when available).
     */
    private function ensureVisit(Consultation $consultation): Visit
    {
        if ($consultation->visit_id) {
            return $consultation->visit;
        }

        $reservation = $consultation->reservation;
        if ($reservation) {
            $visit = $this->visitService->findOrCreateFromReservation($reservation);
        } else {
            $visit = Visit::create([
                'visit_number' => 'VST-' . date('Ymd') . '-' . str_pad((string) $consultation->id, 6, '0', STR_PAD_LEFT),
                'patient_id' => $consultation->user_id,
                'doctor_id' => $consultation->doctor_id,
                'reservation_id' => $consultation->reservation_id,
                'status' => 'waiting',
                'visit_date' => $consultation->schedule_date ?? now(),
                'chief_complaint' => $consultation->chief_complaint,
            ]);
        }

        $consultation->visit_id = $visit->id;
        $consultation->save();

        return $visit;
    }

    private function seedGreeting(Consultation $consultation, string $name): void
    {
        $consultation->messages()->create([
            'sender_id' => null,
            'sender_role' => 'patient',
            'body' => 'Halo, saya ' . $name . '. ' . $consultation->chief_complaint,
            'read_at' => null,
        ]);
    }

    private function notifyRecipients(Consultation $consultation, ?User $sender, string $role, string $body): void
    {
        if ($role === 'patient') {
            if ($consultation->doctor_id) {
                NotificationService::send(
                    (int) $consultation->doctor_id,
                    'Pesan Baru dari Pasien',
                    $consultation->participant_name . ': ' . mb_substr($body, 0, 120),
                    'consultation',
                    '/dashboard/doctor?tab=konsultasi',
                    ['consultation_id' => (string) $consultation->id]
                );
            } else {
                NotificationService::sendToAdmins(
                    'Pesan Baru dari Pasien',
                    $consultation->participant_name . ': ' . mb_substr($body, 0, 120),
                    'consultation',
                    '/dashboard/clinic?tab=konsultasi',
                    ['consultation_id' => (string) $consultation->id],
                    $sender?->id
                );
            }

            return;
        }

        // Admin / doctor sending to the patient (registered only).
        if ($consultation->user_id) {
            NotificationService::send(
                (int) $consultation->user_id,
                'Balasan Baru dalam Konsultasi',
                mb_substr($body, 0, 120),
                'consultation',
                '/dashboard/user?tab=konsultasi',
                ['consultation_id' => (string) $consultation->id]
            );
        }
    }

    private function notifyPatient(Consultation $consultation, string $title, string $body, string $type): void
    {
        if ($consultation->user_id) {
            NotificationService::send(
                (int) $consultation->user_id,
                $title,
                $body,
                'consultation',
                '/dashboard/user?tab=konsultasi',
                ['consultation_id' => (string) $consultation->id]
            );
        }
    }

    public static function dto(Consultation $c): array
    {
        $dateStr = optional($c->created_at)->format('j F Y • H:i') ?? '-';

        $doctorId = $c->doctor_id
            ? (string) $c->doctor_id
            : ($c->doctorSchedule?->user_id ? (string) $c->doctorSchedule->user_id : null);

        $unreadCount = $c->messages()
            ->where('sender_role', '!=', 'patient')
            ->whereNull('read_at')
            ->count();

        return [
            'id' => (string) $c->id,
            'userId' => $c->user_id ? (string) $c->user_id : null,
            'user' => $c->user ? [
                'id' => (string) $c->user->id,
                'name' => $c->user->name,
                'email' => $c->user->email,
            ] : null,
            'isGuest' => $c->is_guest,
            'participantName' => $c->participant_name,
            'guestPhone' => $c->guest_phone,
            'doctorId' => $doctorId,
            'adminId' => $c->admin_id ? (string) $c->admin_id : null,
            'type' => $c->type,
            'status' => $c->status,
            'topic' => $c->topic ?: ($c->category ?: 'Konsultasi'),
            'category' => $c->category,
            'doctorName' => $c->doctorSchedule?->user?->name ?: ($c->doctor_name ?: 'Dokter Jaga'),
            'date' => $dateStr,
            'chiefComplaint' => $c->chief_complaint,
            'duration' => $c->duration,
            'painScale' => $c->pain_scale,
            'allergies' => $c->allergies,
            'medications' => $c->medications,
            'priorTreatment' => $c->prior_treatment,
            'preferredContact' => $c->preferred_contact,
            'contactNumber' => $c->contact_number,
            'expectations' => $c->expectations,
            'notes' => $c->notes,
            'scheduleDate' => optional($c->schedule_date)?->format('Y-m-d'),
            'scheduleTime' => $c->schedule_time,
            'location' => $c->location,
            'attachments' => $c->attachments ?? [],
            'reservationId' => $c->reservation_id ? (string) $c->reservation_id : null,
            'visitId' => $c->visit_id ? (string) $c->visit_id : null,
            'unreadCount' => $unreadCount,
            'createdAt' => optional($c->created_at)->toISOString(),
        ];
    }

    public static function messageDto(ConsultationMessage $m): array
    {
        return [
            'id' => (string) $m->id,
            'senderId' => $m->sender_id ? (string) $m->sender_id : null,
            'senderRole' => $m->sender_role,
            'senderName' => $m->sender_name,
            'body' => $m->body,
            'attachments' => $m->attachments ?? [],
            'readAt' => optional($m->read_at)->toISOString(),
            'createdAt' => optional($m->created_at)->toISOString(),
        ];
    }

    public static function meetingDto($m): array
    {
        return [
            'id' => (string) $m->id,
            'consultationId' => (string) $m->consultation_id,
            'provider' => $m->provider,
            'title' => $m->title,
            'url' => $m->url,
            'startsAt' => optional($m->starts_at)->toISOString(),
            'createdAt' => optional($m->created_at)->toISOString(),
        ];
    }
}
