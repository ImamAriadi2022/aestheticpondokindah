<?php
/**
 * Promo Meta Tag Proxy
 *
 * Serves the SPA shell with injected Open Graph meta tags for promo pages.
 * WhatsApp/Facebook crawlers read these server-rendered meta tags
 * because they do not execute JavaScript.
 */

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// --- Configuration ---
// Arsitektur baru: Laravel di root repo, API disajikan dari endpoint /api
// yang di-route oleh .htaccess root ke public/index.php.
$scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'aestheticpondokindah.com';
$siteUrl = $scheme . '://' . $host;
$apiBase = $siteUrl . '/api';
$defaultTitle = 'Aesthetic Pondok Indah Dental Clinic';
$defaultDesc = 'The solution to brighten your smile';
$defaultImage = $siteUrl . '/logo/logo.png';

// --- Parse slug from URL ---
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = trim($path, '/');

$slug = null;
if (preg_match('#^promo/(.+)$#', $path, $matches)) {
    $slug = rtrim($matches[1], '/');
}

// --- Fetch promo data ---
$promo = null;
$promos = [];

if ($slug) {
    $promo = fetchPromoDetail($apiBase, $slug);
} else {
    $promos = fetchPromoList($apiBase);
}

// --- Resolve meta values ---
if ($slug && $promo) {
    $title = ($promo['title'] ?? 'Promo') . ' | Aesthetic Pondok Indah';
    $description = $promo['description'] ?? $defaultDesc;
    $imageUrl = resolveImageUrl($promo['image_url'] ?? null, $apiBase) ?: $defaultImage;
    $pageUrl = $siteUrl . '/promo/' . $slug;
    $type = 'article';
} elseif (!$slug && !empty($promos)) {
    $title = 'Promo Spesial Aesthetic Pondok Indah Dental Clinic';
    $description = 'Dapatkan penawaran menarik untuk perawatan gigi estetik. Jangan lewatkan kesempatan untuk senyum lebih percaya diri.';
    $first = $promos[0] ?? null;
    $imageUrl = $first ? (resolveImageUrl($first['image_url'] ?? null, $apiBase) ?: $defaultImage) : $defaultImage;
    $pageUrl = $siteUrl . '/promo';
    $type = 'website';
} else {
    $title = $defaultTitle;
    $description = $defaultDesc;
    $imageUrl = $defaultImage;
    $pageUrl = $siteUrl . ($slug ? '/promo/' . $slug : '/promo');
    $type = 'website';
}

// --- Read and modify index.html ---
$indexPath = __DIR__ . '/index.html';
$indexHtml = @file_get_contents($indexPath);

if ($indexHtml === false) {
    http_response_code(500);
    echo 'Error: Unable to load page template.';
    exit;
}

$h = function ($s) {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
};

// Replace <title>
$indexHtml = preg_replace(
    '/<title>[^<]*<\/title>/s',
    '<title>' . $h($title) . '</title>',
    $indexHtml
);

// Replace simple OG / Twitter meta tags
$simpleReplacements = [
    'og:title'        => $title,
    'og:description'  => $description,
    'og:type'         => $type,
    'og:url'          => $pageUrl,
    'twitter:title'   => $title,
    'twitter:description' => $description,
];

foreach ($simpleReplacements as $property => $value) {
    $indexHtml = preg_replace(
        '/<meta\s+property="' . preg_quote($property, '/') . '"[^>]*>/s',
        '<meta property="' . $property . '" content="' . $h($value) . '" />',
        $indexHtml
    );
}

// Replace og:image and twitter:image (may span multiple lines, keep simple)
foreach (['og:image', 'twitter:image'] as $property) {
    $indexHtml = preg_replace(
        '/<meta\s+property="' . preg_quote($property, '/') . '"[^>]*>/s',
        '<meta property="' . $property . '" content="' . $h($imageUrl) . '" />',
        $indexHtml
    );
}

// Ensure og:site_name exists
if (!preg_match('/<meta\s+property="og:site_name"/s', $indexHtml)) {
    $indexHtml = str_replace('</head>', '<meta property="og:site_name" content="Aesthetic Pondok Indah" />' . "\n" . '  </head>', $indexHtml);
}

// Add / update canonical link
$canonicalTag = '<link rel="canonical" href="' . $h($pageUrl) . '" />';
if (preg_match('/<link\s+rel="canonical"/s', $indexHtml)) {
    $indexHtml = preg_replace('/<link\s+rel="canonical"[^>]*\/?>/s', $canonicalTag, $indexHtml);
} else {
    $indexHtml = str_replace('</head>', $canonicalTag . "\n" . '  </head>', $indexHtml);
}

// Add / update description meta
$descTag = '<meta name="description" content="' . $h($description) . '" />';
if (preg_match('/<meta\s+name="description"/s', $indexHtml)) {
    $indexHtml = preg_replace('/<meta\s+name="description"[^>]*\/?>/s', $descTag, $indexHtml);
} else {
    $indexHtml = str_replace('</head>', $descTag . "\n" . '  </head>', $indexHtml);
}

echo $indexHtml;

// =============================================================================
// Helper Functions
// =============================================================================

function fetchPromoDetail($apiBase, $slug)
{
    $cacheDir = __DIR__ . '/cache';
    $cacheFile = $cacheDir . '/promo_' . md5($slug) . '.json';
    $cacheTtl  = 300; // 5 minutes

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtl) {
        $cached = json_decode(@file_get_contents($cacheFile), true);
        if ($cached !== null) return $cached;
    }

    $url  = $apiBase . '/public/promos/' . urlencode($slug);
    $data = fetchJson($url);

    if ($data !== null) {
        @mkdir($cacheDir, 0755, true);
        @file_put_contents($cacheFile, json_encode($data));
    }

    return $data;
}

function fetchPromoList($apiBase)
{
    $cacheDir = __DIR__ . '/cache';
    $cacheFile = $cacheDir . '/promo_list.json';
    $cacheTtl  = 300; // 5 minutes

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtl) {
        $cached = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($cached)) return $cached;
    }

    $data = fetchJson($apiBase . '/public/promos');

    if (is_array($data)) {
        @mkdir($cacheDir, 0755, true);
        @file_put_contents($cacheFile, json_encode($data));
        return $data;
    }

    return [];
}

function fetchJson($url)
{
    if (!function_exists('curl_init')) {
        $response = @file_get_contents($url);
        if ($response === false) return null;
        return json_decode($response, true);
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err || $httpCode < 200 || $httpCode >= 300 || !$response) {
        return null;
    }

    $data = json_decode($response, true);
    return is_array($data) ? $data : null;
}

function resolveImageUrl($imageUrl, $apiBase)
{
    if (empty($imageUrl)) return null;
    if (strpos($imageUrl, 'http') === 0) return $imageUrl;

    $baseUrl = str_replace('/api', '', $apiBase);

    if (strpos($imageUrl, '/storage/') !== false) {
        $path = substr($imageUrl, strpos($imageUrl, '/storage/'));
        return $baseUrl . $path;
    }

    return $baseUrl . '/storage/' . $imageUrl;
}
