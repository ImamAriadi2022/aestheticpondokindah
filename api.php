<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/bootstrap/app.php';

// This small front controller keeps the public API at /api while the React
// application is served directly from httpdocs. It avoids rewriting requests
// into /public/index.php, which some Plesk Apache configurations reject.
$app->handleRequest(Request::capture());
