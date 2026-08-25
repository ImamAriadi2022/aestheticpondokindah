<?php

namespace App\Services\Shared\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ImageOptimizationService
{
    /**
     * Optimize, resize, and convert an uploaded file or file path into a WebP image.
     *
     * @param UploadedFile|string $file
     * @param string $folder Relative folder under storage public (e.g. 'promos', 'avatars', 'gallery', 'uploads')
     * @param int $maxWidth Maximum width constraint (e.g. 1920 for banners, 1200 for posts/gallery, 800 for avatars)
     * @param int $maxHeight Maximum height constraint
     * @param int $quality WebP quality (1-100, default 82 for optimal sharpness and compact size)
     * @return string Relative storage path (e.g. 'promos/abc-123.webp')
     */
    public static function optimizeAndStore(
        UploadedFile|string $file,
        string $folder = 'uploads',
        int $maxWidth = 1920,
        int $maxHeight = 1920,
        int $quality = 82
    ): string {
        $folder = trim($folder, '/\\');
        $filename = Str::uuid()->toString() . '.webp';
        $relativePath = $folder . '/' . $filename;

        // Ensure storage directory exists
        $storageDir = storage_path('app/public/' . $folder);
        if (!is_dir($storageDir)) {
            @mkdir($storageDir, 0775, true);
        }
        $publicStorageDir = public_path('storage/' . $folder);
        if (!is_dir($publicStorageDir)) {
            @mkdir($publicStorageDir, 0775, true);
        }

        $destinationPath = storage_path('app/public/' . $relativePath);

        // Load image resource
        $img = null;
        $tempSource = null;

        try {
            if ($file instanceof UploadedFile) {
                $tempSource = $file->getRealPath();
                $img = self::createImageResourceFromFile($tempSource);
            } elseif (is_string($file)) {
                if (str_starts_with($file, 'data:image')) {
                    // Base64 DataURL
                    @[$typeHeader, $fileData] = explode(';', $file, 2);
                    @[, $base64Payload] = explode(',', $fileData, 2);
                    $decoded = base64_decode($base64Payload ?? '');
                    if ($decoded) {
                        $img = @imagecreatefromstring($decoded);
                    }
                } elseif (file_exists($file)) {
                    $tempSource = $file;
                    $img = self::createImageResourceFromFile($file);
                }
            }

            if (!$img) {
                // Fallback: if GD fails, fallback to normal storage
                if ($file instanceof UploadedFile) {
                    $path = $file->store($folder, 'public');
                    return $path;
                }
                return $folder . '/' . basename((string)$file);
            }

            // Correct EXIF orientation if available
            if ($tempSource && function_exists('exif_read_data')) {
                $img = self::fixExifOrientation($img, $tempSource);
            }

            $origWidth = imagesx($img);
            $origHeight = imagesy($img);

            // Calculate proportional dimensions
            $newWidth = $origWidth;
            $newHeight = $origHeight;

            if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
                $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
                $newWidth = max(1, (int) round($origWidth * $ratio));
                $newHeight = max(1, (int) round($origHeight * $ratio));
            }

            // Create true color destination canvas with alpha preservation
            $dst = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);

            // High quality bicubic resampling
            imagecopyresampled($dst, $img, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            // Save as WebP
            imagewebp($dst, $destinationPath, $quality);

            // Mirror to public/storage if directory exists
            $publicDest = public_path('storage/' . $relativePath);
            @copy($destinationPath, $publicDest);

            imagedestroy($img);
            imagedestroy($dst);

            return $relativePath;
        } catch (\Throwable $e) {
            Log::error('Image optimization failed, using original file: ' . $e->getMessage());
            if ($file instanceof UploadedFile) {
                return $file->store($folder, 'public');
            }
            return $relativePath;
        }
    }

    /**
     * Optimize an existing file in-place and save as .webp alongside it.
     */
    public static function convertFileToWebp(
        string $sourceFilePath,
        ?string $destinationFilePath = null,
        int $maxWidth = 1920,
        int $maxHeight = 1920,
        int $quality = 82
    ): ?string {
        if (!file_exists($sourceFilePath)) {
            return null;
        }

        $img = self::createImageResourceFromFile($sourceFilePath);
        if (!$img) {
            return null;
        }

        if (function_exists('exif_read_data')) {
            $img = self::fixExifOrientation($img, $sourceFilePath);
        }

        $origWidth = imagesx($img);
        $origHeight = imagesy($img);

        $newWidth = $origWidth;
        $newHeight = $origHeight;

        if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
            $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
            $newWidth = max(1, (int) round($origWidth * $ratio));
            $newHeight = max(1, (int) round($origHeight * $ratio));
        }

        $dst = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
        imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled($dst, $img, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        if (!$destinationFilePath) {
            $info = pathinfo($sourceFilePath);
            $destinationFilePath = $info['dirname'] . '/' . $info['filename'] . '.webp';
        }

        $dir = dirname($destinationFilePath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }

        imagewebp($dst, $destinationFilePath, $quality);

        imagedestroy($img);
        imagedestroy($dst);

        return $destinationFilePath;
    }

    /**
     * Create GD resource from various image formats.
     */
    private static function createImageResourceFromFile(string $filePath)
    {
        $mime = @mime_content_type($filePath);
        $info = @getimagesize($filePath);
        $type = $info[2] ?? null;

        if ($type === IMAGETYPE_JPEG || $mime === 'image/jpeg') {
            return @imagecreatefromjpeg($filePath);
        }
        if ($type === IMAGETYPE_PNG || $mime === 'image/png') {
            return @imagecreatefrompng($filePath);
        }
        if ($type === IMAGETYPE_WEBP || $mime === 'image/webp') {
            return @imagecreatefromwebp($filePath);
        }
        if ($type === IMAGETYPE_GIF || $mime === 'image/gif') {
            return @imagecreatefromgif($filePath);
        }
        if ($type === IMAGETYPE_BMP || $mime === 'image/bmp') {
            return @imagecreatefrombmp($filePath);
        }

        return @imagecreatefromstring(@file_get_contents($filePath));
    }

    /**
     * Auto rotate image according to EXIF metadata.
     */
    private static function fixExifOrientation($img, string $filePath)
    {
        try {
            $exif = @exif_read_data($filePath);
            if (!empty($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3:
                        $img = imagerotate($img, 180, 0);
                        break;
                    case 6:
                        $img = imagerotate($img, -90, 0);
                        break;
                    case 8:
                        $img = imagerotate($img, 90, 0);
                        break;
                }
            }
        } catch (\Throwable) {}

        return $img;
    }
}
