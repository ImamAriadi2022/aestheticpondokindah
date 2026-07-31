<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Contact for manual payment confirmation
    |--------------------------------------------------------------------------
    |
    | Use an international WhatsApp number without spaces, for example
    | 6281234567890. Keeping this in config makes it available even after
    | `php artisan config:cache` is run during deployment.
    |
    */
    'whatsapp' => env('CLINIC_WHATSAPP', ''),
];
