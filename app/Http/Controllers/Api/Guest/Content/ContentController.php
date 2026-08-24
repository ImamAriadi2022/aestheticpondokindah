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
                'image_url' => $this->formatMediaUrl($p->image_path),
                'button_label' => $p->button_label,
                'contact_whatsapp' => $p->contact_whatsapp,
                'starts_at' => optional($p->starts_at)->toISOString(),
                'ends_at' => optional($p->ends_at)->toISOString(),
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
            'image_url' => $this->formatMediaUrl($p->image_path),
            'button_label' => $p->button_label,
            'contact_whatsapp' => $p->contact_whatsapp,
            'starts_at' => optional($p->starts_at)->toISOString(),
            'ends_at' => optional($p->ends_at)->toISOString(),
        ]);
    }
}
