<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AppSettingsService
{
    private const CACHE_KEY = 'app_settings.v1';

    /**
     * @return array<string, string|null>
     */
    public function all(): array
    {
        /** @var array<string, string|null> $settings */
        $settings = Cache::rememberForever(self::CACHE_KEY, function (): array {
            /** @var array<string, string|null> $stored */
            $stored = AppSetting::query()
                ->pluck('value', 'key')
                ->all();

            return [
                ...$this->defaults(),
                ...$stored,
            ];
        });

        return $settings;
    }

    public function get(string $key, ?string $fallback = null): ?string
    {
        $all = $this->all();

        return $all[$key] ?? $fallback;
    }

    /**
     * @param  array<string, string|null>  $settings
     * @return array<string, string|null>
     */
    public function update(array $settings, ?int $updatedByUserId = null): array
    {
        DB::transaction(function () use ($settings, $updatedByUserId): void {
            foreach ($settings as $key => $value) {
                if ($value === null) {
                    AppSetting::query()->where('key', $key)->delete();

                    continue;
                }

                AppSetting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'updated_by_user_id' => $updatedByUserId,
                    ],
                );
            }
        });

        Cache::forget(self::CACHE_KEY);

        return $this->all();
    }

    /**
     * @return array<string, string|null>
     */
    public function defaults(): array
    {
        return [
            'app_name' => (string) config('app.name', 'NebU Secure Vault'),
            'app_logo_url' => null,
            'app_tagline' => 'Sicherer Team-Tresor mit serverseitiger Verschlüsselung und Audit-Log.',
            'app_description' => 'Open-Source Security Vault für Teams mit Rollen, Gruppen und zentralem Secret-Management.',
            'repository_url' => 'https://github.com/nebuliton/nebu-secure',
            'documentation_url' => 'https://github.com/nebuliton/nebu-secure#readme',
            'auto_update_enabled' => '0',
            'support_email' => null,
            'company_name' => null,
            'imprint_url' => null,
            'privacy_url' => null,
        ];
    }
}
