<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VaultItem;
use App\Models\VaultItemShareLink;
use App\Services\AuditLogService;
use App\Services\VaultItemCryptoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VaultItemShareLinkController extends Controller
{
    public function __construct(
        private readonly VaultItemCryptoService $vaultItemCryptoService,
        private readonly AuditLogService $auditLogService,
    ) {
    }

    public function store(Request $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('view', $vaultItem);

        $plainToken = Str::random(64);
        $expiresAt = now()->addDay();

        VaultItemShareLink::query()->create([
            'vault_item_id' => $vaultItem->id,
            'created_by_user_id' => $request->user()?->id,
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => $expiresAt,
        ]);

        $this->auditLogService->record('item_share_link_created', 'vault_item', $vaultItem->id, ['title' => $vaultItem->title], $request->user()?->id, $request);

        return response()->json([
            'url' => url("/share/{$plainToken}"),
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    public function consume(Request $request, string $token): JsonResponse
    {
        $tokenHash = hash('sha256', $token);

        $payload = DB::transaction(function () use ($tokenHash, $request): ?array {
            $shareLink = VaultItemShareLink::query()
                ->where('token_hash', $tokenHash)
                ->where(function ($query): void {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->lockForUpdate()
                ->first();

            if ($shareLink === null) {
                return null;
            }

            $vaultItem = VaultItem::query()->find($shareLink->vault_item_id);

            $shareLink->delete();

            if ($vaultItem === null) {
                return null;
            }

            $secret = $this->vaultItemCryptoService->decrypt($vaultItem);

            $this->auditLogService->record('item_share_link_consumed', 'vault_item', $vaultItem->id, ['title' => $vaultItem->title], null, $request);

            return [
                'title' => $vaultItem->title,
                'username' => $vaultItem->username,
                'server_ip' => $vaultItem->server_ip,
                'url' => $vaultItem->url,
                'value' => $secret['value'],
                'password' => $secret['password'],
                'notes' => $secret['notes'],
            ];
        });

        if ($payload === null) {
            return response()->json(['message' => 'Link ist ungültig oder bereits verwendet.'], 404);
        }

        return response()->json($payload);
    }
}
