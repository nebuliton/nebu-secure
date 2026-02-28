<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_users_with_mixed_case_email_can_authenticate_with_lowercase_login_email(): void
    {
        $this->withoutMiddleware(ValidateCsrfToken::class);

        $password = 'LegacyPassword123!';
        $legacyEmail = 'Legacy.MixedCase@Example.com';

        User::query()->insert([
            'name' => 'Legacy User',
            'email' => $legacyEmail,
            'email_verified_at' => now(),
            'password' => Hash::make($password),
            'remember_token' => Str::random(10),
            'role' => 'user',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = User::query()->where('email', $legacyEmail)->firstOrFail();

        $response = $this->post(route('login.store'), [
            'email' => Str::lower($legacyEmail),
            'password' => $password,
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_admin_create_user_normalizes_email_to_lowercase(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New Person',
            'email' => 'New.User@Example.COM',
            'password' => 'VerySecurePass123!',
            'role' => 'user',
            'is_active' => true,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('email', 'new.user@example.com');

        $this->assertDatabaseHas('users', [
            'name' => 'New Person',
            'email' => 'new.user@example.com',
        ]);
    }
}
