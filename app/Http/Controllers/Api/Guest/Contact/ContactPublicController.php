<?php

namespace App\Http\Controllers\Api\Guest\Contact;

use App\Http\Controllers\Controller;
use App\Models\Guest\Contact\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactPublicController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:3000'],
        ]);

        $message = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Pesan Anda telah berhasil terkirim. Tim klinik kami akan segera menghubungi Anda.',
            'contactMessage' => $message,
        ], 201);
    }
}
