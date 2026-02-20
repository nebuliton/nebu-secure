<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    public function record(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?array $meta = null,
        ?int $actorUserId = null,
        ?Request $request = null,
    ): void {
        AuditLog::query()->create([
            'actor_user_id' => $actorUserId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'meta_json' => $meta,
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
