<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateAppSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:120'],
            'app_logo_url' => ['nullable', 'url', 'max:2048'],
            'app_tagline' => ['nullable', 'string', 'max:255'],
            'app_description' => ['nullable', 'string', 'max:1000'],
            'repository_url' => ['nullable', 'url', 'max:2048'],
            'documentation_url' => ['nullable', 'url', 'max:2048'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:120'],
            'imprint_url' => ['nullable', 'url', 'max:2048'],
            'privacy_url' => ['nullable', 'url', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();

        $stringKeys = [
            'app_name',
            'app_logo_url',
            'app_tagline',
            'app_description',
            'repository_url',
            'documentation_url',
            'support_email',
            'company_name',
            'imprint_url',
            'privacy_url',
        ];

        foreach ($stringKeys as $key) {
            if (! array_key_exists($key, $input)) {
                continue;
            }

            $value = trim((string) $input[$key]);
            $input[$key] = $value === '' ? null : $value;
        }

        if (array_key_exists('app_name', $input) && $input['app_name'] !== null) {
            $input['app_name'] = Str::of($input['app_name'])->squish()->value();
        }

        $this->replace($input);
    }
}
