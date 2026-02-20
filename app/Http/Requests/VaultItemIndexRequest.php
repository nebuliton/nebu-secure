<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VaultItemIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'scope' => ['nullable', Rule::in(['all', 'direct', 'group'])],
            'tag' => ['nullable', 'string', 'max:60'],
        ];
    }
}
