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

    #[Test]
    public function fetch_head_permission_errors_are_normalized_to_actionable_text(): void
    {
        $service = new ApplicationUpdateService(
            Mockery::mock(VersionManifestService::class),
            Mockery::mock(AppSettingsService::class),
            Mockery::mock(AuditLogService::class),
        );

        $normalizeErrorMessage = Closure::bind(
            fn (string $message): string => $this->normalizeErrorMessage($message),
            $service,
            ApplicationUpdateService::class,
        );

        $this->assertNotNull($normalizeErrorMessage);
        $this->assertSame(
            'Der Webserver-Benutzer kann nicht in .git schreiben. Das Dashboard kann deshalb weder den Remote-Stand abrufen noch Updates einspielen. Gib dem Deploy-/Webserver-Benutzer Schreibrechte auf das Repository oder führe Updates per ./update.sh aus.',
            $normalizeErrorMessage("error: cannot open .git/FETCH_HEAD: Permission denied\n"),
        );
    }

    #[Test]
    public function vite_temp_permission_errors_are_normalized_to_actionable_text(): void
    {
        $service = new ApplicationUpdateService(
            Mockery::mock(VersionManifestService::class),
            Mockery::mock(AppSettingsService::class),
            Mockery::mock(AuditLogService::class),
        );

        $normalizeErrorMessage = Closure::bind(
            fn (string $message): string => $this->normalizeErrorMessage($message),
            $service,
            ApplicationUpdateService::class,
        );

        $this->assertNotNull($normalizeErrorMessage);
        $this->assertSame(
            'Der Deploy-Benutzer kann nicht in den temporären Vite-Bereich schreiben. Dieser Release-Stand nutzt für Dashboard-Deploys jetzt den Vite Runner ohne .vite-temp. Spiele den Stand einmal manuell ein und danach laufen weitere Frontend-Updates sauberer.',
            $normalizeErrorMessage("Error: EACCES: permission denied, open '/var/www/nebu-secure/node_modules/.vite-temp/vite.config.ts.timestamp-123.mjs'"),
        );
    }

    #[Test]
    public function git_object_database_permission_errors_are_normalized_to_actionable_text(): void
    {
        $service = new ApplicationUpdateService(
            Mockery::mock(VersionManifestService::class),
            Mockery::mock(AppSettingsService::class),
            Mockery::mock(AuditLogService::class),
        );

        $normalizeErrorMessage = Closure::bind(
            fn (string $message): string => $this->normalizeErrorMessage($message),
            $service,
            ApplicationUpdateService::class,
        );

        $this->assertNotNull($normalizeErrorMessage);
        $this->assertSame(
            'Der Deploy-Benutzer kann nicht in .git/objects schreiben. Git kann deshalb neue Objekte weder empfangen noch speichern. Korrigiere Eigentümer oder ACLs für das komplette Repository inklusive .git und führe das Update danach erneut aus.',
            $normalizeErrorMessage('error: insufficient permission for adding an object to repository database .git/objects fatal: failed to write object fatal: unpack-objects failed'),
        );
    }

    #[Test]
    public function composer_install_command_uses_no_dev_outside_local_environment(): void
    {
        $service = new ApplicationUpdateService(
            Mockery::mock(VersionManifestService::class),
            Mockery::mock(AppSettingsService::class),
            Mockery::mock(AuditLogService::class),
        );

        $composerInstallCommand = Closure::bind(
            fn (): array => $this->composerInstallCommand(),
            $service,
            ApplicationUpdateService::class,
        );

        $this->assertNotNull($composerInstallCommand);
        $this->assertContains('--no-dev', $composerInstallCommand());
    }
}
