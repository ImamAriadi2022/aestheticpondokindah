<?php

namespace App\Http\Controllers\Api\Admin\PublicInfo;

use App\Http\Controllers\Controller;
use App\Models\Guest\Faq\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Faq::query()->orderBy('sort_order')->orderBy('id');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faq = Faq::create($validated);

        return response()->json([
            'message' => 'FAQ berhasil ditambahkan.',
            'faq' => $faq,
        ], 201);
    }

    public function show(Faq $faq): JsonResponse
    {
        return response()->json($faq);
    }

    public function update(Request $request, Faq $faq): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faq->update($validated);

        return response()->json([
            'message' => 'FAQ berhasil diperbarui.',
            'faq' => $faq,
        ]);
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json([
            'message' => 'FAQ berhasil dihapus.',
        ]);
    }
}
