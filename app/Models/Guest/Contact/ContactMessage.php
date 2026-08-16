<?php

namespace App\Models\Guest\Contact;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'reply_notes',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
        ];
    }

    public function scopeUnread($query)
    {
        return $query->where('status', 'unread');
    }

    public function scopeReplied($query)
    {
        return $query->where('status', 'replied');
    }
}
