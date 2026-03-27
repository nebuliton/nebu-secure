<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

    if (Str::length($password) < 12) {
        $this->error('Password must be at least 12 characters long.');

        return self::FAILURE;
    }

    $isAdmin = (bool) $this->option('admin');
    $isActive = ! (bool) $this->option('inactive');

    $user = User::query()->create([
        'name' => $name,
        'email' => $email,
        'password' => Hash::make($password),
        'role' => $isAdmin ? 'admin' : 'user',
        'is_active' => $isActive,
    ]);

    $this->info('User created successfully.');
    $this->table(
        ['ID', 'Name', 'E-Mail', 'Role', 'Active'],
        [[
            $user->id,
            $user->name,
            $user->email,
            $user->role,
            $user->is_active ? 'yes' : 'no',
        ]],
    );

    if (! $user->is_active) {
        $this->warn('The user is inactive and cannot log in until activated.');
    }

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
    $this->table(
        ['ID', 'Name', 'E-Mail', 'Role'],
        [[
            $user->id,
            $user->name,
            $user->email,
            $user->role,
        ]],
    );

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
    $this->table(
        ['Field', 'Value'],
        [
            ['ID', (string) $user->id],
            ['Name', $user->name],
            ['E-Mail', $user->email],
            ['Role', $user->role],
            ['Active', $user->is_active ? 'yes' : 'no'],
        ],
    );
    $this->table(
        ['Impact', 'Count'],
        [
            ['Sessions removed', (string) $impact['sessions']],
            ['API tokens removed', (string) $impact['api_tokens']],
            ['Group memberships removed', (string) $impact['group_memberships']],
            ['Favorites removed', (string) $impact['favorites']],
            ['Assigned vault items unassigned', (string) $impact['assigned_vault_items']],
            ['Vault items deleted via cascade', (string) $impact['created_vault_items']],
            ['Share-link creator references cleared', (string) $impact['share_links']],
            ['Audit-log actor references cleared', (string) $impact['audit_logs']],
            ['App-setting updater references cleared', (string) $impact['app_settings_refs']],
        ],
    );

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
    $this->table(
        ['Deleted user ID', 'Deleted user E-Mail'],
        [[(string) $user->id, $user->email]],
    );

    return self::SUCCESS;
})->purpose('Delete a user and clean up related sessions/tokens');
