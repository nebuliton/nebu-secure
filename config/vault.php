<?php

use Illuminate\Support\Str;

$keys = [];
$file = env('VAULT_MASTER_KEY_FILE');

if ($file && is_file($file)) {
    $parsed = json_decode((string) file_get_contents($file), true);
    if (is_array($parsed)) {
        foreach ($parsed as $version => $keyValue) {
            if (is_numeric($version) && is_string($keyValue) && $keyValue !== '') {
                $keys[(int) $version] = $keyValue;
            }
        }
    }
}

$envKeys = explode(',', (string) env('VAULT_MASTER_KEYS', ''));

foreach ($envKeys as $entry) {
    $entry = trim($entry);
    if ($entry === '' || ! str_contains($entry, ':')) {
        continue;
    }

    [$version, $value] = explode(':', $entry, 2);

    if (is_numeric($version) && $value !== '') {
        $keys[(int) $version] = trim($value);
    }
}

if (count($keys) === 0 && env('VAULT_MASTER_KEY')) {
    $keys[1] = (string) env('VAULT_MASTER_KEY');
}

if (count($keys) === 0 && env('APP_ENV', 'production') === 'local') {
    $keys[1] = 'base64:'.base64_encode(Str::random(64));
}

ksort($keys);

return [
    'master_keys' => $keys,
    'current_key_version' => (int) env('VAULT_CURRENT_KEY_VERSION', count($keys) > 0 ? max(array_keys($keys)) : 1),
];
