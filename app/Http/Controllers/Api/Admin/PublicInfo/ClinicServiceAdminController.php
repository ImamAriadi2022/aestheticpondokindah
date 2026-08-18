<?php

namespace App\Http\Controllers\Api\Admin\PublicInfo;

use App\Http\Controllers\Controller;
use App\Models\Guest\Service\ClinicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClinicServiceAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ClinicService::query()->orderBy('sort_order')->orderBy('id');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('intro', 'like', "%{$search}%");
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:clinic_services,slug'],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'string', 'max:100'],
            'image' => ['nullable', 'string', 'max:500'],
            'intro' => ['required', 'string'],
            'paragraphs' => ['nullable', 'array'],
            'steps' => ['nullable', 'array'],
            'general_dentists' => ['nullable', 'array'],
            'specialist_label' => ['nullable', 'string', 'max:255'],
            'specialist_names' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $counter = 1;
            while (ClinicService::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = Str::slug($validated['title']) . '-' . $counter++;
            }
        }

        $service = ClinicService::create($validated);

        return response()->json([
            'message' => 'Layanan klinik berhasil ditambahkan.',
            'service' => $service,
        ], 201);
    }

    public function show(ClinicService $service): JsonResponse
    {
        return response()->json($service);
    }

    public function update(Request $request, ClinicService $service): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:clinic_services,slug,' . $service->id],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'string', 'max:100'],
            'image' => ['nullable', 'string', 'max:500'],
            'intro' => ['required', 'string'],
            'paragraphs' => ['nullable', 'array'],
            'steps' => ['nullable', 'array'],
            'general_dentists' => ['nullable', 'array'],
            'specialist_label' => ['nullable', 'string', 'max:255'],
            'specialist_names' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $service->update($validated);

        return response()->json([
            'message' => 'Layanan klinik berhasil diperbarui.',
            'service' => $service,
        ]);
    }

    public function destroy(ClinicService $service): JsonResponse
    {
        $service->delete();

        return response()->json([
            'message' => 'Layanan klinik berhasil dihapus.',
        ]);
    }
}
