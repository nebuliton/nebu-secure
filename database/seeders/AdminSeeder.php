<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@local.test'],
            [
                'name' => 'NebU Admin',
                'password' => Hash::make('Admin123!ChangeMe'),
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if (app()->isLocal()) {
            $this->command?->line('NebU Secure Vault Local Logins:');
            $this->command?->line('Admin: admin@local.test / Admin123!ChangeMe');
        }
    }
}
