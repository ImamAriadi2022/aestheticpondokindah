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
            'points' => 'required|integer|min:-10000|max:10000',
            'type' => 'sometimes|required|in:earned,redeemed,expired,adjusted',
            'description' => 'sometimes|string|max:500',
        ];
    }
}
