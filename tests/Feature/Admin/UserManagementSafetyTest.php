<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_last_admin_cannot_be_deleted_via_api(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/admin/users/{$admin->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('user');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => 'admin',
        ]);
    }

    public function test_last_admin_cannot_be_demoted_via_api(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'user',
            'is_active' => true,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => 'admin',
        ]);
    }

    public function test_last_active_admin_cannot_be_deactivated_via_api(): void
    {
        $activeAdmin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
        ]);

        Sanctum::actingAs($activeAdmin);

        $this->patchJson("/api/admin/users/{$activeAdmin->id}/toggle-active")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('is_active');

        $this->assertDatabaseHas('users', [
            'id' => $activeAdmin->id,
            'is_active' => true,
        ]);
    }

    public function test_deleting_user_via_api_cleans_up_sessions_and_tokens(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $target = User::factory()->create([
            'email' => 'target.user@example.com',
            'is_active' => true,
        ]);

        DB::table('sessions')->insert([
            'id' => 'session-api-delete',
            'user_id' => $target->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'payload' => 'test',
            'last_activity' => now()->timestamp,
        ]);

        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => User::class,
            'tokenable_id' => $target->id,
            'name' => 'api-delete-token',
            'token' => hash('sha256', Str::random(40)),
            'abilities' => json_encode(['*']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('status', 'deleted');

        $this->assertDatabaseMissing('users', [
            'id' => $target->id,
        ]);
        $this->assertDatabaseMissing('sessions', [
            'id' => 'session-api-delete',
        ]);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $target->id,
        ]);
    }
}
