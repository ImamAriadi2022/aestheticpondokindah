<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Shared\Media\ImageOptimizationService;
use Illuminate\Support\Facades\DB;
use RecursiveIteratorIterator;
use RecursiveDirectoryIterator;

class OptimizeAndConvertImagesToWebpCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:convert-to-webp {--force : Force re-conversion of all images}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize, compress, and convert all static and storage images to WebP format';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        require_once app_path('Services/Shared/Media/ImageOptimizationService.php');
        $this->info('🚀 Starting batch WebP image conversion and compression...');

        $directories = [
            public_path('about'),
            public_path('carousels'),
            public_path('dashboard'),
            public_path('dokter'),
            public_path('galeri'),
            public_path('hero'),
            public_path('layanan'),
            public_path('logo'),
            public_path('mitra'),
            public_path('popup'),
            public_path('promos'),
            public_path('testi'),
            public_path('treatment'),
            base_path('frontend-web/public/about'),
            base_path('frontend-web/public/carousels'),
            base_path('frontend-web/public/dashboard'),
            base_path('frontend-web/public/dokter'),
            base_path('frontend-web/public/galeri'),
            base_path('frontend-web/public/hero'),
            base_path('frontend-web/public/layanan'),
            base_path('frontend-web/public/logo'),
            base_path('frontend-web/public/mitra'),
            base_path('frontend-web/public/popup'),
            base_path('frontend-web/public/promos'),
            base_path('frontend-web/public/testi'),
            base_path('frontend-web/public/treatment'),
            storage_path('app/public'),
        ];

        $totalOriginalBytes = 0;
        $totalConvertedBytes = 0;
        $convertedCount = 0;
        $skippedCount = 0;

        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                continue;
            }

            $this->line("📂 Scanning directory: " . str_replace(base_path(), '', $dir));

            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (!$file->isFile()) {
                    continue;
                }

                $filePath = $file->getRealPath();
                $ext = strtolower($file->getExtension());

                if (!in_array($ext, ['png', 'jpg', 'jpeg', 'bmp', 'gif'])) {
                    continue;
                }

                $webpPath = pathinfo($filePath, PATHINFO_DIRNAME) . '/' . pathinfo($filePath, PATHINFO_FILENAME) . '.webp';

                // Skip if webp already exists and is not older, unless --force
                if (file_exists($webpPath) && !$this->option('force') && filemtime($webpPath) >= filemtime($filePath)) {
                    $skippedCount++;
                    continue;
                }

                $origSize = filesize($filePath);
                $totalOriginalBytes += $origSize;

                $maxWidth = 1920;
                $maxHeight = 1920;
                $quality = 82;

                // Adjust resolution limits by folder category
                if (str_contains($filePath, 'dokter') || str_contains($filePath, 'avatars') || str_contains($filePath, 'testi')) {
                    $maxWidth = 800;
                    $maxHeight = 800;
                } elseif (str_contains($filePath, 'dashboard') || str_contains($filePath, 'layanan') || str_contains($filePath, 'logo')) {
                    $maxWidth = 1200;
                    $maxHeight = 1200;
                }

                $result = ImageOptimizationService::convertFileToWebp(
                    $filePath,
                    $webpPath,
                    $maxWidth,
                    $maxHeight,
                    $quality
                );

                if ($result && file_exists($result)) {
                    $webpSize = filesize($result);
                    $totalConvertedBytes += $webpSize;
                    $convertedCount++;
                    $savedPercent = round((1 - ($webpSize / max(1, $origSize))) * 100, 1);
                    $this->line("  ✓ " . basename($filePath) . " -> " . basename($result) . " (" . round($origSize / 1024) . "KB -> " . round($webpSize / 1024) . "KB, -{$savedPercent}%)");
                }
            }
        }

        $this->newLine();
        $this->info("✨ Image Conversion Summary:");
        $this->info("   Converted Images: {$convertedCount}");
        $this->info("   Skipped (Already WebP): {$skippedCount}");
        $this->info("   Original Size: " . round($totalOriginalBytes / 1024 / 1024, 2) . " MB");
        $this->info("   WebP Size: " . round($totalConvertedBytes / 1024 / 1024, 2) . " MB");
        if ($totalOriginalBytes > 0) {
            $totalSavedPct = round((1 - ($totalConvertedBytes / $totalOriginalBytes)) * 100, 1);
            $this->info("   Total Bandwidth Saved: {$totalSavedPct}% reduction 🎉");
        }

        // Database Path Harmonization
        $this->updateDatabaseImageReferences();

        return Command::SUCCESS;
    }

    /**
     * Harmonize DB records to point to .webp if the .webp file exists.
     */
    private function updateDatabaseImageReferences(): void
    {
        $this->info('🔄 Updating database image references to WebP where available...');

        $tables = [
            'users' => ['avatar'],
            'doctor_profiles' => ['photo'],
            'clinic_services' => ['image', 'icon'],
            'promos' => ['image_path'],
            'gallery_items' => ['image_path'],
            'posts' => ['cover_image_path'],
            'testimonials' => ['photo_path'],
            'popups' => ['image_path'],
        ];

        foreach ($tables as $table => $columns) {
            if (!\Illuminate\Support\Facades\Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column) {
                if (!\Illuminate\Support\Facades\Schema::hasColumn($table, $column)) {
                    continue;
                }

                $rows = DB::table($table)->whereNotNull($column)->get(['id', $column]);
                $updated = 0;

                foreach ($rows as $row) {
                    $val = (string) $row->{$column};
                    if (empty($val)) continue;

                    // If contains .jpg, .jpeg, .png
                    if (preg_match('/\.(png|jpg|jpeg)$/i', $val, $matches)) {
                        $newVal = preg_replace('/\.(png|jpg|jpeg)$/i', '.webp', $val);

                        // Check if corresponding webp file exists in public or storage
                        $storageCandidate = storage_path('app/public/' . ltrim($newVal, '/'));
                        $publicCandidate = public_path(ltrim($newVal, '/'));

                        if (file_exists($storageCandidate) || file_exists($publicCandidate) || file_exists(public_path('storage/' . ltrim($newVal, '/')))) {
                            DB::table($table)->where('id', $row->id)->update([$column => $newVal]);
                            $updated++;
                        }
                    }
                }

                if ($updated > 0) {
                    $this->line("  ✓ Updated {$updated} records in {$table}.{$column}");
                }
            }
        }
    }
}
