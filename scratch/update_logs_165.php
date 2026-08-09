<?php

$files = ['public/activity_log.json', 'public_html/activity_log.json'];

$newLog = [
    "id" => "act-165",
    "date" => "2026-08-09",
    "time" => "16:55",
    "category" => "Database | Backend | API | Deployment | Skill",
    "type" => "Feature",
    "feature" => "Data Wilayah Indonesia (Kepmendagri 2025/2026), WilayahSeeder, API Wilayah DB, Auto-Deploy & deploy-sync Skill",
    "description" => "Mengintegrasikan 91.599 Data Wilayah Administrasi Indonesia terbaru (Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan) ke dalam database Laravel via WilayahSeeder super-cepat (~7s), memperbarui WilayahController & RegionData agar menyajikan data wilayah dari database backend API dengan fallback lokal, menambahkan auto-detection & auto-seeding wilayah pada deploy.sh, serta membuat Skill baru .agent/skills/deploy-sync/skill.md.",
    "notes" => "1. Migration 2026_08_09_000000_create_wilayah_table.php & Model App\\Models\\Wilayah dengan scopeProvinces, scopeRegencies, scopeDistricts, scopeVillages.\n2. Seeder Database\\Seeders\\WilayahSeeder mengimpor 91.599 record dari wilayah/db/wilayah.sql dengan batch insert 1000 items per chunk (~7 detik).\n3. App\\Data\\RegionData & App\\Http\\Controllers\\Api\\WilayahController menyajikan data wilayah secara dinamis dari database backend API.\n4. frontend-web/src/core/api/wilayahApi.ts diupdate untuk fetch async ke /api/wilayah/* dengan fallback lokal.\n5. deploy.sh diperbarui dengan auto-check & auto-seeding WilayahSeeder kondisional jika tabel wilayah kosong di server produksi.\n6. Skill baru dibuat di .agent/skills/deploy-sync/skill.md untuk memastikan setiap pembaruan codebase selalu menyelaraskan script deployment deploy.sh.",
    "reason" => "Memenuhi permintaan pengintegrasian data wilayah Indonesia terbaru versi Kepmendagri dari folder wilayah/, mengupdate API frontend agar terhubung ke database backend, memperbarui script deploy.sh, serta menambahkan aturan skill baru di .agent.",
    "files" => [
        "database/migrations/2026_08_09_000000_create_wilayah_table.php",
        "app/Models/Wilayah.php",
        "database/seeders/WilayahSeeder.php",
        "database/seeders/DatabaseSeeder.php",
        "app/Data/RegionData.php",
        "app/Http/Controllers/Api/WilayahController.php",
        "routes/api.php",
        "frontend-web/src/core/api/wilayahApi.ts",
        "frontend-web/src/core/auth/pages/Login.tsx",
        "frontend-web/src/features/patient/profile/pages/ProfileEdit.tsx",
        "deploy.sh",
        ".agent/skills/deploy-sync/skill.md",
        "public/activity_log.json",
        "public_html/activity_log.json"
    ],
    "before_progress" => 99,
    "after_progress" => 100,
    "status" => "🟢 Complete",
    "author" => "Antigravity AI | Developer"
];

foreach ($files as $filePath) {
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $logs = json_decode($content, true) ?: [];
        array_unshift($logs, $newLog);
        file_put_contents($filePath, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo "Updated $filePath successfully!\n";
    }
}
