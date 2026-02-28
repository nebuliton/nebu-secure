<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/share/{token}', function (string $token) {
    return Inertia::render('vault/shared', [
        'token' => $token,
    ]);
})->where('token', '[A-Za-z0-9]+')->name('vault.share');

Route::middleware(['auth', 'active'])->group(function (): void {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/admin', function () {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('/admin/users', function () {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Inertia::render('admin/users');
    })->name('admin.users');

    Route::get('/admin/groups', function () {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Inertia::render('admin/groups');
    })->name('admin.groups');

    Route::get('/admin/vault-items', function () {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Inertia::render('admin/vault-items');
    })->name('admin.vault-items');

    Route::get('/admin/settings', function () {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Inertia::render('admin/settings');
    })->name('admin.settings');

    Route::get('/vault', function () {
        return Inertia::render('vault/index');
    })->name('vault.index');
});

require __DIR__.'/settings.php';
