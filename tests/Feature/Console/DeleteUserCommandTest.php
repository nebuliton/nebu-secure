<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DeleteUserCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_deleted_by_email_via_command(): void
    {
        $user = User::factory()->create([
            'email' => 'delete.me@example.com',
        ]);

        DB::table('sessions')->insert([
            'id' => 'session-delete-user',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'payload' => 'test',
            'last_activity' => now()->timestamp,
        ]);

        $this->artisan('user:delete', ['--email' => 'Delete.Me@Example.com'])
            ->expectsConfirmation("Delete user 'delete.me@example.com'?", 'yes')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);

        $this->assertDatabaseMissing('sessions', [
            'id' => 'session-delete-user',
        ]);
    }

    public function test_last_admin_cannot_be_deleted_without_force(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@example.com',
        ]);

        $this->artisan('user:delete', ['--email' => $admin->email])
            ->expectsOutput('Refusing to delete the last remaining admin without --force.')
            ->assertExitCode(1);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }
}
