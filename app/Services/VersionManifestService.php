<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use RuntimeException;

class VersionManifestService
{
    private const FILE_NAME = 'version.json';

    /**
     * @var list<string>
     */
    private const SAFE_DIRECTORY_ROOTS = [
        'app',
        'bootstrap',
        'config',
        'database',
        'public',
        'resources',
        'routes',
        'tests',
    ];

    /**
     * @var list<string>
     */
    private const SAFE_ROOT_FILES = [
        'artisan',
        'composer.json',
        'composer.lock',
        'package.json',
        'package-lock.json',
        'Dockerfile',
        'docker-compose.yml',
        'deploy.sh',
        'install.sh',
        'update.sh',
        'eslint.config.js',
        'phpunit.xml',
        'tsconfig.json',
        'vite.config.ts',
        'version.json',
    ];

    /**
     * @var list<string>
     */
    private const DISALLOWED_PREFIXES = [
        '.env',
        '.git',
        'bootstrap/cache',
        'node_modules',
        'public/storage',
        'storage',
        'vendor',
    ];

    /**
     * @return array{version: string, channel: string, branch: string, update_paths: list<string>}
     */
    public function readLocal(): array
    {
        $manifestPath = base_path(self::FILE_NAME);

        if (! File::exists($manifestPath)) {
            throw new RuntimeException('version.json wurde nicht gefunden.');
        }

        /** @var string $json */
        $json = File::get($manifestPath);

        return $this->parseJson($json);
    }

    /**
     * @return array{version: string, channel: string, branch: string, update_paths: list<string>}
     */
    public function parseJson(string $json): array
    {
        try {
            $decoded = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new RuntimeException('version.json ist kein gültiges JSON.', previous: $exception);
        }

        if (! is_array($decoded)) {
            throw new RuntimeException('version.json muss ein JSON-Objekt enthalten.');
        }

        $version = trim((string) ($decoded['version'] ?? ''));
        $channel = trim((string) ($decoded['channel'] ?? 'stable'));
        $branch = trim((string) ($decoded['branch'] ?? 'main'));
        $paths = $decoded['update_paths'] ?? $this->defaultUpdatePaths();

        if ($version === '') {
            throw new RuntimeException('version.json benötigt ein Feld "version".');
        }

        if ($branch === '') {
            throw new RuntimeException('version.json benötigt ein gültiges Feld "branch".');
        }

        if (! is_array($paths)) {
            throw new RuntimeException('version.json Feld "update_paths" muss ein Array sein.');
        }

        return [
            'version' => $version,
            'channel' => $channel !== '' ? $channel : 'stable',
            'branch' => $branch,
            'update_paths' => $this->validateUpdatePaths($paths),
        ];
    }

    /**
     * @return list<string>
     */
    public function defaultUpdatePaths(): array
    {
        return [
            ...self::SAFE_DIRECTORY_ROOTS,
            ...self::SAFE_ROOT_FILES,
        ];
    }

    /**
     * @param  array<int, mixed>  $paths
     * @return list<string>
     */
    public function validateUpdatePaths(array $paths): array
    {
        $validated = [];

        foreach ($paths as $path) {
            if (! is_string($path)) {
                throw new RuntimeException('Alle update_paths Einträge müssen Strings sein.');
            }

            $normalizedPath = trim(str_replace('\\', '/', $path));
            $normalizedPath = trim($normalizedPath, '/');

            if ($normalizedPath === '' || str_contains($normalizedPath, '..')) {
                throw new RuntimeException("Ungültiger Update-Pfad [{$path}].");
            }

            foreach (self::DISALLOWED_PREFIXES as $prefix) {
                if ($normalizedPath === $prefix || str_starts_with($normalizedPath.'/', $prefix.'/')) {
                    throw new RuntimeException("Unsicherer Update-Pfad [{$normalizedPath}].");
                }
            }

            if (in_array($normalizedPath, self::SAFE_ROOT_FILES, true)) {
                $validated[] = $normalizedPath;

                continue;
            }

            $rootSegment = explode('/', $normalizedPath)[0];

            if (! in_array($rootSegment, self::SAFE_DIRECTORY_ROOTS, true)) {
                throw new RuntimeException("Nicht erlaubter Update-Pfad [{$normalizedPath}].");
            }

            $validated[] = $normalizedPath;
        }

        return array_values(array_unique($validated));
    }
}
