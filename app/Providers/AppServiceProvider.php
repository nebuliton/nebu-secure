<?php

namespace App\Providers;

use App\Models\Group;
use App\Models\User;
use App\Models\VaultItem;
use App\Policies\GroupPolicy;
use App\Policies\UserPolicy;
use App\Policies\VaultItemPolicy;
use App\Services\AuditLogService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if ($this->app->environment('local')) {
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    public function boot(AuditLogService $auditLogService): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Group::class, GroupPolicy::class);
        Gate::policy(VaultItem::class, VaultItemPolicy::class);

        RateLimiter::for('sensitive', function (Request $request): Limit {
            $userId = $request->user()?->id ?? 'guest';
            return Limit::perMinute(20)->by($userId.'|'.$request->ip());
        });

        Event::listen(Login::class, function (Login $event) use ($auditLogService): void {
            $auditLogService->record('login', 'auth', $event->user->id, null, $event->user->id, request());
        });

        Event::listen(Logout::class, function (Logout $event) use ($auditLogService): void {
            $auditLogService->record('logout', 'auth', $event->user?->id, null, $event->user?->id, request());
        });
    }
}
