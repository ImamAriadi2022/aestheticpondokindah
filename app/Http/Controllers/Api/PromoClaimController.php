<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoClaim;
use App\Models\User;
use App\Services\ProfileCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PromoClaimController extends Controller
{
    public function __construct(
        private ProfileCompletionService $profileService
    ) {}

    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'whatsapp' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('whatsapp', $request->input('whatsapp'))->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'whatsapp' => $user->whatsapp,
                'address_line' => $user->address_line,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'profile_complete' => $user->isProfileComplete(),
                'membership_active' => $user->isMembershipActive(),
                'membership_expires_at' => $user->membership_expires_at,
                'promo_eligible_level' => $user->promoEligibleLevel(),
            ],
        ]);
    }

    public function eligibility(User $user): JsonResponse
    {
        return response()->json([
            'user_id' => $user->id,
            'name' => $user->name,
            'profile_complete' => $user->isProfileComplete(),
            'missing_fields' => $this->profileService->missingFields($user),
            'membership_active' => $user->isMembershipActive(),
            'membership_expires_at' => $user->membership_expires_at,
            'promo_eligible_level' => $user->promoEligibleLevel(),
        ]);
    }

    public function store(Request $request, User $user): JsonResponse
    {
        $level = $user->promoEligibleLevel();

        if ($level === 'none') {
            return response()->json([
                'message' => 'User belum eligible untuk promo.',
                'missing_fields' => $this->profileService->missingFields($user),
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adminId = auth()->id() ?? $request->input('claimed_by_admin_id');

        if (!$adminId) {
            return response()->json(['message' => 'Admin ID tidak ditemukan.'], 401);
        }

        $claim = PromoClaim::create([
            'user_id' => $user->id,
            'claimed_by_admin_id' => $adminId,
            'claim_type' => $level,
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Promo berhasil di-claim.',
            'claim' => $claim,
            'promo_level' => $level,
        ], 201);
    }

    public function index(User $user): JsonResponse
    {
        $claims = $user->promoClaims()
            ->with('claimedBy:id,name')
            ->latest()
            ->get();

        return response()->json([
            'user_id' => $user->id,
            'total_claims' => $claims->count(),
            'claims' => $claims,
        ]);
    }
}
