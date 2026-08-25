<?php

namespace App\Http\Controllers\Api\Shared\Media;

use App\Http\Controllers\Controller;
use App\Services\Shared\Media\ImageOptimizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'max:15360'],
        ]);

        $file = $validated['file'];
        $storedPath = ImageOptimizationService::optimizeAndStore($file, 'uploads', 1920, 1920, 82);
        $filename = basename($storedPath);
        $url = asset('storage/' . $storedPath);

        return response()->json([
            'url' => $url,
            'path' => $storedPath,
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.webp',
            'size' => file_exists(storage_path('app/public/' . $storedPath)) ? filesize(storage_path('app/public/' . $storedPath)) : $file->getSize(),
        ]);
    }
}

