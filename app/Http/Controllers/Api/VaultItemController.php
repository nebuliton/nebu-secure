<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VaultItemIndexRequest;
use App\Models\VaultItem;
use App\Services\AuditLogService;
use App\Services\VaultItemCryptoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VaultItemController extends Controller
{
    public function __construct(
        private readonly VaultItemCryptoService $vaultItemCryptoService,
        private readonly AuditLogService $auditLogService,
    ) {
    }

    public function index(VaultItemIndexRequest $request): JsonResponse
    {
        $this->authorize('viewAny', VaultItem::class);

        $user = $request->user();
        $groupIds = $user->groups()->pluck('groups.id');

        $query = VaultItem::query()
            ->with(['assignedUser:id,name,email', 'assignedGroup:id,name'])
            ->where(function ($builder) use ($user, $groupIds): void {
                $builder->where('assigned_user_id', $user->id)
                    ->orWhereIn('assigned_group_id', $groupIds);
            });

        $scope = $request->input('scope', 'all');

        if ($scope === 'direct') {
            $query->where('assigned_user_id', $user->id);
        }

        if ($scope === 'group') {
            $query->whereIn('assigned_group_id', $groupIds);
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->value();
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tag')) {
            $tag = $request->string('tag')->value();
            $query->where('tags_json', 'like', "%{$tag}%");
        }

        return response()->json($query->latest()->get());
    }

    public function show(Request $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('view', $vaultItem);

        return response()->json($vaultItem->load(['assignedUser:id,name,email', 'assignedGroup:id,name']));
    }

    public function reveal(Request $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('view', $vaultItem);

        $secret = $this->vaultItemCryptoService->decrypt($vaultItem);

        $this->auditLogService->record('item_revealed', 'vault_item', $vaultItem->id, ['title' => $vaultItem->title], $request->user()?->id, $request);

        return response()->json($secret);
    }
}
