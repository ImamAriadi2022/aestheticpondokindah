<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Guest\Content\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TestimonialAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Testimonial::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Testimonial $t) => $this->serialize($t))
            ->values();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'source' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
            'quote' => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
            'photo' => 'nullable|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('testimonials', 'public');
        }

        $item = Testimonial::create([
            'name' => $data['name'],
            'source' => $data['source'] ?? null,
            'rating' => $data['rating'] ?? 5,
            'quote' => $data['quote'],
            'photo_path' => $photoPath,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => (bool)($data['is_published'] ?? true),
        ]);

        return response()->json($this->serialize($item), 201);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
            'quote' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
            'photo' => 'nullable|image|max:5120',
            'remove_photo' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('name', $data)) $testimonial->name = $data['name'];
        if (array_key_exists('source', $data)) $testimonial->source = $data['source'];
        if (array_key_exists('rating', $data)) $testimonial->rating = (int)$data['rating'];
        if (array_key_exists('quote', $data)) $testimonial->quote = $data['quote'];
        if (array_key_exists('sort_order', $data)) $testimonial->sort_order = (int)$data['sort_order'];
        if (array_key_exists('is_published', $data)) $testimonial->is_published = (bool)$data['is_published'];

        if (!empty($data['remove_photo']) && $testimonial->photo_path) {
            Storage::disk('public')->delete($testimonial->photo_path);
            $testimonial->photo_path = null;
        }

        if ($request->hasFile('photo')) {
            if ($testimonial->photo_path) {
                Storage::disk('public')->delete($testimonial->photo_path);
            }
            $testimonial->photo_path = $request->file('photo')->store('testimonials', 'public');
        }

        $testimonial->save();
        return response()->json($this->serialize($testimonial));
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        if ($testimonial->photo_path) {
            Storage::disk('public')->delete($testimonial->photo_path);
        }
        $testimonial->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(Testimonial $t): array
    {
        return [
            'id' => (string) $t->id,
            'name' => $t->name,
            'source' => $t->source,
            'rating' => (int) $t->rating,
            'quote' => $t->quote,
            'photo_url' => $t->photo_path ? asset('storage/' . $t->photo_path) : null,
            'photo_path' => $t->photo_path,
            'sort_order' => (int) $t->sort_order,
            'is_published' => (bool) $t->is_published,
            'created_at' => optional($t->created_at)->toISOString(),
            'updated_at' => optional($t->updated_at)->toISOString(),
        ];
    }
}
