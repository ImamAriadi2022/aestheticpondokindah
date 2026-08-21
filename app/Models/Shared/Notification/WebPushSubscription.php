<?php

namespace App\Models\Shared\Notification;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebPushSubscription extends Model
{
    protected $table = 'web_push_subscriptions';

    protected $fillable = [
        'user_id',
        'role',
        'endpoint',
        'endpoint_hash',
        'public_key',
        'auth_token',
        'content_encoding',
        'user_agent',
        'last_active_at',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
