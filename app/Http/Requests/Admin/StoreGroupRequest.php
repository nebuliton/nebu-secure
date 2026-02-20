<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:groups,name'],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
