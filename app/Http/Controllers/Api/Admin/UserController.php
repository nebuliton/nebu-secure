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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $user->update([
            'name' => $request->string('name')->value(),
            'email' => $request->string('email')->value(),
            'role' => $request->string('role')->value(),
            'is_active' => $request->boolean('is_active'),
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

        $user->update(['is_active' => ! $user->is_active]);

        $this->auditLogService->record('user_activation_toggled', 'user', $user->id, ['is_active' => $user->is_active], $request->user()?->id, $request);

        return response()->json($user->refresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $userId = $user->id;
        $user->delete();

        $this->auditLogService->record('user_deleted', 'user', $userId, null, $request->user()?->id, $request);

        return response()->json(['status' => 'deleted']);
    }
}
