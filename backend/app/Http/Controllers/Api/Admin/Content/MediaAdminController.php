<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MediaAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Media::query()->orderByDesc('created_at');

        $collection = $request->query('collection');
        if (is_string($collection) && $collection !== '') {
            $query->where('collection', $collection);
        }

        $postId = $request->query('post_id');
        if ($postId !== null && $postId !== '') {
            $query->where('post_id', $postId);
        }

        $items = $query->limit(100)->get()->map(fn (Media $m) => $this->serialize($m))->values();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:5120',
            'collection' => 'nullable|string|max:50',
            'post_id' => 'nullable|integer|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $collection = $data['collection'] ?? 'general';

        $folder = match ($collection) {
            'posts' => 'posts',
            'popups' => 'popups',
            'gallery' => 'gallery',
            'testimonials' => 'testimonials',
            default => 'media',
        };

        $file = $request->file('image');
        $path = $file->store($folder, 'public');

        $media = Media::create([
            'uploaded_by' => optional($request->user())->id,
            'post_id' => $data['post_id'] ?? null,
            'collection' => $collection,
            'disk' => 'public',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
        ]);

        return response()->json($this->serialize($media), 201);
    }

    public function destroy(Media $media): JsonResponse
    {
        Storage::disk($media->disk ?? 'public')->delete($media->path);
        $media->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(Media $m): array
    {
        return [
            'id' => (string) $m->id,
            'collection' => $m->collection,
            'post_id' => $m->post_id,
            'url' => $m->url(),
            'path' => $m->path,
            'original_name' => $m->original_name,
            'mime_type' => $m->mime_type,
            'size_bytes' => $m->size_bytes,
            'created_at' => optional($m->created_at)->toISOString(),
        ];
    }
}
