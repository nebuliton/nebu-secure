<?php

use App\Http\Controllers\Api\Admin\AppSettingsController as AdminAppSettingsController;
use App\Http\Controllers\Api\Admin\GroupController as AdminGroupController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\VaultItemController as AdminVaultItemController;
use App\Http\Controllers\Api\VaultItemController;
use App\Http\Controllers\Api\VaultItemShareLinkController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/share-links/{token}', [VaultItemShareLinkController::class, 'consume'])->where('token', '[A-Za-z0-9]+');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', function (Request $request) {
        return response()->json($request->user()->load('groups:id,name'));
    });

    Route::prefix('/admin')->middleware('can:viewAny,App\\Models\\User')->group(function (): void {
        Route::get('settings', [AdminAppSettingsController::class, 'show']);
        Route::put('settings', [AdminAppSettingsController::class, 'update']);

        Route::apiResource('users', AdminUserController::class);
        Route::patch('users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);
        Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->middleware('throttle:sensitive');
        Route::post('users/{user}/issue-temporary-password', [AdminUserController::class, 'issueTemporaryPassword'])->middleware('throttle:sensitive');

        Route::apiResource('groups', AdminGroupController::class);
        Route::apiResource('vault-items', AdminVaultItemController::class)
            ->parameters(['vault-items' => 'vaultItem']);
    });

    Route::get('/vault-items', [VaultItemController::class, 'index']);
    Route::get('/vault-items/{vaultItem}', [VaultItemController::class, 'show']);
    Route::post('/vault-items/{vaultItem}/reveal', [VaultItemController::class, 'reveal'])->middleware('throttle:sensitive');
    Route::post('/vault-items/{vaultItem}/share-link', [VaultItemShareLinkController::class, 'store'])->middleware('throttle:sensitive');
});
