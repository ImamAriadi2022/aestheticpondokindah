<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegistrationController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email',
            'whatsapp' => 'required|string|max:20|unique:users,whatsapp',
            'password' => 'required|string|min:6',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:20',
            'blood_type' => 'nullable|string|max:5',
            'job' => 'nullable|string|max:255',
            'birthDate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'postalCode' => 'nullable|string|max:20',
            'interests' => 'nullable|array',
            'interests.*' => 'string|max:50',
            'isCoffeeDrinker' => 'nullable|boolean',
            'isSmoker' => 'nullable|boolean',
            'sourceInfo' => 'nullable|string|max:255',
            'insuranceProvider' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'whatsapp' => $request->whatsapp,
            'password' => Hash::make($request->password),
            'role' => 'patient',
            'status' => 'active',
            'membership_level' => 'bronze',
            'membership_status' => 'active',
            'membership_started_at' => now(),
            'city' => $request->city,
            'province' => $request->province,
            'district' => $request->district,
            'address_line' => $request->address ?? ($request->district ? ($request->district . ', ' . $request->city . ', ' . $request->province) : null),
            'postal_code' => $request->postalCode,
            'birth_date' => $request->birthDate,
            'gender' => $request->gender,
            'blood_type' => $request->blood_type,
            'job' => $request->job,
            'interests' => $request->interests,
            'is_coffee_drinker' => $request->isCoffeeDrinker,
            'is_smoker' => $request->isSmoker,
            'source_info' => $request->sourceInfo,
            'insurance_provider' => $request->insuranceProvider,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->loadMissing('profile');

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $this->serializeUser($user),
        ], 201);
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
}
