<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add the bundled cover image only when a production post has no cover.
     * Existing uploads remain the source of truth.
     */
    public function up(): void
    {
        $covers = [
            'manfaat-veneer-gigi' => 'post/ketahui-manfaat-veneer-gigi-dan-efek-sampingnya-80-1661481823.jpeg',
            'cara-merawat-gigi-setelah-bleaching' => 'post/800x600bleaching.webp',
            'invisalign-vs-kawat-gigi' => 'post/Invisalign-vs-Traditional-Braces.webp',
            'pentingnya-perawatan-gigi-anak-sejak-dini' => 'post/Sampul-dental-kids-1536x829.png',
            'dental-implant-solusi-gigi-hilang' => 'post/Sampul-Implant-1-1-1536x829.png',
            'mengatasi-gigi-sensitif' => 'post/Sampul-Veneer-1536x829.png',
        ];

        foreach ($covers as $slug => $path) {
            DB::table('posts')
                ->where('slug', $slug)
                ->whereNull('cover_image_path')
                ->update(['cover_image_path' => $path]);
        }
    }

    public function down(): void
    {
        // Do not clear image paths on rollback: they may have been replaced by
        // a clinic admin after this migration ran.
    }
};
