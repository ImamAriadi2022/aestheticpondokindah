<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = \App\Models\Shared\User\User::all(['id', 'name', 'email', 'google_id', 'role', 'status', 'whatsapp']);
echo "Total users: " . count($users) . "\n";
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | GoogleID: {$u->google_id} | Role: {$u->role} | Status: {$u->status} | WA: {$u->whatsapp}\n";
}