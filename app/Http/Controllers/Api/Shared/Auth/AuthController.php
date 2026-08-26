<?php

namespace App\Http\Controllers\Api\Shared\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shared\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'nullable|string|max:100',
            'email' => 'nullable|string|max:100',
            'whatsapp' => 'nullable|string|max:100',
            'identifier' => 'nullable|string|max:100',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $identifier = trim((string) (
            $request->input('login')
            ?: ($request->input('email')
            ?: ($request->input('identifier')
            ?: $request->input('whatsapp')))
        ));

        if (empty($identifier)) {
            return response()->json(['message' => 'Email atau nomor WhatsApp wajib diisi.'], 422);
        }

        /** @var User|null $user */
        $user = User::query()
            ->where(function ($q) use ($identifier) {
                $q->where('email', $identifier)
                  ->orWhere('whatsapp', $identifier);
            })
            ->first();

        if (!$user || !Hash::check($request->string('password')->toString(), $user->password)) {
            return response()->json(['message' => 'Email/WhatsApp atau password salah.'], 401);
        }

        if (($user->status ?? 'active') !== 'active' && $user->role !== 'doctor') {
            return response()->json(['message' => 'Akun tidak aktif.'], 403);
        }

        $deviceName = $request->input('device_name') ?: 'web';
        $token = $user->createToken($deviceName, ['*'], now()->addDays(10))->plainTextToken;

        $user->loadMissing('profile');

        return response()->json([
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Delete current token and issue a fresh one valid for 10 days
        $user->currentAccessToken()?->delete();

        $deviceName = $request->input('device_name') ?: 'web';
        $token = $user->createToken($deviceName, ['*'], now()->addDays(10))->plainTextToken;

        $user->loadMissing('profile');

        return response()->json([
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->loadMissing('profile');

        return response()->json([
            'user' => $this->serializeUser($user),
        ]);
    }

    private function serializeUser(User $user): array
    {
        if ($user->role === 'doctor') {
            return [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->whatsapp,
                'whatsapp' => $user->whatsapp,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar,
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'is_active' => ($user->status ?? 'active') === 'active',
                'str' => $user->str_number ?? '',
                'str_number' => $user->str_number ?? '',
                'strNumber' => $user->str_number ?? '',
                'sip' => $user->sip_number ?? '',
                'sip_number' => $user->sip_number ?? '',
                'sipNumber' => $user->sip_number ?? '',
                'specialization' => $user->specialization ?? 'Dokter Gigi Spesialis',
                'speciality' => $user->specialization ?? 'Dokter Gigi Spesialis',
                'education' => $user->education ?? 'FKG Universitas Indonesia (UI)',
                'experienceYears' => $user->experience_years ?? 5,
                'experience_years' => $user->experience_years ?? 5,
                'bio' => $user->bio ?? '',
                'primaryBranch' => $user->primary_branch ?? 'Aesthetic Pondok Indah - Cabang Utama',
                'primary_branch' => $user->primary_branch ?? 'Aesthetic Pondok Indah - Cabang Utama',
                'consultationFee' => (float) ($user->consultation_fee ?? 250000),
                'consultation_fee' => (float) ($user->consultation_fee ?? 250000),
            ];
        }

        $profile = $user->profile;

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'whatsapp' => $user->whatsapp,
            'role' => $user->role,
            'status' => $user->status,
            'birthDate' => optional($user->birth_date)->format('Y-m-d'),
            'gender' => $user->gender,
            'bloodType' => $user->blood_type,
            'job' => $user->job,
            'address' => $user->address_line,
            'province' => $user->province,
            'city' => $user->city,
            'district' => $user->district,
            'postalCode' => $user->postal_code,
            'interests' => $profile?->interests ?? $user->interests ?? [],
            'isCoffeeDrinker' => in_array('coffee_tea', $profile?->consumption_habits ?? []),
            'isSmoker' => in_array('smoker', $profile?->consumption_habits ?? []),
            'sourceInfo' => $user->source_info,
            'insuranceProvider' => $user->insurance_provider,
            'membership_level' => $user->membership_level ?? 'bronze',
            'membership_status' => $user->membership_status ?? 'active',
            'membership_points' => (int) ($user->membership_points ?? 0),
            'dentalComplaints' => $profile?->dental_complaints ?? [],
            'desiredServices' => $profile?->desired_services ?? [],
            'currentDentalConditions' => $profile?->current_dental_conditions ?? [],
            'lastDentalVisit' => $profile?->last_dental_visit,
            'lifestyleInterests' => $profile?->lifestyle_interests ?? [],
            'treatmentGoals' => $profile?->treatment_goals ?? [],
            'preferredCommunicationChannels' => $profile?->preferred_communication_channels ?? [],
        ];
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Semua sesi login berhasil diakhiri.']);
    }
}
