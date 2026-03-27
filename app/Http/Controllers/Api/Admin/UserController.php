<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetPasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()->with('groups:id,name')->orderBy('name')->get();

        return response()->json($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = User::query()->create([
            'name' => $request->string('name')->value(),
            'email' => $request->string('email')->value(),
            'password' => Hash::make($request->string('password')->value()),
            'role' => $request->string('role')->value(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogService->record('user_created', 'user', $user->id, ['role' => $user->role], $request->user()?->id, $request);

        return response()->json($user->refresh(), 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json($user->load('groups:id,name'));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $newRole = $request->string('role')->value();
        $newIsActive = $request->boolean('is_active');

        $this->ensureAdminSafetyForUpdate($user, $newRole, $newIsActive);

        $user->update([
            'name' => $request->string('name')->value(),
            'email' => $request->string('email')->value(),
            'role' => $newRole,
            'is_active' => $newIsActive,
        ]);

        $this->auditLogService->record('user_updated', 'user', $user->id, ['role' => $user->role, 'is_active' => $user->is_active], $request->user()?->id, $request);

        return response()->json($user->refresh()->load('groups:id,name'));
    }

    public function resetPassword(ResetPasswordRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $user->forceFill([
            'password' => Hash::make($request->string('password')->value()),
        ])->save();

        $this->auditLogService->record('user_password_reset', 'user', $user->id, null, $request->user()?->id, $request);

        return response()->json(['status' => 'ok']);
    }

    public function issueTemporaryPassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $temporaryPassword = Str::password(16, true, true, true, false);

        $user->forceFill([
            'password' => Hash::make($temporaryPassword),
        ])->save();

        $this->auditLogService->record('user_temporary_password_issued', 'user', $user->id, null, $request->user()?->id, $request);

        return response()->json([
            'password' => $temporaryPassword,
        ]);
    }

    public function toggleActive(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $nextIsActive = ! $user->is_active;

        $this->ensureLastActiveAdminRemainsAccessible($user, $nextIsActive);

        $user->update(['is_active' => ! $user->is_active]);

        $this->auditLogService->record('user_activation_toggled', 'user', $user->id, ['is_active' => $user->is_active], $request->user()?->id, $request);

        return response()->json($user->refresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->ensureAdminDeletionIsSafe($user);

        $userId = $user->id;

        DB::transaction(function () use ($user): void {
            DB::table('sessions')->where('user_id', $user->id)->delete();

            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)
                ->where('tokenable_id', $user->id)
                ->delete();

            $user->delete();
        });

        $this->auditLogService->record('user_deleted', 'user', $userId, null, $request->user()?->id, $request);

        return response()->json(['status' => 'deleted']);
    }

    private function ensureAdminSafetyForUpdate(User $user, string $newRole, bool $newIsActive): void
    {
        if (! $user->isAdmin()) {
            return;
        }

        if ($newRole !== 'admin') {
            $this->ensureAnotherAdminExists($user, 'role', 'Der letzte Admin darf nicht entfernt werden.');

            return;
        }

        $this->ensureLastActiveAdminRemainsAccessible($user, $newIsActive);
    }

    private function ensureAdminDeletionIsSafe(User $user): void
    {
        if (! $user->isAdmin()) {
            return;
        }

        $this->ensureAnotherAdminExists($user, 'user', 'Der letzte Admin darf nicht gelöscht werden.');
    }

    private function ensureLastActiveAdminRemainsAccessible(User $user, bool $nextIsActive): void
    {
        if (! $user->isAdmin() || ! $user->is_active || $nextIsActive) {
            return;
        }

        $otherActiveAdminExists = User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->whereKeyNot($user->id)
            ->exists();

        if (! $otherActiveAdminExists) {
            throw ValidationException::withMessages([
                'is_active' => 'Der letzte aktive Admin darf nicht deaktiviert werden.',
            ]);
        }
    }

    private function ensureAnotherAdminExists(User $user, string $field, string $message): void
    {
        $otherAdminExists = User::query()
            ->where('role', 'admin')
            ->whereKeyNot($user->id)
            ->exists();

        if (! $otherAdminExists) {
            throw ValidationException::withMessages([
                $field => $message,
            ]);
        }
    }
}
