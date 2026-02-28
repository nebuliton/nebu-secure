<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAppSettingsRequest;
use App\Models\User;
use App\Services\AppSettingsService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;

class AppSettingsController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $appSettingsService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function show(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        return response()->json($this->appSettingsService->all());
    }

    public function update(UpdateAppSettingsRequest $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $before = $this->appSettingsService->all();
        $after = $this->appSettingsService->update($request->validated(), $request->user()?->id);

        $changedKeys = [];
        foreach ($after as $key => $value) {
            if (($before[$key] ?? null) !== $value) {
                $changedKeys[] = $key;
            }
        }

        $this->auditLogService->record(
            'app_settings_updated',
            'settings',
            null,
            ['changed_keys' => $changedKeys],
            $request->user()?->id,
            $request,
        );

        return response()->json($after);
    }
}
