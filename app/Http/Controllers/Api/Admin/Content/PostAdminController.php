<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Guest\Content\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Post::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Post $p) => $this->serialize($p))
            ->values();

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'cover_image' => 'nullable|image|max:5120',
            'content_html' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published',
            'published_at' => 'nullable|date',
            'reading_time_minutes' => 'nullable|integer|min:1|max:120',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'canonical_url' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $slug = $data['slug'] ?? Str::slug($data['title']);
        if (!$slug) {
            $slug = Str::random(8);
        }
        $slug = $this->uniqueSlug($slug);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('posts', 'public');
        }

        $post = Post::create([
            'author_id' => optional($request->user())->id,
            'title' => $data['title'],
            'slug' => $slug,
            'category' => $data['category'] ?? null,
            'tags' => $data['tags'] ?? [],
            'cover_image_path' => $coverPath,
            'content_html' => $data['content_html'] ?? null,
            'excerpt' => $data['excerpt'] ?? null,
            'is_featured' => (bool)($data['is_featured'] ?? false),
            'status' => $data['status'] ?? 'draft',
            'published_at' => $data['published_at'] ?? null,
            'reading_time_minutes' => $data['reading_time_minutes'] ?? null,
            'seo_title' => $data['seo_title'] ?? null,
            'seo_description' => $data['seo_description'] ?? null,
            'canonical_url' => $data['canonical_url'] ?? null,
        ]);

        if ($post->status === 'published' && !$post->published_at) {
            $post->published_at = now();
            $post->save();
        }

        return response()->json($this->serialize($post), 201);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug,' . $post->id,
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'cover_image' => 'nullable|image|max:5120',
            'content_html' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published',
            'published_at' => 'nullable|date',
            'reading_time_minutes' => 'nullable|integer|min:1|max:120',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'canonical_url' => 'nullable|string|max:500',
            'remove_cover_image' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('title', $data)) $post->title = $data['title'];
        if (array_key_exists('slug', $data)) $post->slug = $data['slug'];
        if (array_key_exists('category', $data)) $post->category = $data['category'];
        if (array_key_exists('tags', $data)) $post->tags = $data['tags'] ?? [];
        if (array_key_exists('content_html', $data)) $post->content_html = $data['content_html'];
        if (array_key_exists('excerpt', $data)) $post->excerpt = $data['excerpt'];
        if (array_key_exists('is_featured', $data)) $post->is_featured = (bool)$data['is_featured'];
        if (array_key_exists('status', $data)) $post->status = $data['status'];
        if (array_key_exists('published_at', $data)) $post->published_at = $data['published_at'];
        if (array_key_exists('reading_time_minutes', $data)) $post->reading_time_minutes = $data['reading_time_minutes'];
        if (array_key_exists('seo_title', $data)) $post->seo_title = $data['seo_title'];
        if (array_key_exists('seo_description', $data)) $post->seo_description = $data['seo_description'];
        if (array_key_exists('canonical_url', $data)) $post->canonical_url = $data['canonical_url'];

        if (!empty($data['remove_cover_image']) && $post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
            $post->cover_image_path = null;
        }

        if ($request->hasFile('cover_image')) {
            if ($post->cover_image_path) {
                Storage::disk('public')->delete($post->cover_image_path);
            }
            $post->cover_image_path = $request->file('cover_image')->store('posts', 'public');
        }

        if ($post->status === 'published' && !$post->published_at) {
            $post->published_at = now();
        }

        $post->save();

        return response()->json($this->serialize($post));
    }

    public function destroy(Post $post): JsonResponse
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }
        $post->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(Post $post): array
    {
        return [
            'id' => (string) $post->id,
            'author_id' => $post->author_id,
            'title' => $post->title,
            'slug' => $post->slug,
            'category' => $post->category,
            'tags' => $post->tags ?? [],
            'cover_image_url' => $post->cover_image_path ? asset('storage/' . $post->cover_image_path) : null,
            'cover_image_path' => $post->cover_image_path,
            'content_html' => $post->content_html,
            'excerpt' => $post->excerpt,
            'is_featured' => (bool) $post->is_featured,
            'status' => $post->status,
            'published_at' => optional($post->published_at)->toISOString(),
            'reading_time_minutes' => $post->reading_time_minutes,
            'seo_title' => $post->seo_title,
            'seo_description' => $post->seo_description,
            'canonical_url' => $post->canonical_url,
            'created_at' => optional($post->created_at)->toISOString(),
            'updated_at' => optional($post->updated_at)->toISOString(),
        ];
    }

    private function uniqueSlug(string $slug): string
    {
        $base = $slug;
        $i = 1;
        while (Post::query()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i;
            $i++;
        }
        return $slug;
    }
}
