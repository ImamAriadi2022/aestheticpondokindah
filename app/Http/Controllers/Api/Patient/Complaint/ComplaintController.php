<?php

namespace App\Http\Controllers\Api\Patient\Complaint;

use App\Http\Controllers\Controller;
use App\Models\Patient\Complaint\Complaint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $complaints = Complaint::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Complaint $c) {
                return $this->transform($c);
            });

        return response()->json($complaints);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'attachment_url' => 'nullable|string',
        ]);

        $attachmentUrl = $validated['attachment_url'] ?? null;
        if ($attachmentUrl && str_starts_with($attachmentUrl, 'data:image')) {
            try {
                $stored = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($attachmentUrl, 'complaints', 1600, 1600, 82);
                $attachmentUrl = asset('storage/' . $stored);
            } catch (\Throwable $e) {}
        }

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'category' => $validated['category'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'pending',
            'attachment_url' => $attachmentUrl,
        ]);

        \Illuminate\Support\Facades\Cache::forget('admin_complaints_list');

        return response()->json($this->transform($complaint), 201);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        if ($complaint->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->transform($complaint));
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
            'createdAt' => $c->created_at ? $c->created_at->toISOString() : null,
            'updatedAt' => $c->updated_at ? $c->updated_at->toISOString() : null,
            'date' => $c->created_at ? $c->created_at->format('j M Y') : '-',
        ];
    }
}
