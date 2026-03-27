<?php

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateUserCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_create_command_hashes_the_password(): void
    {
        $this->artisan('user:create', [
            '--email' => 'cli.user@example.com',
            '--name' => 'CLI User',
            '--password' => 'VerySecurePass123!',
        ])->assertExitCode(0);

        $this->assertDatabaseHas('users', [
            'email' => 'cli.user@example.com',
        ]);

        $storedHash = \App\Models\User::query()
            ->where('email', 'cli.user@example.com')
            ->value('password');

        $this->assertNotSame('VerySecurePass123!', $storedHash);
        $this->assertTrue(Hash::check('VerySecurePass123!', $storedHash));
    }

    public function test_user_create_command_rejects_passwords_shorter_than_twelve_characters(): void
    {
        $this->artisan('user:create', [
            '--email' => 'short.password@example.com',
            '--name' => 'Short Password',
            '--password' => 'short-pass',
        ])
            ->expectsOutput('Password must be at least 12 characters long.')
            ->assertExitCode(1);

        $this->assertDatabaseMissing('users', [
            'email' => 'short.password@example.com',
        ]);
    }
}
