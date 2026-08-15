<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->orderBy('id', 'desc');

        $status = $request->query('status');
        if ($status && in_array($status, ['unread', 'read', 'replied', 'archived'])) {
            $query->where('status', $status);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        if ($contactMessage->status === 'unread') {
            $contactMessage->update(['status' => 'read']);
        }
        return response()->json($contactMessage);
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:unread,read,replied,archived'],
            'reply_notes' => ['nullable', 'string'],
        ]);

        if (!empty($validated['reply_notes']) && $contactMessage->status !== 'replied') {
            $validated['status'] = 'replied';
            $validated['replied_at'] = now();
        }

        $contactMessage->update($validated);

        return response()->json([
            'message' => 'Pesan kontak berhasil diperbarui.',
            'contactMessage' => $contactMessage,
        ]);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json([
            'message' => 'Pesan kontak berhasil dihapus.',
        ]);
    }
}
