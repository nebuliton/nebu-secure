<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $groupId = (int) $this->route('group')?->id;

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('groups', 'name')->ignore($groupId)],
            'member_ids' => ['sometimes', 'array'],
            'member_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
