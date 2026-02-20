<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVaultItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'username' => ['nullable', 'string', 'max:180'],
            'url' => ['nullable', 'url', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:60'],
            'assigned_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'assigned_group_id' => ['nullable', 'integer', 'exists:groups,id'],
            'password' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'clear_notes' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function ($validator): void {
            if (blank($this->input('assigned_user_id')) && blank($this->input('assigned_group_id'))) {
                $validator->errors()->add('assignment', 'Bitte mindestens User oder Gruppe zuweisen.');
            }
        }];
    }
}
