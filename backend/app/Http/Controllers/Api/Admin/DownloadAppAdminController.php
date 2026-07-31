<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DownloadApp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DownloadAppAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $apps = DownloadApp::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (DownloadApp $a) => $this->serialize($a))
            ->values();

        return response()->json($apps);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'version' => 'nullable|string|max:50',
            'platform' => 'nullable|string|max:50',
            'apk_file' => 'nullable|file|max:102400|mimes:apk,zip',
            'download_link' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
            'is_development' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $apkPath = null;
        $fileSize = null;
        if ($request->hasFile('apk_file')) {
            $file = $request->file('apk_file');
            $apkPath = $file->store('downloads', 'public');
            $fileSize = $file->getSize();
        }

        $app = DownloadApp::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'version' => $data['version'] ?? null,
            'platform' => $data['platform'] ?? 'android',
            'apk_path' => $apkPath,
            'download_link' => $data['download_link'] ?? null,
            'file_size' => $fileSize,
            'is_active' => (bool)($data['is_active'] ?? true),
            'is_development' => (bool)($data['is_development'] ?? true),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($this->serialize($app), 201);
    }

    public function update(Request $request, DownloadApp $downloadApp): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'version' => 'nullable|string|max:50',
            'platform' => 'nullable|string|max:50',
            'apk_file' => 'nullable|file|max:102400|mimes:apk,zip',
            'download_link' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
            'is_development' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'remove_apk' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('title', $data)) $downloadApp->title = $data['title'];
        if (array_key_exists('description', $data)) $downloadApp->description = $data['description'];
        if (array_key_exists('version', $data)) $downloadApp->version = $data['version'];
        if (array_key_exists('platform', $data)) $downloadApp->platform = $data['platform'];
        if (array_key_exists('download_link', $data)) $downloadApp->download_link = $data['download_link'];
        if (array_key_exists('is_active', $data)) $downloadApp->is_active = (bool)$data['is_active'];
        if (array_key_exists('is_development', $data)) $downloadApp->is_development = (bool)$data['is_development'];
        if (array_key_exists('sort_order', $data)) $downloadApp->sort_order = $data['sort_order'];

        if (!empty($data['remove_apk']) && $downloadApp->apk_path) {
            Storage::disk('public')->delete($downloadApp->apk_path);
            $downloadApp->apk_path = null;
            $downloadApp->file_size = null;
        }

        if ($request->hasFile('apk_file')) {
            if ($downloadApp->apk_path) {
                Storage::disk('public')->delete($downloadApp->apk_path);
            }
            $file = $request->file('apk_file');
            $downloadApp->apk_path = $file->store('downloads', 'public');
            $downloadApp->file_size = $file->getSize();
        }

        $downloadApp->save();

        return response()->json($this->serialize($downloadApp));
    }

    public function destroy(DownloadApp $downloadApp): JsonResponse
    {
        if ($downloadApp->apk_path) {
            Storage::disk('public')->delete($downloadApp->apk_path);
        }
        $downloadApp->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(DownloadApp $app): array
    {
        return [
            'id' => (string) $app->id,
            'title' => $app->title,
            'description' => $app->description,
            'version' => $app->version,
            'platform' => $app->platform,
            'apk_url' => $app->apk_path ? asset('storage/' . $app->apk_path) : null,
            'apk_path' => $app->apk_path,
            'download_link' => $app->download_link,
            'file_size' => (int) $app->file_size,
            'file_size_formatted' => $app->file_size ? $this->formatBytes($app->file_size) : null,
            'is_active' => (bool) $app->is_active,
            'is_development' => (bool) $app->is_development,
            'sort_order' => (int) $app->sort_order,
            'created_at' => optional($app->created_at)->toISOString(),
            'updated_at' => optional($app->updated_at)->toISOString(),
        ];
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
}
