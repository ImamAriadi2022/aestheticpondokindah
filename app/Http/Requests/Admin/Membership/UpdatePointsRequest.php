<?php

namespace App\Http\Requests\Admin\Membership;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePointsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'points' => 'required|integer|min:-100000|max:100000',
            'type' => 'sometimes|required|in:earned,redeemed,expired,adjusted',
            'description' => 'nullable|string|max:500',
        ];
    }
}
