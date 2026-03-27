<?php

namespace Tests\Feature\Admin;

use App\Models\UpdateRun;
use App\Models\User;
use App\Services\ApplicationUpdateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use Tests\TestCase;

class ApplicationUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_read_update_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->mock(ApplicationUpdateService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('status')
                ->once()
                ->andReturn([
                    'healthy' => true,
                    'error' => null,
                    'repository_url' => 'https://github.com/nebuliton/nebu-secure.git',
                    'deploy_script' => './deploy.sh',
                    'current_branch' => 'main',
                    'branch' => 'main',
                    'auto_update_enabled' => false,
                    'update_available' => true,
                    'can_update' => true,
                    'local' => [
                        'version' => '0.1.0',
                        'channel' => 'stable',
                        'commit' => 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                        'short_commit' => 'aaaaaaa',
                    ],
                    'remote' => [
                        'version' => '0.2.0',
                        'channel' => 'stable',
                        'commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                        'short_commit' => 'bbbbbbb',
                    ],
                    'update_paths' => ['app', 'resources', 'routes'],
                    'tracked_changes' => [],
                    'changed_files' => ['app/Services/ApplicationUpdateService.php'],
                    'blocked_files' => [],
                    'last_run' => null,
                    'recent_runs' => [],
                ]);
        });

        $this->getJson('/api/admin/updates')
            ->assertOk()
            ->assertJsonPath('local.version', '0.1.0')
            ->assertJsonPath('remote.version', '0.2.0')
            ->assertJsonPath('update_available', true);
    }

    public function test_admin_can_trigger_update_run(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->mock(ApplicationUpdateService::class, function (MockInterface $mock) use ($admin): void {
            $mock->shouldReceive('run')
                ->once()
                ->with($admin->id, false)
                ->andReturn([
                    'status' => 'succeeded',
                    'message' => 'Update abgeschlossen',
                    'run' => [
                        'id' => 7,
                        'mode' => 'manual',
                        'status' => 'succeeded',
                        'local_version' => '0.2.0',
                        'target_version' => '0.2.0',
                        'local_commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                        'target_commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                        'summary' => 'Update abgeschlossen',
                        'started_at' => now()->toIso8601String(),
                        'finished_at' => now()->toIso8601String(),
                        'changed_files' => ['resources/js/pages/admin/settings.tsx'],
                        'log_output' => 'ok',
                    ],
                    'status_snapshot' => [
                        'healthy' => true,
                        'error' => null,
                        'repository_url' => 'https://github.com/nebuliton/nebu-secure.git',
                        'deploy_script' => './deploy.sh',
                        'current_branch' => 'main',
                        'branch' => 'main',
                        'auto_update_enabled' => false,
                        'update_available' => false,
                        'can_update' => false,
                        'local' => [
                            'version' => '0.2.0',
                            'channel' => 'stable',
                            'commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                            'short_commit' => 'bbbbbbb',
                        ],
                        'remote' => [
                            'version' => '0.2.0',
                            'channel' => 'stable',
                            'commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                            'short_commit' => 'bbbbbbb',
                        ],
                        'update_paths' => ['app', 'resources', 'routes'],
                        'tracked_changes' => [],
                        'changed_files' => [],
                        'blocked_files' => [],
                        'last_run' => null,
                        'recent_runs' => [],
                    ],
                ]);
        });

        $this->postJson('/api/admin/updates/run')
            ->assertOk()
            ->assertJsonPath('status', 'succeeded')
            ->assertJsonPath('run.id', 7);
    }

    public function test_admin_can_update_auto_update_preference_and_read_run_detail(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson('/api/admin/updates/preferences', [
            'auto_update_enabled' => true,
        ])
            ->assertOk()
            ->assertJsonPath('auto_update_enabled', true);

        $this->assertDatabaseHas('app_settings', [
            'key' => 'auto_update_enabled',
            'value' => '1',
        ]);

        $run = UpdateRun::query()->create([
            'triggered_by_user_id' => $admin->id,
            'mode' => 'manual',
            'status' => 'succeeded',
            'local_version' => '0.2.0',
            'target_version' => '0.2.0',
            'local_commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            'target_commit' => 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            'changed_files_json' => ['routes/api.php'],
            'summary' => 'Update abgeschlossen',
            'log_output' => 'ok',
            'started_at' => now(),
            'finished_at' => now(),
        ]);

        $this->getJson("/api/admin/updates/runs/{$run->id}")
            ->assertOk()
            ->assertJsonPath('id', $run->id)
            ->assertJsonPath('changed_files.0', 'routes/api.php');
    }

    public function test_non_admin_cannot_access_update_endpoints(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/updates')->assertForbidden();
        $this->postJson('/api/admin/updates/run')->assertForbidden();
        $this->patchJson('/api/admin/updates/preferences', [
            'auto_update_enabled' => true,
        ])->assertForbidden();
        $this->getJson('/api/admin/updates/runs/1')->assertForbidden();
    }
}
