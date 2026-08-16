<?php

namespace App\Http\Controllers\Api\Guest\Faq;

use App\Http\Controllers\Controller;
use App\Models\Guest\Faq\Faq;
use Illuminate\Http\JsonResponse;

class FaqPublicController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json($faqs);
    }
}
