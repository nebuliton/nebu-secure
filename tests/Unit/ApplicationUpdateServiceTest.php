<?php

namespace Tests\Unit;

use App\Services\AppSettingsService;
use App\Services\ApplicationUpdateService;
use App\Services\AuditLogService;
use App\Services\VersionManifestService;
use Closure;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApplicationUpdateServiceTest extends TestCase
{
    #[Test]
    public function remote_version_is_only_treated_as_update_when_it_is_newer(): void
    {
        $service = new ApplicationUpdateService(
            Mockery::mock(VersionManifestService::class),
            Mockery::mock(AppSettingsService::class),
            Mockery::mock(AuditLogService::class),
        );

        $isRemoteVersionNewer = Closure::bind(
            fn (string $remoteVersion, string $localVersion): bool => $this->isRemoteVersionNewer(
                $remoteVersion,
                $localVersion,
            ),
            $service,
            ApplicationUpdateService::class,
        );

        $this->assertNotNull($isRemoteVersionNewer);
        $this->assertTrue($isRemoteVersionNewer('0.2.0', '0.1.9'));
        $this->assertFalse($isRemoteVersionNewer('0.1.0', '0.1.0'));
        $this->assertFalse($isRemoteVersionNewer('0.1.0', '0.1.1'));
        $this->assertTrue($isRemoteVersionNewer('v1.0.1', '1.0.0'));
    }
}
