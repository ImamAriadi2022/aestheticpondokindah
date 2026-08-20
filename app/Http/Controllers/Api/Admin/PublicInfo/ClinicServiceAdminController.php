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
            'image' => ['nullable', 'string'],
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

        if (!empty($validated['image'])) {
            $validated['image'] = $this->processServiceImageUpload($validated['image'], $validated['title']);
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
            'image' => ['nullable', 'string'],
            'intro' => ['required', 'string'],
            'paragraphs' => ['nullable', 'array'],
            'steps' => ['nullable', 'array'],
            'general_dentists' => ['nullable', 'array'],
            'specialist_label' => ['nullable', 'string', 'max:255'],
            'specialist_names' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['image'])) {
            $validated['image'] = $this->processServiceImageUpload($validated['image'], $validated['title']);
        }

        $service->update($validated);

        return response()->json([
            'message' => 'Layanan klinik berhasil diperbarui.',
            'service' => $service,
        ]);
    }

    private function processServiceImageUpload(?string $imageInput, string $serviceTitle): ?string
    {
        if (!$imageInput) {
            return null;
        }

        if (str_starts_with($imageInput, 'data:image')) {
            try {
                @[$type, $fileData] = explode(';', $imageInput);
                @[, $fileData] = explode(',', $fileData);

                if ($fileData) {
                    $ext = 'webp';
                    if (str_contains($type, 'png')) {
                        $ext = 'png';
                    } elseif (str_contains($type, 'jpeg') || str_contains($type, 'jpg')) {
                        $ext = 'jpg';
                    } elseif (str_contains($type, 'svg')) {
                        $ext = 'svg';
                    }

                    $decodedData = base64_decode($fileData);
                    $cleanTitle = Str::slug($serviceTitle) ?: 'service';
                    $filename = $cleanTitle . '_' . time() . '.' . $ext;

                    $targetDirs = [
                        public_path('layanan'),
                        public_path('storage/layanan'),
                        storage_path('app/public/layanan'),
                    ];

                    $frontendDir = base_path('frontend-web/public/layanan');
                    if (is_dir(base_path('frontend-web/public'))) {
                        $targetDirs[] = $frontendDir;
                    }

                    foreach ($targetDirs as $dir) {
                        if (!file_exists($dir)) {
                            @mkdir($dir, 0777, true);
                        }
                        @file_put_contents($dir . DIRECTORY_SEPARATOR . $filename, $decodedData);
                    }

                    return '/layanan/' . $filename;
                }
            } catch (\Throwable $e) {
                // Fallback to raw string
            }
        }

        return $imageInput;
    }

    public function destroy(ClinicService $service): JsonResponse
    {
        $service->delete();

        return response()->json([
            'message' => 'Layanan klinik berhasil dihapus.',
        ]);
    }
}
