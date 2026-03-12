<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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

Artisan::command('user:delete
    {--email= : E-Mail address of existing user}
    {--id= : ID of existing user}
    {--force : Skip confirmation and allow deleting the last remaining admin}
', function () {
    $email = trim((string) ($this->option('email') ?? ''));
    $id = $this->option('id');
    $force = (bool) $this->option('force');

    if ($email !== '' && $id !== null) {
        $this->error('Use either --email or --id, not both.');

        return self::FAILURE;
    }

    if ($email === '' && $id === null) {
        $email = (string) $this->ask('E-Mail');
    }

    $user = null;

    if ($id !== null) {
        if (! is_numeric($id)) {
            $this->error('User ID must be numeric.');

            return self::FAILURE;
        }

        $user = User::query()->find((int) $id);
    } else {
        $email = Str::lower(trim($email));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid e-mail address.');

            return self::FAILURE;
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();
    }

    if (! $user) {
        $identifier = $id !== null ? "ID '{$id}'" : "email '{$email}'";
        $this->error("User with {$identifier} not found.");

        return self::FAILURE;
    }

    $otherAdminCount = $user->role === 'admin'
        ? User::query()->where('role', 'admin')->whereKeyNot($user->id)->count()
        : 0;

    if ($user->role === 'admin' && $otherAdminCount === 0 && ! $force) {
        $this->error('Refusing to delete the last remaining admin without --force.');

        return self::FAILURE;
    }

    $impact = [
        'sessions' => DB::table('sessions')->where('user_id', $user->id)->count(),
        'api_tokens' => DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->count(),
        'group_memberships' => DB::table('group_user')->where('user_id', $user->id)->count(),
        'favorites' => DB::table('vault_item_favorites')->where('user_id', $user->id)->count(),
        'assigned_vault_items' => DB::table('vault_items')->where('assigned_user_id', $user->id)->count(),
        'created_vault_items' => DB::table('vault_items')->where('created_by_admin_id', $user->id)->count(),
        'share_links' => DB::table('vault_item_share_links')->where('created_by_user_id', $user->id)->count(),
        'audit_logs' => DB::table('audit_logs')->where('actor_user_id', $user->id)->count(),
        'app_settings_refs' => DB::table('app_settings')->where('updated_by_user_id', $user->id)->count(),
    ];

    $this->warn('Deleting this user will have the following effects:');
    $this->line('ID: '.$user->id);
    $this->line('Email: '.$user->email);
    $this->line('Role: '.$user->role);
    $this->line('Active: '.($user->is_active ? 'yes' : 'no'));
    $this->line('Sessions removed: '.$impact['sessions']);
    $this->line('API tokens removed: '.$impact['api_tokens']);
    $this->line('Group memberships removed: '.$impact['group_memberships']);
    $this->line('Favorites removed: '.$impact['favorites']);
    $this->line('Assigned vault items unassigned: '.$impact['assigned_vault_items']);
    $this->line('Vault items deleted via cascade: '.$impact['created_vault_items']);
    $this->line('Share-link creator references cleared: '.$impact['share_links']);
    $this->line('Audit-log actor references cleared: '.$impact['audit_logs']);
    $this->line('App-setting updater references cleared: '.$impact['app_settings_refs']);

    if (! $force && ! $this->confirm("Delete user '{$user->email}'?")) {
        $this->comment('Aborted.');

        return self::SUCCESS;
    }

    DB::transaction(function () use ($user): void {
        DB::table('sessions')->where('user_id', $user->id)->delete();

        DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->delete();

        $user->delete();
    });

    $this->info('User deleted successfully.');
    $this->line('Deleted user ID: '.$user->id);
    $this->line('Deleted user email: '.$user->email);

    return self::SUCCESS;
})->purpose('Delete a user and clean up related sessions/tokens');
