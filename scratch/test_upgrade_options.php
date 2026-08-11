<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

$user = \App\Models\User::first();
if (!$user) {
    echo "No user found\n";
    exit;
}

$controller = app(\App\Http\Controllers\Api\User\MembershipPaymentController::class);
$request = \Illuminate\Http\Request::create('/api/membership/payment/options', 'GET');
$request->setUserResolver(fn() => $user);

$response = $controller->getUpgradeOptions($request);
echo "Response JSON:\n";
echo json_encode($response->getData(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
