<?php

namespace Tests\Unit;

use App\Services\VersionManifestService;
use PHPUnit\Framework\Attributes\Test;
use RuntimeException;
use Tests\TestCase;

class VersionManifestServiceTest extends TestCase
{
    #[Test]
    public function shell_scripts_in_project_root_are_allowed_as_update_paths(): void
    {
        $service = new VersionManifestService();

        $manifest = $service->parseJson(json_encode([
            'version' => '0.1.3',
            'channel' => 'stable',
            'branch' => 'main',
            'update_paths' => [
                'app',
                'resources',
                'install.sh',
                'deploy-helper.sh',
            ],
        ], JSON_THROW_ON_ERROR));

        $this->assertSame(
            ['app', 'resources', 'install.sh', 'deploy-helper.sh'],
            $manifest['update_paths'],
        );
    }

    #[Test]
    public function unsafe_root_files_are_still_rejected(): void
    {
        $service = new VersionManifestService();

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Nicht erlaubter Update-Pfad [secrets.txt].');

        $service->parseJson(json_encode([
            'version' => '0.1.3',
            'channel' => 'stable',
            'branch' => 'main',
            'update_paths' => [
                'app',
                'secrets.txt',
            ],
        ], JSON_THROW_ON_ERROR));
    }
}
