<?php

$envOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

$frontendUrl = env('FRONTEND_URL');

$defaultOrigins = array_values(array_unique(array_filter([
    'https://aestheticpondokindah.com',
    'https://www.aestheticpondokindah.com',
    $frontendUrl ? rtrim((string) $frontendUrl, '/') : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8081',
    'capacitor://localhost',
    'http://localhost',
])));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => !empty($envOrigins) ? $envOrigins : $defaultOrigins,

    'allowed_origins_patterns' => [
        '#^https://([a-z0-9-]+\.)?aestheticpondokindah\.com$#i',
    ],

    'allowed_headers' => [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-App-Version',
        'X-Client',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 86400,

    'supports_credentials' => false,

];
