<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'whatsapp' => 'required|string|max:20',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        /** @var User|null $user */
        $user = User::query()->where('whatsapp', $request->string('whatsapp')->toString())->first();

        if (!$user || !Hash::check($request->string('password')->toString(), $user->password)) {
            return response()->json(['message' => 'WhatsApp atau password salah.'], 401);
        }

        if (($user->status ?? 'active') !== 'active') {
            return response()->json(['message' => 'Akun tidak aktif.'], 403);
        }

        $deviceName = $request->input('device_name') ?: 'web';
        $token = $user->createToken($deviceName)->plainTextToken;

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
}
