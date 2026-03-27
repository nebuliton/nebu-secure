<?php

namespace App\Services;

use App\Models\UpdateRun;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class ApplicationUpdateService
{
    private const LOCK_NAME = 'application-update-run';

    private const DEPLOY_SCRIPT = './deploy.sh';

    private bool $gitSafeDirectoryConfigured = false;

    public function __construct(
        private readonly VersionManifestService $manifestService,
        private readonly AppSettingsService $appSettingsService,
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $recentRuns = $this->recentRuns();

        try {
            $localManifest = $this->manifestService->readLocal();
            $branch = $localManifest['branch'];

            $repositoryUrl = $this->runCommand(['git', 'remote', 'get-url', 'origin']);
            $currentBranch = $this->runCommand(['git', 'rev-parse', '--abbrev-ref', 'HEAD']);
            $localCommit = $this->runCommand(['git', 'rev-parse', 'HEAD']);
            $trackedChanges = $this->runLines(['git', 'status', '--porcelain', '--untracked-files=no']);

            $this->runCommand(['git', 'fetch', '--quiet', 'origin', $branch], 180);

            $remoteManifest = $this->manifestService->parseJson(
                $this->runCommand(['git', 'show', "origin/{$branch}:version.json"]),
            );
            $remoteCommit = $this->runCommand(['git', 'rev-parse', "origin/{$branch}"]);
            $allChangedFiles = $this->runLines(['git', 'diff', '--name-only', 'HEAD', "origin/{$branch}"]);
            $blockedFiles = $this->blockedFiles($allChangedFiles, $remoteManifest['update_paths']);
            $managedChangedFiles = array_values(array_diff($allChangedFiles, $blockedFiles));
            $updateAvailable = $this->isRemoteVersionNewer(
                $remoteManifest['version'],
                $localManifest['version'],
            );

            return [
                'healthy' => true,
                'error' => null,
                'repository_url' => $repositoryUrl,
                'deploy_script' => self::DEPLOY_SCRIPT,
                'current_branch' => $currentBranch,
                'branch' => $branch,
                'auto_update_enabled' => $this->autoUpdateEnabled(),
                'update_available' => $updateAvailable,
                'can_update' => $updateAvailable && $trackedChanges === [] && $blockedFiles === [],
                'local' => [
                    'version' => $localManifest['version'],
                    'channel' => $localManifest['channel'],
                    'commit' => $localCommit,
                    'short_commit' => $this->shortCommit($localCommit),
                ],
                'remote' => [
                    'version' => $remoteManifest['version'],
                    'channel' => $remoteManifest['channel'],
                    'commit' => $remoteCommit,
                    'short_commit' => $this->shortCommit($remoteCommit),
                ],
                'update_paths' => $remoteManifest['update_paths'],
                'tracked_changes' => $trackedChanges,
                'changed_files' => $managedChangedFiles,
                'blocked_files' => $blockedFiles,
                'last_run' => $recentRuns[0] ?? null,
                'recent_runs' => $recentRuns,
            ];
        } catch (\Throwable $exception) {
            return [
                'healthy' => false,
                'error' => $this->normalizeErrorMessage($exception->getMessage()),
                'repository_url' => null,
                'deploy_script' => self::DEPLOY_SCRIPT,
                'current_branch' => null,
                'branch' => null,
                'auto_update_enabled' => $this->autoUpdateEnabled(),
                'update_available' => false,
                'can_update' => false,
                'local' => null,
                'remote' => null,
                'update_paths' => [],
                'tracked_changes' => [],
                'changed_files' => [],
                'blocked_files' => [],
                'last_run' => $recentRuns[0] ?? null,
                'recent_runs' => $recentRuns,
            ];
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function run(?int $actorUserId = null, bool $automatic = false, ?callable $output = null): array
    {
        if ($automatic && ! $this->autoUpdateEnabled()) {
            return [
                'status' => 'skipped',
                'message' => 'Automatische Updates sind deaktiviert.',
                'run' => null,
                'status_snapshot' => $this->status(),
            ];
        }

        $lock = Cache::lock(self::LOCK_NAME, 1800);

        if (! $lock->get()) {
            return [
                'status' => 'busy',
                'message' => 'Es läuft bereits ein Update.',
                'run' => null,
                'status_snapshot' => $this->status(),
            ];
        }

        $run = UpdateRun::query()->create([
            'triggered_by_user_id' => $actorUserId,
            'mode' => $automatic ? 'automatic' : 'manual',
            'status' => 'running',
            'started_at' => now(),
            'log_output' => null,
        ]);

        try {
            $localManifest = $this->manifestService->readLocal();
            $branch = $localManifest['branch'];

            $localCommit = $this->runCommand(['git', 'rev-parse', 'HEAD']);
            $repositoryUrl = $this->runCommand(['git', 'remote', 'get-url', 'origin']);

            $run->forceFill([
                'local_version' => $localManifest['version'],
                'local_commit' => $localCommit,
            ])->save();

            $this->appendLog($run, "Update-Lauf gestartet ({$run->mode}).", $output);
            $this->appendLog($run, "Repository: {$repositoryUrl}", $output);
            $this->appendLog($run, "Lokale Version: {$localManifest['version']} ({$this->shortCommit($localCommit)})", $output);

            $this->runLoggedCommand(
                $run,
                "Hole Remote-Änderungen von origin/{$branch}",
                ['git', 'fetch', '--quiet', 'origin', $branch],
                $output,
                180,
            );

            $remoteManifest = $this->manifestService->parseJson(
                $this->runLoggedCommand(
                    $run,
                    'Lese Remote-Version',
                    ['git', 'show', "origin/{$branch}:version.json"],
                    $output,
                ),
            );
            $remoteCommit = $this->runCommand(['git', 'rev-parse', "origin/{$branch}"]);

            $run->forceFill([
                'target_version' => $remoteManifest['version'],
                'target_commit' => $remoteCommit,
            ])->save();

            $this->appendLog($run, "Remote-Version: {$remoteManifest['version']} ({$this->shortCommit($remoteCommit)})", $output);

            $versionComparison = $this->compareVersions(
                $remoteManifest['version'],
                $localManifest['version'],
            );

            if ($versionComparison <= 0) {
                $summary = $versionComparison === 0
                    ? 'Keine neue freigegebene Version gefunden.'
                    : 'Der Remote-Stand ist älter als die installierte Version. Es wird kein Downgrade ausgeführt.';

                $this->finishRun($run, 'skipped', $summary, [], $output);

                return [
                    'status' => 'skipped',
                    'message' => $summary,
                    'run' => $this->formatRunDetail($run->fresh()),
                    'status_snapshot' => $this->status(),
                ];
            }

            $trackedChanges = $this->runLines(['git', 'status', '--porcelain', '--untracked-files=no']);

            if ($trackedChanges !== []) {
                $summary = 'Lokale Änderungen in tracked Dateien blockieren das Update.';
                $this->appendLog($run, $summary, $output);
                $this->appendLogBlock($run, $trackedChanges, $output);
                $this->finishRun($run, 'failed', $summary, [], $output);

                return [
                    'status' => 'failed',
                    'message' => $summary,
                    'run' => $this->formatRunDetail($run->fresh()),
                    'status_snapshot' => $this->status(),
                ];
            }

            $allChangedFiles = $this->runLines(['git', 'diff', '--name-only', 'HEAD', "origin/{$branch}"]);
            $blockedFiles = $this->blockedFiles($allChangedFiles, $remoteManifest['update_paths']);
            $managedChangedFiles = array_values(array_diff($allChangedFiles, $blockedFiles));

            $run->forceFill([
                'changed_files_json' => $managedChangedFiles,
            ])->save();

            if ($blockedFiles !== []) {
                $summary = 'Das Release enthält Änderungen außerhalb der freigegebenen Update-Pfade.';
                $this->appendLog($run, $summary, $output);
                $this->appendLog($run, 'Blockierte Dateien:', $output);
                $this->appendLogBlock($run, $blockedFiles, $output);
                $this->finishRun($run, 'failed', $summary, $managedChangedFiles, $output);

                return [
                    'status' => 'failed',
                    'message' => $summary,
                    'run' => $this->formatRunDetail($run->fresh()),
                    'status_snapshot' => $this->status(),
                ];
            }

            if ($managedChangedFiles !== []) {
                $this->appendLog($run, 'Geänderte freigegebene Dateien:', $output);
                $this->appendLogBlock($run, $managedChangedFiles, $output);
            }

            $this->runLoggedCommand(
                $run,
                "Übernehme Version {$remoteManifest['version']} per git pull",
                ['git', 'pull', '--ff-only', 'origin', $branch],
                $output,
                300,
            );

            if ($this->shouldRunComposerInstall($managedChangedFiles)) {
                $this->runLoggedCommand(
                    $run,
                    'Installiere Composer-Abhängigkeiten',
                    ['composer', 'install', '--no-interaction', '--no-progress', '--prefer-dist', '--optimize-autoloader'],
                    $output,
                    1800,
                );
            } else {
                $this->appendLog($run, 'Composer-Install übersprungen.', $output);
            }

            if ($this->shouldRunNpmInstall($managedChangedFiles)) {
                $this->runLoggedCommand(
                    $run,
                    'Installiere Node-Abhängigkeiten',
                    ['npm', 'install'],
                    $output,
                    1800,
                );
            } else {
                $this->appendLog($run, 'NPM-Install übersprungen.', $output);
            }

            $this->runLoggedCommand(
                $run,
                'Führe Deploy-Skript aus',
                ['bash', self::DEPLOY_SCRIPT],
                $output,
                1800,
            );

            $finalManifest = $this->manifestService->readLocal();
            $finalCommit = $this->runCommand(['git', 'rev-parse', 'HEAD']);
            $summary = "Update auf Version {$finalManifest['version']} abgeschlossen.";

            $run->forceFill([
                'local_version' => $finalManifest['version'],
                'local_commit' => $finalCommit,
            ])->save();

            $this->finishRun($run, 'succeeded', $summary, $managedChangedFiles, $output);

            $this->auditLogService->record(
                'application_updated',
                'system_update',
                $run->id,
                [
                    'mode' => $run->mode,
                    'from_version' => $localManifest['version'],
                    'to_version' => $finalManifest['version'],
                    'changed_files' => $managedChangedFiles,
                ],
                $actorUserId,
            );

            return [
                'status' => 'succeeded',
                'message' => $summary,
                'run' => $this->formatRunDetail($run->fresh()),
                'status_snapshot' => $this->status(),
            ];
        } catch (\Throwable $exception) {
            $summary = $exception->getMessage() !== ''
                ? $this->normalizeErrorMessage($exception->getMessage())
                : 'Das Update ist fehlgeschlagen.';

            $this->appendLog($run, "Fehler: {$summary}", $output);
            $this->finishRun(
                $run,
                'failed',
                $summary,
                is_array($run->changed_files_json) ? $run->changed_files_json : [],
                $output,
            );

            return [
                'status' => 'failed',
                'message' => $summary,
                'run' => $this->formatRunDetail($run->fresh()),
                'status_snapshot' => $this->status(),
            ];
        } finally {
            $lock->release();
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function runDetail(int $runId): ?array
    {
        if (! Schema::hasTable('update_runs')) {
            return null;
        }

        $run = UpdateRun::query()->find($runId);

        if (! $run) {
            return null;
        }

        return $this->formatRunDetail($run);
    }

    private function autoUpdateEnabled(): bool
    {
        return $this->appSettingsService->get('auto_update_enabled', '0') === '1';
    }

    private function isRemoteVersionNewer(string $remoteVersion, string $localVersion): bool
    {
        return $this->compareVersions($remoteVersion, $localVersion) > 0;
    }

    private function compareVersions(string $leftVersion, string $rightVersion): int
    {
        return version_compare(
            ltrim(trim($leftVersion), 'vV'),
            ltrim(trim($rightVersion), 'vV'),
        );
    }

    /**
     * @param  list<string>  $changedFiles
     */
    private function shouldRunComposerInstall(array $changedFiles): bool
    {
        return ! file_exists(base_path('vendor/autoload.php'))
            || in_array('composer.json', $changedFiles, true)
            || in_array('composer.lock', $changedFiles, true);
    }

    /**
     * @param  list<string>  $changedFiles
     */
    private function shouldRunNpmInstall(array $changedFiles): bool
    {
        return ! is_dir(base_path('node_modules'))
            || in_array('package.json', $changedFiles, true)
            || in_array('package-lock.json', $changedFiles, true);
    }

    /**
     * @param  list<string>  $changedFiles
     * @param  list<string>  $allowedPaths
     * @return list<string>
     */
    private function blockedFiles(array $changedFiles, array $allowedPaths): array
    {
        $blocked = [];

        foreach ($changedFiles as $file) {
            if (! $this->matchesAllowedPath($file, $allowedPaths)) {
                $blocked[] = $file;
            }
        }

        return array_values(array_unique($blocked));
    }

    /**
     * @param  list<string>  $allowedPaths
     */
    private function matchesAllowedPath(string $file, array $allowedPaths): bool
    {
        foreach ($allowedPaths as $allowedPath) {
            if ($file === $allowedPath || str_starts_with($file, $allowedPath.'/')) {
                return true;
            }
        }

        return false;
    }

    private function finishRun(
        UpdateRun $run,
        string $status,
        string $summary,
        array $changedFiles,
        ?callable $output,
    ): void {
        $run->forceFill([
            'status' => $status,
            'summary' => $summary,
            'changed_files_json' => $changedFiles,
            'finished_at' => now(),
        ])->save();

        $this->appendLog($run, $summary, $output);
    }

    private function appendLog(UpdateRun $run, string $message, ?callable $output = null): void
    {
        $line = '['.now()->format('H:i:s').'] '.$message;
        $run->log_output = trim((string) ($run->log_output ?? '').PHP_EOL.$line);
        $run->save();

        if ($output !== null) {
            $output($line);
        }
    }

    /**
     * @param  list<string>  $lines
     */
    private function appendLogBlock(UpdateRun $run, array $lines, ?callable $output = null): void
    {
        foreach ($lines as $line) {
            $this->appendLog($run, "  {$line}", $output);
        }
    }

    private function runLoggedCommand(
        UpdateRun $run,
        string $description,
        array $command,
        ?callable $output = null,
        int $timeout = 900,
    ): string {
        $this->appendLog($run, "Schritt: {$description}", $output);
        $this->appendLog($run, '$ '.$this->commandToString($command), $output);

        $result = $this->runCommand($command, $timeout);
        if ($result !== '') {
            $this->appendLogBlock($run, preg_split('/\r\n|\r|\n/', $result) ?: [], $output);
        }

        return $result;
    }

    private function runCommand(array $command, int $timeout = 900): string
    {
        $workingDirectory = base_path();
        $environment = null;

        if (($command[0] ?? null) === 'git') {
            $this->ensureGitSafeDirectory();
            $environment = $this->gitEnvironment();
        }

        $process = new Process(
            $command,
            $workingDirectory,
            $environment,
            null,
            $timeout,
        );

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            throw new RuntimeException(
                'Kommando lief in ein Timeout: '.$this->commandToString($command),
                previous: $exception,
            );
        }

        $stdOut = trim($process->getOutput());
        $stdErr = trim($process->getErrorOutput());
        $combinedOutput = trim(implode(PHP_EOL, array_filter([$stdOut, $stdErr])));

        if (! $process->isSuccessful()) {
            throw new RuntimeException(
                $combinedOutput !== ''
                    ? $combinedOutput
                    : 'Kommando fehlgeschlagen: '.$this->commandToString($command),
            );
        }

        return $combinedOutput;
    }

    private function ensureGitSafeDirectory(): void
    {
        if ($this->gitSafeDirectoryConfigured) {
            return;
        }

        File::ensureDirectoryExists($this->gitHomePath());
        File::ensureDirectoryExists(dirname($this->gitConfigFilePath()));

        if (! File::exists($this->gitConfigFilePath())) {
            File::put($this->gitConfigFilePath(), '');
        }

        $safeDirectory = str_replace('\\', '/', base_path());
        $existing = $this->runUtilityCommand(
            ['git', 'config', '--global', '--list'],
            dirname(base_path()),
            $this->gitEnvironment(),
            60,
        );

        $configuredDirectories = array_values(
            array_filter(
                array_map(
                    static function (string $line): ?string {
                        $trimmed = trim($line);

                        if (! str_starts_with($trimmed, 'safe.directory=')) {
                            return null;
                        }

                        return substr($trimmed, strlen('safe.directory='));
                    },
                    preg_split('/\r\n|\r|\n/', $existing) ?: [],
                ),
                static fn (?string $line): bool => $line !== null && $line !== '',
            ),
        );

        if (! in_array($safeDirectory, $configuredDirectories, true)) {
            $this->runUtilityCommand(
                ['git', 'config', '--global', '--add', 'safe.directory', $safeDirectory],
                dirname(base_path()),
                $this->gitEnvironment(),
                60,
            );
        }

        $this->gitSafeDirectoryConfigured = true;
    }

    /**
     * @param  array<string, string>  $environment
     */
    private function runUtilityCommand(
        array $command,
        string $workingDirectory,
        array $environment,
        int $timeout = 900,
    ): string {
        $process = new Process(
            $command,
            $workingDirectory,
            $environment,
            null,
            $timeout,
        );

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            throw new RuntimeException(
                'Kommando lief in ein Timeout: '.$this->commandToString($command),
                previous: $exception,
            );
        }

        $stdOut = trim($process->getOutput());
        $stdErr = trim($process->getErrorOutput());
        $combinedOutput = trim(implode(PHP_EOL, array_filter([$stdOut, $stdErr])));

        if (! $process->isSuccessful()) {
            throw new RuntimeException(
                $combinedOutput !== ''
                    ? $combinedOutput
                    : 'Kommando fehlgeschlagen: '.$this->commandToString($command),
            );
        }

        return $combinedOutput;
    }

    /**
     * @return array<string, string>
     */
    private function gitEnvironment(): array
    {
        $home = $this->gitHomePath();

        return [
            'HOME' => $home,
            'XDG_CONFIG_HOME' => $home,
            'GIT_CONFIG_GLOBAL' => $this->gitConfigFilePath(),
            'GIT_TERMINAL_PROMPT' => '0',
        ];
    }

    private function gitHomePath(): string
    {
        return storage_path('app/update-git-home');
    }

    private function gitConfigFilePath(): string
    {
        return $this->gitHomePath().'/.gitconfig';
    }

    private function normalizeErrorMessage(string $message): string
    {
        $trimmed = trim($message);

        if ($trimmed === '') {
            return 'Unbekannter Fehler beim Update.';
        }

        if (str_contains($trimmed, 'detected dubious ownership in repository')) {
            return 'Git blockiert das Repository wegen unsicherer Besitzverhältnisse. Der Updater trägt das Repo automatisch als safe.directory ein. Falls der Fehler bleibt, prüfe Schreibrechte auf storage/ und den Webserver-Benutzer.';
        }

        if (str_contains($trimmed, "path 'version.json' exists on disk, but not in")) {
            return 'Die Remote-Branch enthält noch keine version.json. Push zuerst den neuen Update-Stand auf die Ziel-Branch.';
        }

        if (str_contains($trimmed, "No such remote 'origin'")) {
            return 'Für dieses Projekt ist kein Git-Remote namens origin konfiguriert.';
        }

        return $trimmed;
    }

    /**
     * @return list<string>
     */
    private function runLines(array $command, int $timeout = 900): array
    {
        $output = $this->runCommand($command, $timeout);

        if ($output === '') {
            return [];
        }

        return array_values(
            array_filter(
                array_map('trim', preg_split('/\r\n|\r|\n/', $output) ?: []),
                static fn (string $line): bool => $line !== '',
            ),
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recentRuns(int $limit = 5): array
    {
        if (! Schema::hasTable('update_runs')) {
            return [];
        }

        return UpdateRun::query()
            ->latest('started_at')
            ->limit($limit)
            ->get()
            ->map(fn (UpdateRun $run): array => $this->formatRunSummary($run))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatRunSummary(UpdateRun $run): array
    {
        return [
            'id' => $run->id,
            'mode' => $run->mode,
            'status' => $run->status,
            'local_version' => $run->local_version,
            'target_version' => $run->target_version,
            'local_commit' => $run->local_commit,
            'target_commit' => $run->target_commit,
            'summary' => $run->summary,
            'started_at' => $run->started_at?->toIso8601String(),
            'finished_at' => $run->finished_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatRunDetail(UpdateRun $run): array
    {
        return [
            ...$this->formatRunSummary($run),
            'changed_files' => $run->changed_files_json ?? [],
            'log_output' => $run->log_output ?? '',
        ];
    }

    private function shortCommit(?string $commit): ?string
    {
        if ($commit === null || $commit === '') {
            return null;
        }

        return substr($commit, 0, 7);
    }

    private function commandToString(array $command): string
    {
        return implode(' ', array_map(
            static fn (string $part): string => str_contains($part, ' ') ? '"'.$part.'"' : $part,
            $command,
        ));
    }
}
