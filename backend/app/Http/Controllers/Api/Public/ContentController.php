<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\Popup;
use App\Models\Post;
use App\Models\Promo;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function posts(Request $request): JsonResponse
    {
        $posts = Post::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (Post $p) => [
                'id' => (string) $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'category' => $p->category,
                'tags' => $p->tags ?? [],
                'cover_image_url' => $p->cover_image_path ? asset('storage/' . $p->cover_image_path) : null,
                'excerpt' => $p->excerpt,
                'published_at' => optional($p->published_at)->toISOString(),
                'reading_time_minutes' => $p->reading_time_minutes,
                'seo_title' => $p->seo_title,
                'seo_description' => $p->seo_description,
                'canonical_url' => $p->canonical_url,
                'is_featured' => (bool) $p->is_featured,
            ])
            ->values();

        return response()->json($posts);
    }

    public function postBySlug(string $slug): JsonResponse
    {
        $p = Post::query()
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'id' => (string) $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'category' => $p->category,
            'tags' => $p->tags ?? [],
            'cover_image_url' => $p->cover_image_path ? asset('storage/' . $p->cover_image_path) : null,
            'content_html' => $p->content_html,
            'excerpt' => $p->excerpt,
            'published_at' => optional($p->published_at)->toISOString(),
            'reading_time_minutes' => $p->reading_time_minutes,
            'seo_title' => $p->seo_title,
            'seo_description' => $p->seo_description,
            'canonical_url' => $p->canonical_url,
        ]);
    }

    public function activePopup(): JsonResponse
    {
        $now = now();
        $popup = Popup::query()
            ->where('enabled', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderByDesc('priority')
            ->orderByDesc('created_at')
            ->first();

        if (!$popup) {
            return response()->json(null);
        }

        return response()->json([
            'id' => (string) $popup->id,
            'title' => $popup->title,
            'headline' => $popup->headline,
            'message' => $popup->message,
            'button_label' => $popup->button_label,
            'button_url' => $popup->button_url,
            'image_url' => $popup->image_path ? asset('storage/' . $popup->image_path) : null,
            'enabled' => (bool) $popup->enabled,
        ]);
    }

    public function gallery(Request $request): JsonResponse
    {
        $items = GalleryItem::query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (GalleryItem $g) => [
                'id' => (string) $g->id,
                'title' => $g->title,
                'category' => $g->category,
                'description' => $g->description,
                'image_url' => asset('storage/' . $g->image_path),
            ])
            ->values();

        return response()->json($items);
    }

    public function testimonials(Request $request): JsonResponse
    {
        $items = Testimonial::query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Testimonial $t) => [
                'id' => (string) $t->id,
                'name' => $t->name,
                'source' => $t->source,
                'rating' => (int) $t->rating,
                'quote' => $t->quote,
                'photo_url' => $t->photo_path ? asset('storage/' . $t->photo_path) : null,
            ])
            ->values();

        return response()->json($items);
    }

    public function promos(Request $request): JsonResponse
    {
        $now = now();
        $promos = Promo::query()
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Promo $p) => [
                'id' => (string) $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'description' => $p->description,
                'category' => $p->category,
                'image_url' => $p->image_path ? asset('storage/' . $p->image_path) : null,
                'button_label' => $p->button_label,
                'contact_whatsapp' => $p->contact_whatsapp,
                'starts_at' => optional($p->starts_at)->toISOString(),
                'ends_at' => optional($p->ends_at)->toISOString(),
            ])
            ->values();

        return response()->json($promos);
    }

    public function promoBySlug(string $slug): JsonResponse
    {
        $p = Promo::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'id' => (string) $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'description' => $p->description,
            'content_html' => $p->content_html,
            'category' => $p->category,
            'image_url' => $p->image_path ? asset('storage/' . $p->image_path) : null,
            'button_label' => $p->button_label,
            'contact_whatsapp' => $p->contact_whatsapp,
            'starts_at' => optional($p->starts_at)->toISOString(),
            'ends_at' => optional($p->ends_at)->toISOString(),
        ]);
    }
}
