<?php

namespace App\Http\Controllers\Api\Admin\Complaint;

use App\Http\Controllers\Controller;
use App\Models\Patient\Complaint\Complaint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ComplaintAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hasFilters = $request->has('status') || $request->has('search');

        if (!$hasFilters) {
            $data = Cache::remember('admin_complaints_list', 120, function () {
                return Complaint::with('user')
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn($c) => $this->transform($c))
                    ->values()
                    ->all();
            });

            return response()->json([
                'data' => $data,
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => count($data),
                ]
            ]);
        }

        $query = Complaint::with('user')->orderByDesc('created_at');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = (int) $request->input('per_page', 100);
        $complaints = $query->paginate($perPage);

        return response()->json([
            'data' => collect($complaints->items())->map(fn($c) => $this->transform($c)),
            'meta' => [
                'current_page' => $complaints->currentPage(),
                'last_page' => $complaints->lastPage(),
                'total' => $complaints->total(),
            ]
        ]);
    }

    public function update(Request $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,resolved,rejected',
            'admin_response' => 'nullable|string',
        ]);

        $complaint->update($validated);
        Cache::forget('admin_complaints_list');

        return response()->json($this->transform($complaint));
    }

    public function destroy(Complaint $complaint): JsonResponse
    {
        $complaint->delete();
        Cache::forget('admin_complaints_list');
        return response()->json(['message' => 'Complaint deleted successfully']);
    }

    private function transform(Complaint $c): array
    {
        return [
            'id' => $c->id,
            'category' => $c->category,
            'title' => $c->title,
            'description' => $c->description,
            'status' => $c->status,
            'adminResponse' => $c->admin_response,
            'admin_response' => $c->admin_response,
            'attachmentUrl' => $c->attachment_url,
            'user' => $c->user ? [
                'id' => $c->user->id,
                'name' => $c->user->name,
                'email' => $c->user->email,
                'whatsapp' => $c->user->whatsapp,
            ] : null,
            'createdAt' => $c->created_at ? $c->created_at->toISOString() : null,
            'updatedAt' => $c->updated_at ? $c->updated_at->toISOString() : null,
            'date' => $c->created_at ? $c->created_at->format('j M Y') : '-',
        ];
    }
}
