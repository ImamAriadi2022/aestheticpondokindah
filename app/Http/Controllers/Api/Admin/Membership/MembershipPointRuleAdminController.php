<?php

namespace App\Http\Controllers\Api\Admin\Membership;

use App\Http\Controllers\Controller;
use App\Models\Patient\Membership\MembershipPointRule;
use App\Services\Patient\Membership\MembershipPointRuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipPointRuleAdminController extends Controller
{
    protected MembershipPointRuleService $ruleService;

    public function __construct(MembershipPointRuleService $ruleService)
    {
        $this->ruleService = $ruleService;
    }

    public function index(): JsonResponse
    {
        $rules = $this->ruleService->getAllRules();
        return response()->json([
            'success' => true,
            'data' => $rules,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'service_id' => ['nullable', 'integer', 'exists:clinic_services,id'],
            'service_name' => ['nullable', 'string', 'max:255'],
            'points' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $rule = $this->ruleService->createRule($validated, $request->user()?->id);

        return response()->json([
            'success' => true,
            'message' => 'Aturan poin baru berhasil dibuat.',
            'data' => $rule->load(['service', 'creator:id,name', 'updater:id,name']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = MembershipPointRule::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'service_id' => ['nullable', 'integer', 'exists:clinic_services,id'],
            'service_name' => ['nullable', 'string', 'max:255'],
            'points' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $updated = $this->ruleService->updateRule($rule, $validated, $request->user()?->id);

        return response()->json([
            'success' => true,
            'message' => 'Aturan poin berhasil diperbarui.',
            'data' => $updated,
        ]);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $rule = MembershipPointRule::findOrFail($id);
        $this->ruleService->toggleStatus($rule, $request->user()?->id);

        return response()->json([
            'success' => true,
            'message' => 'Status aturan poin berhasil diubah.',
            'data' => $rule->fresh(['service', 'creator:id,name', 'updater:id,name']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $rule = MembershipPointRule::findOrFail($id);
        $this->ruleService->deleteRule($rule);

        return response()->json([
            'success' => true,
            'message' => 'Aturan poin berhasil dihapus.',
        ]);
    }
}
