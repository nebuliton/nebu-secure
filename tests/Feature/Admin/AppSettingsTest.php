<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_read_and_update_app_settings(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonStructure([
                'app_name',
                'app_logo_url',
                'app_tagline',
                'app_description',
                'repository_url',
                'documentation_url',
                'support_email',
                'company_name',
                'imprint_url',
                'privacy_url',
            ]);

        $response = $this->putJson('/api/admin/settings', [
            'app_name' => 'Open Source Vault',
            'app_logo_url' => 'https://example.org/logo.png',
            'app_tagline' => 'Security first.',
            'app_description' => 'A configurable open-source secret vault.',
            'repository_url' => 'https://github.com/acme/open-source-vault',
            'documentation_url' => 'https://docs.example.org/vault',
            'support_email' => 'support@example.org',
            'company_name' => 'Acme Security',
            'imprint_url' => 'https://example.org/imprint',
            'privacy_url' => 'https://example.org/privacy',
        ]);

        $response->assertOk();
        $response->assertJsonPath('app_name', 'Open Source Vault');
        $response->assertJsonPath('app_logo_url', 'https://example.org/logo.png');
        $response->assertJsonPath('support_email', 'support@example.org');

        $this->assertDatabaseHas('app_settings', [
            'key' => 'app_name',
            'value' => 'Open Source Vault',
        ]);
        $this->assertDatabaseHas('app_settings', [
            'key' => 'repository_url',
            'value' => 'https://github.com/acme/open-source-vault',
        ]);
    }

    public function test_non_admin_cannot_access_or_update_app_settings(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/settings')->assertForbidden();
        $this->putJson('/api/admin/settings', [
            'app_name' => 'Should not work',
        ])->assertForbidden();
    }
}
