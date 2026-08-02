<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json($branches);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Branch::query()->orderBy('id', 'desc');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $branches = $query->get();

        return response()->json($branches);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:branches,code'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'message' => 'Cabang klinik berhasil ditambahkan.',
            'branch' => $branch,
        ], 201);
    }

    public function update(Request $request, Branch $branch): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', "unique:branches,code,{$branch->id}"],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $branch->update($validated);

        return response()->json([
            'message' => 'Cabang klinik berhasil diperbarui.',
            'branch' => $branch,
        ]);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();

        return response()->json([
            'message' => 'Cabang klinik berhasil dihapus.',
        ]);
    }
}
