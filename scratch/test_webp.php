<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$src = storage_path('app/public/popups/Gt8o0D1bRP3xpTYucU1yLIlK8aXjWsBOn7Aqd71s.png');
if (file_exists($src)) {
    $img = @imagecreatefrompng($src);
    if ($img) {
        $origW = imagesx($img);
        $origH = imagesy($img);

        $maxW = 1200;
        $maxH = 1200;
        $newW = $origW;
        $newH = $origH;

        if ($origW > $maxW || $origH > $maxH) {
            $ratio = min($maxW / $origW, $maxH / $origH);
            $newW = (int) round($origW * $ratio);
            $newH = (int) round($origH * $ratio);
        }

        $canvas = imagecreatetruecolor($newW, $newH);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $img, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        $dest = storage_path('app/public/popups/test_compressed.webp');
        imagewebp($canvas, $dest, 85);

        imagedestroy($canvas);
        imagedestroy($img);

        echo "Original PNG size: " . round(filesize($src) / 1024, 2) . " KB ($origW x $origH px)\n";
        echo "WebP compressed size: " . round(filesize($dest) / 1024, 2) . " KB ($newW x $newH px)\n";
        echo "Size reduction: " . round((1 - filesize($dest) / filesize($src)) * 100, 2) . "%\n";
    }
}
