<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Guest\Content\Promo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PromoAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $promos = Promo::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Promo $p) => $this->serialize($p))
            ->values();

        return response()->json($promos);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:promos,slug',
            'description' => 'nullable|string',
            'content_html' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:5120',
            'button_label' => 'nullable|string|max:255',
            'contact_whatsapp' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
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

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('promos', 'public');
        }

        $promo = Promo::create([
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'content_html' => $data['content_html'] ?? null,
            'category' => $data['category'] ?? null,
            'image_path' => $imagePath,
            'button_label' => $data['button_label'] ?? 'Klaim Promo',
            'contact_whatsapp' => $data['contact_whatsapp'] ?? null,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : true,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($this->serialize($promo), 201);
    }

    public function update(Request $request, Promo $promo): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:promos,slug,' . $promo->id,
            'description' => 'nullable|string',
            'content_html' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:5120',
            'button_label' => 'nullable|string|max:255',
            'contact_whatsapp' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
            'remove_image' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('title', $data)) $promo->title = $data['title'];
        if (array_key_exists('slug', $data)) $promo->slug = $data['slug'];
        if (array_key_exists('description', $data)) $promo->description = $data['description'];
        if (array_key_exists('content_html', $data)) $promo->content_html = $data['content_html'];
        if (array_key_exists('category', $data)) $promo->category = $data['category'];
        if (array_key_exists('button_label', $data)) $promo->button_label = $data['button_label'];
        if (array_key_exists('contact_whatsapp', $data)) $promo->contact_whatsapp = $data['contact_whatsapp'];
        if (array_key_exists('is_active', $data) || $request->has('is_active')) $promo->is_active = $request->boolean('is_active');
        if (array_key_exists('starts_at', $data)) $promo->starts_at = $data['starts_at'];
        if (array_key_exists('ends_at', $data)) $promo->ends_at = $data['ends_at'];
        if (array_key_exists('sort_order', $data)) $promo->sort_order = $data['sort_order'];

        if (!empty($data['remove_image']) && $promo->image_path) {
            Storage::disk('public')->delete($promo->image_path);
            $promo->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($promo->image_path) {
                Storage::disk('public')->delete($promo->image_path);
            }
            $promo->image_path = $request->file('image')->store('promos', 'public');
        }

        $promo->save();

        return response()->json($this->serialize($promo));
    }

    public function destroy(Promo $promo): JsonResponse
    {
        if ($promo->image_path) {
            Storage::disk('public')->delete($promo->image_path);
        }
        $promo->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(Promo $promo): array
    {
        return [
            'id' => (string) $promo->id,
            'title' => $promo->title,
            'slug' => $promo->slug,
            'description' => $promo->description,
            'content_html' => $promo->content_html,
            'category' => $promo->category,
            'image_url' => $promo->image_path ? asset('storage/' . $promo->image_path) : null,
            'image_path' => $promo->image_path,
            'button_label' => $promo->button_label,
            'contact_whatsapp' => $promo->contact_whatsapp,
            'is_active' => (bool) $promo->is_active,
            'starts_at' => optional($promo->starts_at)->toISOString(),
            'ends_at' => optional($promo->ends_at)->toISOString(),
            'sort_order' => (int) $promo->sort_order,
            'created_at' => optional($promo->created_at)->toISOString(),
            'updated_at' => optional($promo->updated_at)->toISOString(),
        ];
    }

    private function uniqueSlug(string $slug): string
    {
        $base = $slug;
        $i = 1;
        while (Promo::query()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i;
            $i++;
        }
        return $slug;
    }
}
