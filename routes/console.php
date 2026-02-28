<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('user:create
    {--email= : E-Mail address}
    {--password= : Plain password}
    {--name= : Display name}
    {--admin : Create as admin}
    {--inactive : Create as inactive user}
', function () {
    $email = (string) ($this->option('email') ?? '');
    $password = (string) ($this->option('password') ?? '');
    $name = (string) ($this->option('name') ?? '');

    if ($email === '') {
        $email = (string) $this->ask('E-Mail');
    }

    $email = Str::lower(trim($email));

    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('Invalid e-mail address.');

        return self::FAILURE;
    }

    if (User::query()->where('email', $email)->exists()) {
        $this->error("User with email '{$email}' already exists.");

        return self::FAILURE;
    }

    if ($name === '') {
        $defaultName = Str::of($email)->before('@')->replace(['.', '_', '-'], ' ')->title()->value();
        $name = (string) $this->ask('Name', $defaultName);
    }

    if ($password === '') {
        $password = (string) $this->secret('Password');
    }

    if (Str::length($password) < 8) {
        $this->error('Password must be at least 8 characters long.');

        return self::FAILURE;
    }

    $isAdmin = (bool) $this->option('admin');
    $isActive = ! (bool) $this->option('inactive');

    $user = User::query()->create([
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => $isAdmin ? 'admin' : 'user',
        'is_active' => $isActive,
    ]);

    $this->info('User created successfully.');
    $this->line('ID: '.$user->id);
    $this->line('Email: '.$user->email);
    $this->line('Role: '.$user->role);
    $this->line('Active: '.($user->is_active ? 'yes' : 'no'));

    return self::SUCCESS;
})->purpose('Create a user from CLI (email, password, admin flag)');

Artisan::command('user:set-admin
    {--email= : E-Mail address of existing user}
    {--revoke : Remove admin rights instead of granting them}
', function () {
    $email = (string) ($this->option('email') ?? '');

    if ($email === '') {
        $email = (string) $this->ask('E-Mail');
    }

    $email = Str::lower(trim($email));

    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('Invalid e-mail address.');

        return self::FAILURE;
    }

    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error("User with email '{$email}' not found.");

        return self::FAILURE;
    }

    $revoke = (bool) $this->option('revoke');
    $newRole = $revoke ? 'user' : 'admin';

    if ($user->role === $newRole) {
        $this->line("No change needed. User already has role '{$newRole}'.");

        return self::SUCCESS;
    }

    $user->role = $newRole;
    $user->save();

    $this->info($revoke ? 'Admin rights removed.' : 'Admin rights granted.');
    $this->line('ID: '.$user->id);
    $this->line('Email: '.$user->email);
    $this->line('Role: '.$user->role);

    return self::SUCCESS;
})->purpose('Grant or revoke admin rights for an existing user');
