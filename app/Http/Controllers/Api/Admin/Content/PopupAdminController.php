<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Guest\Content\Popup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PopupAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Popup::query()->orderByDesc('created_at')->get()->map(fn (Popup $p) => $this->serialize($p))->values();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'button_label' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'enabled' => 'nullable',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($request->file('image'), 'popups', 1600, 1600, 82);
        }

        $popup = Popup::create([
            'title' => !empty($data['title']) ? $data['title'] : 'Pop Up Promo',
            'headline' => $data['headline'] ?? null,
            'message' => $data['message'] ?? null,
            'button_label' => $data['button_label'] ?? null,
            'button_url' => $data['button_url'] ?? null,
            'image_path' => $imagePath,
            'enabled' => $request->has('enabled') ? $request->boolean('enabled') : true,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'priority' => $data['priority'] ?? 0,
        ]);

        return response()->json($this->serialize($popup), 201);
    }

    public function update(Request $request, Popup $popup): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'button_label' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'enabled' => 'nullable',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'priority' => 'nullable|integer',
            'remove_image' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->has('title') && filled($request->input('title'))) {
            $popup->title = $request->input('title');
        }
        if ($request->has('headline')) $popup->headline = $data['headline'] ?? null;
        if ($request->has('message')) $popup->message = $data['message'] ?? null;
        if ($request->has('button_label')) $popup->button_label = $data['button_label'] ?? null;
        if ($request->has('button_url')) $popup->button_url = $data['button_url'] ?? null;
        if ($request->has('enabled')) {
            $popup->enabled = $request->boolean('enabled');
        }
        if ($request->has('starts_at')) $popup->starts_at = $data['starts_at'] ?? null;
        if ($request->has('ends_at')) $popup->ends_at = $data['ends_at'] ?? null;
        if ($request->has('priority')) $popup->priority = (int)($data['priority'] ?? 0);

        if ($request->boolean('remove_image') && $popup->image_path) {
            Storage::disk('public')->delete($popup->image_path);
            @unlink(public_path('storage/' . ltrim($popup->image_path, '/')));
            $popup->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($popup->image_path) {
                Storage::disk('public')->delete($popup->image_path);
                @unlink(public_path('storage/' . ltrim($popup->image_path, '/')));
            }
            $popup->image_path = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($request->file('image'), 'popups', 1600, 1600, 82);
        }

        $popup->save();
        return response()->json($this->serialize($popup));
    }

    public function destroy(Popup $popup): JsonResponse
    {
        if ($popup->image_path) {
            Storage::disk('public')->delete($popup->image_path);
            @unlink(public_path('storage/' . ltrim($popup->image_path, '/')));
        }
        $popup->delete();
        return response()->json(['ok' => true]);
    }

    private function processAndSaveWebp(\Illuminate\Http\UploadedFile $file): ?string
    {
        $filePath = $file->getRealPath();
        $mime = $file->getMimeType();

        $image = match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($filePath),
            'image/png' => @imagecreatefrompng($filePath),
            'image/gif' => @imagecreatefromgif($filePath),
            'image/webp' => @imagecreatefromwebp($filePath),
            'image/bmp', 'image/x-ms-bmp' => @imagecreatefrombmp($filePath),
            default => null,
        };

        if (!$image) {
            $path = $file->store('popups', 'public');
            $this->mirrorStorageFile($path);
            return $path;
        }

        $origW = imagesx($image);
        $origH = imagesy($image);

        $maxW = 1200;
        $maxH = 1200;
        $newW = $origW;
        $newH = $origH;

        if ($origW > $maxW || $origH > $maxH) {
            $ratio = min($maxW / $origW, $maxH / $origH);
            $newW = (int) round($origW * $ratio);
            $newH = (int) round($origH * $ratio);
        }

        $canvas = imagecreatetruecolor($newW, $newH);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        imagecopyresampled(
            $canvas,
            $image,
            0, 0, 0, 0,
            $newW, $newH,
            $origW, $origH
        );

        $relativeFilename = 'popups/popup_' . uniqid() . '_' . time() . '.webp';
        $storageDir = storage_path('app/public/popups');
        if (!file_exists($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $fullStoragePath = storage_path('app/public/' . $relativeFilename);
        $saved = imagewebp($canvas, $fullStoragePath, 85);

        imagedestroy($canvas);
        imagedestroy($image);

        if ($saved) {
            $this->mirrorStorageFile($relativeFilename);
            return $relativeFilename;
        }

        $path = $file->store('popups', 'public');
        $this->mirrorStorageFile($path);
        return $path;
    }

    private function mirrorStorageFile(string $relativePath): void
    {
        try {
            $source = storage_path('app/public/' . $relativePath);
            $dest = public_path('storage/' . $relativePath);
            $dir = dirname($dest);
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
            if (file_exists($source)) {
                copy($source, $dest);
            }
        } catch (\Throwable $e) {}
    }

    private function serialize(Popup $popup): array
    {
        $imageUrl = null;
        if ($popup->image_path) {
            $cleanPath = ltrim($popup->image_path, '/');
            if (str_starts_with($cleanPath, 'storage/')) {
                $cleanPath = substr($cleanPath, 8);
            }
            $imageUrl = asset('storage/' . $cleanPath);
        }

        return [
            'id' => (string) $popup->id,
            'title' => $popup->title,
            'headline' => $popup->headline,
            'message' => $popup->message,
            'button_label' => $popup->button_label,
            'button_url' => $popup->button_url,
            'image_url' => $imageUrl,
            'image_path' => $popup->image_path,
            'enabled' => (bool) $popup->enabled,
            'starts_at' => optional($popup->starts_at)->toISOString(),
            'ends_at' => optional($popup->ends_at)->toISOString(),
            'priority' => (int) $popup->priority,
            'created_at' => optional($popup->created_at)->toISOString(),
            'updated_at' => optional($popup->updated_at)->toISOString(),
        ];
    }
}
