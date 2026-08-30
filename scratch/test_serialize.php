<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\Shared\User\User::first();
if ($user) {
    $authController = new \App\Http\Controllers\Api\Shared\Auth\AuthController();
    $serialized = $authController->serializeUser($user);
    echo "SUCCESS: serialized user ID: " . $serialized['id'] . ", name: " . $serialized['name'] . "\n";
    echo "has_google: " . ($serialized['has_google'] ? 'true' : 'false') . "\n";
} else {
    echo "No user in database.\n";
}