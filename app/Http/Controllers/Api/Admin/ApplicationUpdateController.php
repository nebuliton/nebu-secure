<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AppSettingsService;
use App\Services\ApplicationUpdateService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationUpdateController extends Controller
{
    public function __construct(
        private readonly ApplicationUpdateService $applicationUpdateService,
        private readonly AppSettingsService $appSettingsService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function show(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        return response()->json($this->applicationUpdateService->status());
    }

    public function run(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $result = $this->applicationUpdateService->run(
            actorUserId: $request->user()?->id,
            automatic: false,
        );

        return response()->json($result);
    }

    public function preferences(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $validated = $request->validate([
            'auto_update_enabled' => ['required', 'boolean'],
        ]);

        $enabled = (bool) $validated['auto_update_enabled'];

        $this->appSettingsService->update([
            'auto_update_enabled' => $enabled ? '1' : '0',
        ], $request->user()?->id);

        $this->auditLogService->record(
            'application_update_preferences_updated',
            'system_update',
            null,
            ['auto_update_enabled' => $enabled],
            $request->user()?->id,
            $request,
        );

        return response()->json([
            'auto_update_enabled' => $enabled,
        ]);
    }

    public function runShow(int $runId): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $run = $this->applicationUpdateService->runDetail($runId);

        abort_if($run === null, 404);

        return response()->json($run);
    }
}
