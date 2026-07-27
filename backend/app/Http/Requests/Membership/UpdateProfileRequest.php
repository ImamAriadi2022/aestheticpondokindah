<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gender' => 'sometimes|required|in:male,female,other',
            'date_of_birth' => 'sometimes|required|date|before:today',
            'city' => 'sometimes|required|string|max:100',
            'dental_concerns' => 'sometimes|array',
            'dental_concerns.*' => 'string',
            'treatment_interests' => 'sometimes|array',
            'treatment_interests.*' => 'string',
            'dental_conditions' => 'sometimes|array',
            'dental_conditions.*' => 'string',
            'last_dental_visit' => 'sometimes|nullable|date|before_or_equal:today',
            'lifestyle_interests' => 'sometimes|array',
            'lifestyle_interests.*' => 'string',
            'personal_goals' => 'sometimes|array',
            'personal_goals.*' => 'string',
            'communication_preferences' => 'sometimes|array',
            'communication_preferences.*' => 'string',
            'content_preferences' => 'sometimes|array',
            'content_preferences.*' => 'string',
        ];
    }
}
