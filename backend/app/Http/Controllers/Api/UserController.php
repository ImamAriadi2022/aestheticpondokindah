<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->whereIn('role', ['user', 'patient'])
            ->with('profile')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $u) {
                // Clean up domicile name (remove Kabupaten/Kota)
                $domicile = $u->city;
                if ($domicile) {
                    $domicile = preg_replace('/^(kabupaten|kota)\s+/i', '', $domicile);
                    $domicile = trim($domicile);
                }

                return [
                    'id' => (string) $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->whatsapp,
                    'domicile' => $domicile,
                    'membership_status' => $u->membership_status ?? 'regular',
                    'role' => $u->role,
                    'created_at' => optional($u->created_at)->toISOString(),
                    // Extended profile fields
                    'birthDate' => optional($u->birth_date)->format('Y-m-d'),
                    'gender' => $u->gender,
                    'bloodType' => $u->blood_type,
                    'job' => $u->job,
                    'address' => $u->address_line,
                    'province' => $u->province,
                    'city' => $u->city,
                    'district' => $u->district,
                    'postalCode' => $u->postal_code,
                    'interests' => $u->profile?->interests ?? $u->interests ?? [],
                    'consumptionHabits' => $u->profile?->consumption_habits ?? [],
                    'isCoffeeDrinker' => in_array('coffee_tea', $u->profile?->consumption_habits ?? []) || (bool) $u->is_coffee_drinker,
                    'isSmoker' => in_array('smoker', $u->profile?->consumption_habits ?? []) || (bool) $u->is_smoker,
                    'sourceInfo' => $u->source_info,
                    'insuranceProvider' => $u->insurance_provider,
                    'dentalComplaints' => $u->profile?->dental_complaints ?? [],
                    'desiredServices' => $u->profile?->desired_services ?? [],
                    'currentDentalConditions' => $u->profile?->current_dental_conditions ?? [],
                    'lastDentalVisit' => $u->profile?->last_dental_visit,
                    'lifestyleInterests' => $u->profile?->lifestyle_interests ?? [],
                    'treatmentGoals' => $u->profile?->treatment_goals ?? [],
                    'preferredCommunicationChannels' => $u->profile?->preferred_communication_channels ?? [],
                ];
            })
            ->values();

        return response()->json($users);
    }

    /**
     * Display the specified resource.
     */
    public function doctors()
    {
        $doctors = User::query()
            ->where('role', 'doctor')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $u) {
                $domicile = $u->city;
                if ($domicile) {
                    $domicile = preg_replace('/^(kabupaten|kota)\s+/i', '', $domicile);
                    $domicile = trim($domicile);
                }

                return [
                    'id' => (string) $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->whatsapp,
                    'domicile' => $domicile,
                    'membership_status' => $u->membership_status ?? 'regular',
                    'role' => $u->role,
                    'created_at' => optional($u->created_at)->toISOString(),
                    'birthDate' => optional($u->birth_date)->format('Y-m-d'),
                    'gender' => $u->gender,
                    'bloodType' => $u->blood_type,
                    'job' => $u->job,
                    'address' => $u->address_line,
                    'province' => $u->province,
                    'city' => $u->city,
                    'district' => $u->district,
                    'postalCode' => $u->postal_code,
                    'interests' => $u->interests ?? [],
                    'isCoffeeDrinker' => $u->is_coffee_drinker,
                    'isSmoker' => $u->is_smoker,
                    'sourceInfo' => $u->source_info,
                    'insuranceProvider' => $u->insurance_provider,
                ];
            })
            ->values();

        return response()->json($doctors);
    }

    public function storeDoctor(Request $request): JsonResponse
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
            'role' => 'doctor',
            'status' => 'active',
            'city' => $request->city,
            'province' => $request->province,
            'district' => $request->district,
            'address_line' => $request->address ?? ($request->district ? ($request->district . ', ' . $request->city . ', ' . $request->province) : null),
            'postal_code' => $request->postalCode,
            'birth_date' => $request->birthDate,
            'gender' => $request->gender,
            'blood_type' => $request->blood_type,
            'job' => $request->job,
            'interests' => $request->interests ?? [],
            'is_coffee_drinker' => $request->boolean('isCoffeeDrinker', false),
            'is_smoker' => $request->boolean('isSmoker', false),
            'source_info' => $request->sourceInfo,
            'insurance_provider' => $request->insuranceProvider,
        ]);

        return response()->json([
            'message' => 'Dokter berhasil ditambahkan',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->whatsapp,
                'domicile' => $user->city,
                'role' => $user->role,
                'created_at' => optional($user->created_at)->toISOString(),
            ],
        ], 201);
    }

    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'whatsapp' => 'nullable|string|max:20|unique:users,whatsapp,' . $user->id,
            'birthDate' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'bloodType' => 'nullable|string|max:5',
            'job' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'postalCode' => 'nullable|string|max:20',
            'interests' => 'nullable|array',
            'interests.*' => 'string|max:50',
            'isCoffeeDrinker' => 'nullable|boolean',
            'isSmoker' => 'nullable|boolean',
            'sourceInfo' => 'nullable|string|max:255',
            'insuranceProvider' => 'nullable|string|max:255',
            'membership_status' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'dentalComplaints' => 'nullable|array',
            'dentalComplaints.*' => 'string|max:100',
            'desiredServices' => 'nullable|array',
            'desiredServices.*' => 'string|max:100',
            'currentDentalConditions' => 'nullable|array',
            'currentDentalConditions.*' => 'string|max:100',
            'lastDentalVisit' => 'nullable|string|max:50',
            'consumptionHabits' => 'nullable|array',
            'consumptionHabits.*' => 'string|max:50',
            'lifestyleInterests' => 'nullable|array',
            'lifestyleInterests.*' => 'string|max:100',
            'treatmentGoals' => 'nullable|array',
            'treatmentGoals.*' => 'string|max:100',
            'preferredCommunicationChannels' => 'nullable|array',
            'preferredCommunicationChannels.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        DB::transaction(function () use ($user, $data) {
            if (array_key_exists('name', $data)) $user->name = $data['name'];
            if (array_key_exists('email', $data)) $user->email = $data['email'];
            if (array_key_exists('whatsapp', $data)) $user->whatsapp = $data['whatsapp'];
            if (array_key_exists('birthDate', $data)) $user->birth_date = $data['birthDate'];
            if (array_key_exists('gender', $data)) $user->gender = $data['gender'];
            if (array_key_exists('bloodType', $data)) $user->blood_type = $data['bloodType'];
            if (array_key_exists('job', $data)) $user->job = $data['job'];
            if (array_key_exists('address', $data)) $user->address_line = $data['address'];
            if (array_key_exists('province', $data)) $user->province = $data['province'];
            if (array_key_exists('city', $data)) $user->city = $data['city'];
            if (array_key_exists('district', $data)) $user->district = $data['district'];
            if (array_key_exists('postalCode', $data)) $user->postal_code = $data['postalCode'];
            if (array_key_exists('interests', $data)) $user->interests = $data['interests'];
            if (array_key_exists('isCoffeeDrinker', $data)) $user->is_coffee_drinker = $data['isCoffeeDrinker'];
            if (array_key_exists('isSmoker', $data)) $user->is_smoker = $data['isSmoker'];
            if (array_key_exists('sourceInfo', $data)) $user->source_info = $data['sourceInfo'];
            if (array_key_exists('insuranceProvider', $data)) $user->insurance_provider = $data['insuranceProvider'];
            if (array_key_exists('membership_status', $data)) $user->membership_status = $data['membership_status'];
            if (array_key_exists('password', $data) && !empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            $profileKeys = [
                'consumptionHabits',
                'dentalComplaints',
                'desiredServices',
                'currentDentalConditions',
                'lastDentalVisit',
                'lifestyleInterests',
                'treatmentGoals',
                'preferredCommunicationChannels',
                'interests',
            ];

            $shouldUpdateProfile = false;
            foreach ($profileKeys as $key) {
                if (array_key_exists($key, $data)) {
                    $shouldUpdateProfile = true;
                    break;
                }
            }

            $user->save();

            if (!$shouldUpdateProfile) {
                return;
            }

            /** @var UserProfile $profile */
            $profile = $user->profile()->firstOrNew();

            if (array_key_exists('dentalComplaints', $data)) {
                $complaints = is_array($data['dentalComplaints']) ? $data['dentalComplaints'] : [];
                if (in_array('no_special_complaint', $complaints, true)) {
                    $complaints = ['no_special_complaint'];
                }
                $profile->dental_complaints = array_values(array_unique($complaints));
            }
            if (array_key_exists('desiredServices', $data)) {
                $services = is_array($data['desiredServices']) ? $data['desiredServices'] : [];
                $profile->desired_services = array_values(array_unique($services));
            }
            if (array_key_exists('currentDentalConditions', $data)) {
                $conditions = is_array($data['currentDentalConditions']) ? $data['currentDentalConditions'] : [];
                $profile->current_dental_conditions = array_values(array_unique($conditions));
            }
            if (array_key_exists('lastDentalVisit', $data)) {
                $profile->last_dental_visit = $data['lastDentalVisit'];
            }
            if (array_key_exists('lifestyleInterests', $data)) {
                $lifestyle = is_array($data['lifestyleInterests']) ? $data['lifestyleInterests'] : [];
                $profile->lifestyle_interests = array_values(array_unique($lifestyle));
            }
            if (array_key_exists('treatmentGoals', $data)) {
                $goals = is_array($data['treatmentGoals']) ? $data['treatmentGoals'] : [];
                $profile->treatment_goals = array_values(array_unique($goals));
            }
            if (array_key_exists('preferredCommunicationChannels', $data)) {
                $channels = is_array($data['preferredCommunicationChannels']) ? $data['preferredCommunicationChannels'] : [];
                $profile->preferred_communication_channels = array_values(array_unique($channels));
            }
            if (array_key_exists('interests', $data)) {
                $interests = is_array($data['interests']) ? $data['interests'] : [];
                $profile->interests = array_values(array_unique($interests));
            }
            if (array_key_exists('consumptionHabits', $data)) {
                $habits = is_array($data['consumptionHabits']) ? $data['consumptionHabits'] : [];
                $profile->consumption_habits = array_values(array_unique($habits));
                $user->is_coffee_drinker = in_array('coffee_tea', $habits, true);
                $user->is_smoker = in_array('smoker', $habits, true);
                $user->save();
            }

            $user->profile()->save($profile);
        });

        $user->loadMissing('profile');

        $domicile = $user->city;
        if ($domicile) {
            $domicile = preg_replace('/^(kabupaten|kota)\s+/i', '', $domicile);
            $domicile = trim($domicile);
        }

        return response()->json([
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->whatsapp,
            'domicile' => $domicile,
            'membership_status' => $user->membership_status ?? 'regular',
            'role' => $user->role,
            'created_at' => optional($user->created_at)->toISOString(),
            'birthDate' => optional($user->birth_date)->format('Y-m-d'),
            'gender' => $user->gender,
            'bloodType' => $user->blood_type,
            'job' => $user->job,
            'address' => $user->address_line,
            'province' => $user->province,
            'city' => $user->city,
            'district' => $user->district,
            'postalCode' => $user->postal_code,
            'interests' => $user->profile?->interests ?? $user->interests ?? [],
            'consumptionHabits' => $user->profile?->consumption_habits ?? [],
            'isCoffeeDrinker' => in_array('coffee_tea', $user->profile?->consumption_habits ?? []) || (bool) $user->is_coffee_drinker,
            'isSmoker' => in_array('smoker', $user->profile?->consumption_habits ?? []) || (bool) $user->is_smoker,
            'sourceInfo' => $user->source_info,
            'insuranceProvider' => $user->insurance_provider,
            'dentalComplaints' => $user->profile?->dental_complaints ?? [],
            'desiredServices' => $user->profile?->desired_services ?? [],
            'currentDentalConditions' => $user->profile?->current_dental_conditions ?? [],
            'lastDentalVisit' => $user->profile?->last_dental_visit,
            'lifestyleInterests' => $user->profile?->lifestyle_interests ?? [],
            'treatmentGoals' => $user->profile?->treatment_goals ?? [],
            'preferredCommunicationChannels' => $user->profile?->preferred_communication_channels ?? [],
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->password = Hash::make($request->string('password')->toString());
        $user->save();

        return response()->json(['message' => 'Password berhasil direset']);
    }

    public function showProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('profile');
        return response()->json($this->serialize($user));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'whatsapp' => 'nullable|string|max:20|unique:users,whatsapp,' . $user->id,
            'birthDate' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'bloodType' => 'nullable|string|max:5',
            'job' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'postalCode' => 'nullable|string|max:20',
            'interests' => 'nullable|array',
            'interests.*' => 'string|max:50',
            'isCoffeeDrinker' => 'nullable|boolean',
            'isSmoker' => 'nullable|boolean',
            'sourceInfo' => 'nullable|string|max:255',
            'insuranceProvider' => 'nullable|string|max:255',
            'dentalComplaints' => 'nullable|array',
            'dentalComplaints.*' => 'string|max:100',
            'desiredServices' => 'nullable|array',
            'desiredServices.*' => 'string|max:100',
            'currentDentalConditions' => 'nullable|array',
            'currentDentalConditions.*' => 'string|max:100',
            'lastDentalVisit' => 'nullable|string|max:50',
            'consumptionHabits' => 'nullable|array',
            'consumptionHabits.*' => 'string|max:50',
            'lifestyleInterests' => 'nullable|array',
            'lifestyleInterests.*' => 'string|max:100',
            'treatmentGoals' => 'nullable|array',
            'treatmentGoals.*' => 'string|max:100',
            'preferredCommunicationChannels' => 'nullable|array',
            'preferredCommunicationChannels.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('name', $data)) $user->name = $data['name'];
        if (array_key_exists('email', $data)) $user->email = $data['email'];
        if (array_key_exists('whatsapp', $data)) $user->whatsapp = $data['whatsapp'];
        if (array_key_exists('birthDate', $data)) $user->birth_date = $data['birthDate'];
        if (array_key_exists('gender', $data)) $user->gender = $data['gender'];
        if (array_key_exists('bloodType', $data)) $user->blood_type = $data['bloodType'];
        if (array_key_exists('job', $data)) $user->job = $data['job'];
        if (array_key_exists('address', $data)) $user->address_line = $data['address'];
        if (array_key_exists('province', $data)) $user->province = $data['province'];
        if (array_key_exists('city', $data)) $user->city = $data['city'];
        if (array_key_exists('district', $data)) $user->district = $data['district'];
        if (array_key_exists('postalCode', $data)) $user->postal_code = $data['postalCode'];
        if (array_key_exists('interests', $data)) $user->interests = $data['interests'];
        if (array_key_exists('isCoffeeDrinker', $data)) $user->is_coffee_drinker = $data['isCoffeeDrinker'];
        if (array_key_exists('isSmoker', $data)) $user->is_smoker = $data['isSmoker'];
        if (array_key_exists('sourceInfo', $data)) $user->source_info = $data['sourceInfo'];
        if (array_key_exists('insuranceProvider', $data)) $user->insurance_provider = $data['insuranceProvider'];

        $user->save();

        $profileKeys = [
            'interests',
            'consumptionHabits',
            'dentalComplaints',
            'desiredServices',
            'currentDentalConditions',
            'lastDentalVisit',
            'lifestyleInterests',
            'treatmentGoals',
            'preferredCommunicationChannels',
        ];

        $shouldUpdateProfile = false;
        foreach ($profileKeys as $key) {
            if (array_key_exists($key, $data)) {
                $shouldUpdateProfile = true;
                break;
            }
        }

        if ($shouldUpdateProfile) {
            /** @var UserProfile $profile */
            $profile = $user->profile()->firstOrNew();

            if (array_key_exists('dentalComplaints', $data)) {
                $complaints = is_array($data['dentalComplaints']) ? $data['dentalComplaints'] : [];
                if (in_array('no_special_complaint', $complaints, true)) {
                    $complaints = ['no_special_complaint'];
                }
                $profile->dental_complaints = array_values(array_unique($complaints));
            }
            if (array_key_exists('desiredServices', $data)) {
                $services = is_array($data['desiredServices']) ? $data['desiredServices'] : [];
                $profile->desired_services = array_values(array_unique($services));
            }
            if (array_key_exists('currentDentalConditions', $data)) {
                $conditions = is_array($data['currentDentalConditions']) ? $data['currentDentalConditions'] : [];
                $profile->current_dental_conditions = array_values(array_unique($conditions));
            }
            if (array_key_exists('lastDentalVisit', $data)) {
                $profile->last_dental_visit = $data['lastDentalVisit'];
            }
            if (array_key_exists('lifestyleInterests', $data)) {
                $lifestyle = is_array($data['lifestyleInterests']) ? $data['lifestyleInterests'] : [];
                $profile->lifestyle_interests = array_values(array_unique($lifestyle));
            }
            if (array_key_exists('treatmentGoals', $data)) {
                $goals = is_array($data['treatmentGoals']) ? $data['treatmentGoals'] : [];
                $profile->treatment_goals = array_values(array_unique($goals));
            }
            if (array_key_exists('preferredCommunicationChannels', $data)) {
                $channels = is_array($data['preferredCommunicationChannels']) ? $data['preferredCommunicationChannels'] : [];
                $profile->preferred_communication_channels = array_values(array_unique($channels));
            }
            if (array_key_exists('interests', $data)) {
                $interests = is_array($data['interests']) ? $data['interests'] : [];
                $profile->interests = array_values(array_unique($interests));
            }
            if (array_key_exists('consumptionHabits', $data)) {
                $habits = is_array($data['consumptionHabits']) ? $data['consumptionHabits'] : [];
                $profile->consumption_habits = array_values(array_unique($habits));
                // Sync backward to users table for backward compatibility
                $user->is_coffee_drinker = in_array('coffee_tea', $habits, true);
                $user->is_smoker = in_array('smoker', $habits, true);
                $user->save();
            }

            $user->profile()->save($profile);
            $user->loadMissing('profile');
        }

        return response()->json($this->serialize($user));
    }

    private function serialize(User $user): array
    {
        $user->loadMissing('profile');

        $domicile = $user->city;
        if ($domicile) {
            $domicile = preg_replace('/^(kabupaten|kota)\s+/i', '', $domicile);
            $domicile = trim($domicile);
        }

        $profile = $user->profile;

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->whatsapp,
            'domicile' => $domicile,
            'membership_status' => $user->membership_status ?? 'regular',
            'role' => $user->role,
            'created_at' => optional($user->created_at)->toISOString(),
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
