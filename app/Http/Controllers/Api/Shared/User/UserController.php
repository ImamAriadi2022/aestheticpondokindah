<?php

namespace App\Http\Controllers\Api\Shared\User;

use App\Http\Controllers\Controller;
use App\Models\Shared\User\User;
use App\Models\Patient\Profile\UserProfile;
use App\Services\Patient\Membership\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }
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
                    'membership_status' => $u->membership_status ?? 'active',
                    'membership_level' => $u->membership_level ?? 'bronze',
                    'membership_points' => (int) ($u->membership_points ?? 0),
                    'membership_started_at' => optional($u->membership_started_at)->format('Y-m-d'),
                    'membership_expires_at' => optional($u->membership_expires_at)->format('Y-m-d'),
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

        return response()->json($users, 200, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
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
                    'whatsapp' => $u->whatsapp,
                    'domicile' => $domicile,
                    'membership_status' => $u->membership_status ?? 'active',
                    'role' => $u->role,
                    'avatar' => $this->formatMediaUrl($u->avatar),
                    'avatar_url' => $this->formatMediaUrl($u->avatar),
                    'specialization' => $u->specialization ?? 'Dokter Gigi Spesialis',
                    'speciality' => $u->specialization ?? 'Dokter Gigi Spesialis',
                    'str' => $u->str_number,
                    'str_number' => $u->str_number,
                    'sip' => $u->sip_number,
                    'sip_number' => $u->sip_number,
                    'education' => $u->education,
                    'experience_years' => $u->experience_years ?? 5,
                    'consultation_fee' => $u->consultation_fee ?? 250000,
                    'primary_branch' => $u->primary_branch ?? 'Aesthetic Pondok Indah - Cabang Utama',
                    'bio' => $u->bio,
                    'is_active' => $u->status === 'active',
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
                ];
            })
            ->values();

        return response()->json($doctors);
    }

    /**
     * Public doctors list for reservation and guest web
     */
    public function publicDoctors(): JsonResponse
    {
        $doctors = User::query()
            ->where('role', 'doctor')
            ->where('status', 'active')
            ->orderBy('id')
            ->get()
            ->map(function (User $u) {
                $photo = $this->formatMediaUrl($u->avatar);
                if (!$photo || !str_starts_with($photo, 'http')) {
                    $photo = '/dokter/' . $u->name . '.jpeg';
                }

                $exp = (int) ($u->experience_years ?: 5);

                return [
                    'id' => (string) $u->id,
                    'userId' => (string) $u->id,
                    'name' => $u->name,
                    'specialization' => $u->specialization ?: ($u->job ?: 'Dokter Gigi Spesialis'),
                    'university' => $u->education ?: 'Universitas Indonesia',
                    'education' => $u->education ?: 'Universitas Indonesia',
                    'experienceYears' => $exp,
                    'experience_years' => $exp,
                    'photo' => $photo,
                    'avatar' => $photo,
                    'bio' => $u->bio,
                    'primary_branch' => $u->primary_branch ?: 'Aesthetic Pondok Indah Main Branch',
                ];
            })
            ->values();

        return response()->json([
            'doctors' => $doctors,
        ]);
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
            'status' => $request->has('is_active') ? ($request->boolean('is_active') ? 'active' : 'inactive') : 'active',
            'specialization' => $request->specialization ?? 'Dokter Gigi Spesialis',
            'str_number' => $request->str ?? $request->str_number,
            'sip_number' => $request->sip ?? $request->sip_number,
            'education' => $request->education,
            'experience_years' => $request->experience_years,
            'consultation_fee' => $request->consultation_fee,
            'primary_branch' => $request->primary_branch,
            'bio' => $request->bio,
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
            'message' => 'Akun dokter berhasil dibuat',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->whatsapp,
                'specialization' => $user->specialization,
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
            'membership_level' => 'nullable|in:bronze,gold,platinum',
            'password' => 'nullable|string|min:6',
            'specialization' => 'nullable|string|max:255',
            'str' => 'nullable|string|max:100',
            'sip' => 'nullable|string|max:100',
            'education' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'consultation_fee' => 'nullable|numeric|min:0',
            'primary_branch' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'is_active' => 'nullable|boolean',
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

        DB::transaction(function () use ($user, $data, $request) {
            if (array_key_exists('name', $data)) $user->name = $data['name'];
            if (array_key_exists('email', $data)) $user->email = $data['email'];
            if (array_key_exists('whatsapp', $data)) $user->whatsapp = $data['whatsapp'];
            if (array_key_exists('specialization', $data)) $user->specialization = $data['specialization'];
            if (array_key_exists('str', $data)) $user->str_number = $data['str'];
            if (array_key_exists('sip', $data)) $user->sip_number = $data['sip'];
            if (array_key_exists('education', $data)) $user->education = $data['education'];
            if (array_key_exists('experience_years', $data)) $user->experience_years = $data['experience_years'];
            if (array_key_exists('consultation_fee', $data)) $user->consultation_fee = $data['consultation_fee'];
            if (array_key_exists('primary_branch', $data)) $user->primary_branch = $data['primary_branch'];
            if (array_key_exists('bio', $data)) $user->bio = $data['bio'];
            if (array_key_exists('is_active', $data)) {
                $user->status = $data['is_active'] ? 'active' : 'inactive';
            }
            if (array_key_exists('avatar', $data) && !empty($data['avatar'])) {
                $user->avatar = $this->processAvatarUpload($user, $data['avatar']);
            }
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
            if (array_key_exists('membership_level', $data)) {
                $newLevel = $data['membership_level'];
                if ($newLevel !== $user->membership_level) {
                    $this->membershipService->updateMembershipLevel(
                        $user,
                        $newLevel,
                        $user->membership_level,
                        'Update level oleh admin',
                        $request->user()?->id
                    );
                }
            }
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
            'membership_status' => $user->membership_status ?? 'active',
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

        // Older clients submit Indonesian display labels while the
        // membership_profiles enum stores canonical values.
        if ($request->has('gender')) {
            $request->merge([
                'gender' => $this->normalizeGender($request->input('gender')),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'whatsapp' => 'nullable|string|max:20|unique:users,whatsapp,' . $user->id,
            'avatar' => 'nullable|string',
            'birthDate' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
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
            'strNumber' => 'nullable|string|max:255',
            'sipNumber' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'experienceYears' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'primaryBranch' => 'nullable|string|max:255',
            'consultationFee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('name', $data)) $user->name = $data['name'];
        if (array_key_exists('email', $data)) $user->email = $data['email'];
        if (array_key_exists('whatsapp', $data)) $user->whatsapp = $data['whatsapp'];
        if (array_key_exists('avatar', $data) && !empty($data['avatar'])) {
            $user->avatar = $this->processAvatarUpload($user, $data['avatar']);
        }
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
        if (array_key_exists('strNumber', $data)) $user->str_number = $data['strNumber'];
        if (array_key_exists('sipNumber', $data)) $user->sip_number = $data['sipNumber'];
        if (array_key_exists('specialization', $data)) $user->specialization = $data['specialization'];
        if (array_key_exists('education', $data)) $user->education = $data['education'];
        if (array_key_exists('experienceYears', $data)) $user->experience_years = $data['experienceYears'];
        if (array_key_exists('bio', $data)) $user->bio = $data['bio'];
        if (array_key_exists('primaryBranch', $data)) $user->primary_branch = $data['primaryBranch'];
        if (array_key_exists('consultationFee', $data)) $user->consultation_fee = $data['consultationFee'];

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

        // Settings is the profile screen used by patients. Keep the
        // membership profile in sync so the information they submit here is
        // also the source used to validate a membership upgrade.
        $membershipProfile = $user->membershipProfile()->firstOrNew();
        $membershipProfile->fill([
            'gender' => $data['gender'] ?? $user->gender,
            'date_of_birth' => $data['birthDate'] ?? optional($user->birth_date)->format('Y-m-d'),
            'city' => $data['city'] ?? $user->city,
            'dental_concerns' => $data['dentalComplaints'] ?? $membershipProfile->dental_concerns ?? [],
            'treatment_interests' => $data['desiredServices'] ?? $membershipProfile->treatment_interests ?? [],
            'dental_conditions' => $data['currentDentalConditions'] ?? $membershipProfile->dental_conditions ?? [],
            'lifestyle_interests' => $data['lifestyleInterests'] ?? $membershipProfile->lifestyle_interests ?? [],
            'personal_goals' => $data['treatmentGoals'] ?? $membershipProfile->personal_goals ?? [],
            'communication_preferences' => $data['preferredCommunicationChannels'] ?? $membershipProfile->communication_preferences ?? [],
        ]);
        $membershipProfile->user_id = $user->id;
        $membershipProfile->save();

        $isMembershipProfileComplete = $membershipProfile->isComplete();
        $user->membership_profile_completed = $isMembershipProfileComplete;
        // Semua pengguna adalah Bronze member (gratis & otomatis aktif)
        if ($user->membership_level === 'bronze') {
            $user->membership_status = 'active';
        }
        $user->save();

        return response()->json($this->serialize($user));
    }

    private function normalizeGender(?string $gender): ?string
    {
        if ($gender === null || trim($gender) === '') {
            return null;
        }

        return match (mb_strtolower(trim($gender))) {
            'male', 'laki-laki', 'laki laki', 'pria' => 'male',
            'female', 'perempuan', 'wanita' => 'female',
            'other', 'lainnya' => 'other',
            default => trim($gender),
        };
    }

    private function serialize(User $user): array
    {
        if ($user->role === 'doctor') {
            return [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->whatsapp,
                'whatsapp' => $user->whatsapp,
                'avatar' => $this->formatMediaUrl($user->avatar),
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'strNumber' => $user->str_number ?? '',
                'sipNumber' => $user->sip_number ?? '',
                'specialization' => $user->specialization ?? 'Dokter Gigi Spesialis',
                'education' => $user->education ?? '',
                'experienceYears' => $user->experience_years ?? '',
                'bio' => $user->bio ?? '',
                'primaryBranch' => $user->primary_branch ?? 'Aesthetic Pondok Indah',
                'consultationFee' => (float) ($user->consultation_fee ?? 250000),
                'created_at' => optional($user->created_at)->toISOString(),
            ];
        }

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
            'membership_status' => $user->membership_status ?? 'active',
            'membership_level' => $user->membership_level ?? 'bronze',
            'membership_points' => (int) ($user->membership_points ?? 0),
            'avatar' => $this->formatMediaUrl($user->avatar),
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

    private function formatMediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:image')) {
            return $path;
        }

        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        if (file_exists(public_path($cleanPath))) {
            return asset($cleanPath);
        }

        if (file_exists(storage_path('app/public/' . $cleanPath)) || file_exists(public_path('storage/' . $cleanPath))) {
            return asset('storage/' . $cleanPath);
        }

        return asset($cleanPath);
    }

    private function processAvatarUpload(User $user, ?string $avatarInput): ?string
    {
        if (!$avatarInput) {
            return null;
        }

        if (str_starts_with($avatarInput, 'data:image')) {
            try {
                @[$type, $fileData] = explode(';', $avatarInput);
                @[, $fileData] = explode(',', $fileData);

                if ($fileData) {
                    $ext = 'png';
                    if (str_contains($type, 'jpeg') || str_contains($type, 'jpg')) {
                        $ext = 'jpg';
                    } elseif (str_contains($type, 'webp')) {
                        $ext = 'webp';
                    }

                    $decodedData = base64_decode($fileData);
                    $filename = 'avatar_' . $user->id . '_' . time() . '.' . $ext;
                    $relativePath = 'avatars/' . $filename;

                    $targetDirs = [
                        storage_path('app/public/avatars'),
                        public_path('storage/avatars'),
                    ];

                    foreach ($targetDirs as $dir) {
                        if (!file_exists($dir)) {
                            @mkdir($dir, 0777, true);
                        }
                        @file_put_contents($dir . '/' . $filename, $decodedData);
                    }

                    return $relativePath;
                }
            } catch (\Throwable $e) {
                // Fallback to raw string if processing fails
            }
        }

        return $avatarInput;
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->string('current_password')->toString(), $user->password)) {
            return response()->json([
                'message' => 'Password saat ini tidak sesuai.',
                'errors' => [
                    'current_password' => ['Password saat ini tidak sesuai.'],
                ],
            ], 422);
        }

        $user->password = Hash::make($request->string('password')->toString());
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->email = $request->string('email')->toString();
        $user->save();

        return response()->json([
            'message' => 'Email berhasil diubah.',
            'user' => $this->serialize($user),
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->tokens()->delete();
            $user->status = 'inactive';
            $user->save();
            $user->delete();
        }

        return response()->json(['message' => 'Akun berhasil dihapus.']);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Preferensi berhasil disimpan.',
            'preferences' => $request->input('preferences', []),
        ]);
    }
}

