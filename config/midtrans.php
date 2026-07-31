<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk integrasi payment gateway Midtrans
    |
    */

    // Mode production atau sandbox
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    // Server Key (untuk backend/API)
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    // Client Key (untuk frontend/Snap)
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    // Merchant ID
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),

    // Enable 3D Secure
    'is_3ds' => env('MIDTRANS_IS_3DS', true),

    // Enable Sanitization
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    // Snap URL
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
];
