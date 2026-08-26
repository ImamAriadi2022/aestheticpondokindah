<?php

namespace App\Http\Controllers\Api\Guest\Content;

use App\Http\Controllers\Controller;
use App\Models\Admin\DownloadApp\DownloadApp;
use App\Models\Guest\Content\GalleryItem;
use App\Models\Guest\Content\Popup;
use App\Models\Guest\Content\Post;
use App\Models\Guest\Content\Promo;
use App\Models\Guest\Content\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    private function formatMediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:image')) {
            return $path;
        }

        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        // Direct check in public root
        if (file_exists(public_path($cleanPath))) {
            return asset($cleanPath);
        }

        // Check in storage
        if (file_exists(storage_path('app/public/' . $cleanPath)) || file_exists(public_path('storage/' . $cleanPath))) {
            return asset('storage/' . $cleanPath);
        }

        return asset($cleanPath);
    }

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
                'cover_image_url' => $this->formatMediaUrl($p->cover_image_path),
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
            'cover_image_url' => $this->formatMediaUrl($p->cover_image_path),
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
        return $this->activePopups();
    }

    public function activePopups(): JsonResponse
    {
        $now = now();
        $popups = Popup::query()
            ->where('enabled', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderByDesc('priority')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Popup $p) => [
                'id' => (string) $p->id,
                'title' => $p->title,
                'headline' => $p->headline,
                'message' => $p->message,
                'button_label' => $p->button_label,
                'button_url' => $p->button_url,
                'image_url' => $this->formatMediaUrl($p->image_path),
                'enabled' => (bool) $p->enabled,
                'priority' => (int) $p->priority,
            ])
            ->values();

        return response()->json($popups);
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
                'image_url' => $this->formatMediaUrl($g->image_path),
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
                'photo_url' => $this->formatMediaUrl($t->photo_path),
            ])
            ->values();

        return response()->json($items);
    }

    public function promos(Request $request): JsonResponse
    {
        $now = now();
        $promos = Promo::query()
            ->where(function ($q) {
                $q->where('is_active', true)->orWhere('is_active', 1)->orWhereNull('is_active');
            })
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
                'slug' => $p->slug ?: \Illuminate\Support\Str::slug($p->title ?: 'promo-' . $p->id),
                'headline' => $p->headline,
                'description' => $p->description,
                'discount_text' => $p->discount_text,
                'category' => $p->category,
                'target_tier' => $p->target_tier,
                'image_url' => $this->formatMediaUrl($p->image_path),
                'image_path' => $p->image_path,
                'button_label' => $p->button_label,
                'contact_whatsapp' => $p->contact_whatsapp,
                'is_active' => (bool) ($p->is_active ?? true),
                'starts_at' => optional($p->starts_at)->toISOString(),
                'ends_at' => optional($p->ends_at)->toISOString(),
                'sort_order' => (int) $p->sort_order,
                'created_at' => optional($p->created_at)->toISOString(),
                'updated_at' => optional($p->updated_at)->toISOString(),
            ])
            ->values();

        return response()->json($promos);
    }

    public function downloadApps(): JsonResponse
    {
        $apps = DownloadApp::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (DownloadApp $a) => [
                'id' => (string) $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'version' => $a->version,
                'platform' => $a->platform,
                'apk_url' => $this->formatMediaUrl($a->apk_path),
                'download_link' => $a->download_link,
                'file_size' => (int) $a->file_size,
                'file_size_formatted' => $a->file_size ? $this->formatBytes($a->file_size) : null,
                'is_development' => (bool) $a->is_development,
            ])
            ->values();

        return response()->json($apps);
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function promoBySlug(string $slug): JsonResponse
    {
        $p = Promo::query()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', $slug);
            })
            ->first();

        if (!$p) {
            $all = Promo::all();
            $p = $all->first(fn ($item) => \Illuminate\Support\Str::slug($item->title) === $slug);
            if (!$p) {
                return response()->json(['error' => 'Promo tidak ditemukan'], 404);
            }
        }

        return response()->json([
            'id' => (string) $p->id,
            'title' => $p->title,
            'slug' => $p->slug ?: \Illuminate\Support\Str::slug($p->title ?: 'promo-' . $p->id),
            'headline' => $p->headline,
            'description' => $p->description,
            'discount_text' => $p->discount_text,
            'content_html' => $p->content_html,
            'category' => $p->category,
            'target_tier' => $p->target_tier,
            'image_url' => $this->formatMediaUrl($p->image_path),
            'image_path' => $p->image_path,
            'button_label' => $p->button_label,
            'contact_whatsapp' => $p->contact_whatsapp,
            'is_active' => (bool) ($p->is_active ?? true),
            'starts_at' => optional($p->starts_at)->toISOString(),
            'ends_at' => optional($p->ends_at)->toISOString(),
            'created_at' => optional($p->created_at)->toISOString(),
            'updated_at' => optional($p->updated_at)->toISOString(),
        ]);
    }
}
