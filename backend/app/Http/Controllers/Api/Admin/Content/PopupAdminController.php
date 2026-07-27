<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Popup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PopupAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Popup::query()->orderByDesc('created_at')->get()->map(fn (Popup $p) => $this->serialize($p))->values();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'headline' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'button_label' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'enabled' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('popups', 'public');
        }

        $popup = Popup::create([
            'title' => $data['title'],
            'headline' => $data['headline'] ?? null,
            'message' => $data['message'] ?? null,
            'button_label' => $data['button_label'] ?? null,
            'button_url' => $data['button_url'] ?? null,
            'image_path' => $imagePath,
            'enabled' => (bool)($data['enabled'] ?? false),
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'priority' => $data['priority'] ?? 0,
        ]);

        return response()->json($this->serialize($popup), 201);
    }

    public function update(Request $request, Popup $popup): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'button_label' => 'nullable|string|max:255',
            'button_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'enabled' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'priority' => 'nullable|integer',
            'remove_image' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('title', $data)) $popup->title = $data['title'];
        if (array_key_exists('headline', $data)) $popup->headline = $data['headline'];
        if (array_key_exists('message', $data)) $popup->message = $data['message'];
        if (array_key_exists('button_label', $data)) $popup->button_label = $data['button_label'];
        if (array_key_exists('button_url', $data)) $popup->button_url = $data['button_url'];
        if (array_key_exists('enabled', $data)) $popup->enabled = (bool)$data['enabled'];
        if (array_key_exists('starts_at', $data)) $popup->starts_at = $data['starts_at'];
        if (array_key_exists('ends_at', $data)) $popup->ends_at = $data['ends_at'];
        if (array_key_exists('priority', $data)) $popup->priority = (int)$data['priority'];

        if (!empty($data['remove_image']) && $popup->image_path) {
            Storage::disk('public')->delete($popup->image_path);
            $popup->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($popup->image_path) {
                Storage::disk('public')->delete($popup->image_path);
            }
            $popup->image_path = $request->file('image')->store('popups', 'public');
        }

        $popup->save();
        return response()->json($this->serialize($popup));
    }

    public function destroy(Popup $popup): JsonResponse
    {
        if ($popup->image_path) {
            Storage::disk('public')->delete($popup->image_path);
        }
        $popup->delete();
        return response()->json(['ok' => true]);
    }

    private function serialize(Popup $popup): array
    {
        return [
            'id' => (string) $popup->id,
            'title' => $popup->title,
            'headline' => $popup->headline,
            'message' => $popup->message,
            'button_label' => $popup->button_label,
            'button_url' => $popup->button_url,
            'image_url' => $popup->image_path ? asset('storage/' . $popup->image_path) : null,
            'image_path' => $popup->image_path,
            'enabled' => (bool) $popup->enabled,
            'starts_at' => optional($popup->starts_at)->toISOString(),
            'ends_at' => optional($popup->ends_at)->toISOString(),
            'priority' => (int) $popup->priority,
            'created_at' => optional($popup->created_at)->toISOString(),
            'updated_at' => optional($popup->updated_at)->toISOString(),
        ];
    }
}
