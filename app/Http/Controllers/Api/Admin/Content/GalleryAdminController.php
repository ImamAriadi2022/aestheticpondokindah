<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Guest\Content\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GalleryAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $items = GalleryItem::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (GalleryItem $g) => $this->serialize($g))
            ->values();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
            'image' => 'required|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $imagePath = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($request->file('image'), 'gallery', 1600, 1600, 82);

        $item = GalleryItem::create([
            'title' => $data['title'],
            'category' => $data['category'] ?? null,
            'description' => $data['description'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => (bool)($data['is_published'] ?? true),
            'image_path' => $imagePath,
        ]);

        return response()->json($this->serialize($item), 201);
    }

    public function update(Request $request, $galleryItem): JsonResponse
    {
        $item = $galleryItem instanceof GalleryItem ? $galleryItem : GalleryItem::find($galleryItem);
        if (!$item) {
            return response()->json(['error' => 'Foto galeri tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('title', $data)) $item->title = $data['title'];
        if (array_key_exists('category', $data)) $item->category = $data['category'];
        if (array_key_exists('description', $data)) $item->description = $data['description'];
        if (array_key_exists('sort_order', $data)) $item->sort_order = (int)$data['sort_order'];
        if (array_key_exists('is_published', $data)) $item->is_published = (bool)$data['is_published'];

        if ($request->hasFile('image')) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $item->image_path = \App\Services\Shared\Media\ImageOptimizationService::optimizeAndStore($request->file('image'), 'gallery', 1600, 1600, 82);
        }

        $item->save();
        return response()->json($this->serialize($item));
    }

    public function destroy($galleryItem): JsonResponse
    {
        $item = $galleryItem instanceof GalleryItem ? $galleryItem : GalleryItem::find($galleryItem);
        if (!$item) {
            return response()->json(['error' => 'Foto galeri tidak ditemukan'], 404);
        }
        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }
        $item->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(GalleryItem $g): array
    {
        return [
            'id' => (string) $g->id,
            'title' => $g->title,
            'category' => $g->category,
            'description' => $g->description,
            'sort_order' => (int) $g->sort_order,
            'is_published' => (bool) $g->is_published,
            'image_url' => asset('storage/' . $g->image_path),
            'image_path' => $g->image_path,
            'created_at' => optional($g->created_at)->toISOString(),
            'updated_at' => optional($g->updated_at)->toISOString(),
        ];
    }
}
