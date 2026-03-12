<?php

namespace App\Http\Middleware;

use App\Services\AppSettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $appSettings = app(AppSettingsService::class);
        $branding = $appSettings->all();

        return [
            ...parent::share($request),
            'name' => $branding['app_name'] ?? config('app.name'),
            'branding' => $branding,
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'email_verified_at' => $request->user()->email_verified_at?->toIso8601String(),
                        'role' => $request->user()->role,
                        'is_active' => $request->user()->is_active,
                        'two_factor_enabled' => $request->user()->hasEnabledTwoFactorAuthentication(),
                    ]
                    : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
