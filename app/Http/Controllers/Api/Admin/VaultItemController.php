<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVaultItemRequest;
use App\Http\Requests\Admin\UpdateVaultItemRequest;
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

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', VaultItem::class);

        $items = VaultItem::query()
            ->with(['assignedUser:id,name,email', 'assignedGroup:id,name', 'groups:id,name'])
            ->latest()
            ->get();

        return response()->json($items);
    }

    public function store(StoreVaultItemRequest $request): JsonResponse
    {
        $this->authorize('create', VaultItem::class);

        $encrypted = $this->vaultItemCryptoService->encryptPayload(
            $request->input('password'),
            $request->input('value'),
            $request->input('notes'),
        );

        $groupIds = collect($request->input('group_ids', []))
            ->filter(static fn ($value): bool => $value !== null && $value !== '')
            ->map(static fn ($value): int => (int) $value)
            ->unique()
            ->values();
        $fallbackGroupId = $request->input('assigned_group_id');
        $primaryGroupId = $fallbackGroupId !== null ? (int) $fallbackGroupId : $groupIds->first();

        if ($primaryGroupId !== null && !$groupIds->contains($primaryGroupId)) {
            $groupIds->push($primaryGroupId);
        }

        $item = VaultItem::query()->create([
            'title' => $request->string('title')->value(),
            'username' => $request->input('username'),
            'server_ip' => $request->string('server_ip')->value(),
            'url' => $request->input('url'),
            'tags_json' => $request->input('tags'),
            'assigned_user_id' => $request->input('assigned_user_id'),
            'assigned_group_id' => $primaryGroupId,
            'created_by_admin_id' => $request->user()->id,
            'updated_by_admin_id' => $request->user()->id,
            ...$encrypted,
        ]);

        $item->groups()->sync($groupIds->all());

        $this->auditLogService->record('item_created', 'vault_item', $item->id, ['title' => $item->title], $request->user()?->id, $request);

        return response()->json($item->load(['assignedUser:id,name,email', 'assignedGroup:id,name', 'groups:id,name']), 201);
    }

    public function show(VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('view', $vaultItem);

        return response()->json($vaultItem->load(['assignedUser:id,name,email', 'assignedGroup:id,name', 'groups:id,name']));
    }

    public function update(UpdateVaultItemRequest $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('update', $vaultItem);

        $groupIds = collect($request->input('group_ids', []))
            ->filter(static fn ($value): bool => $value !== null && $value !== '')
            ->map(static fn ($value): int => (int) $value)
            ->unique()
            ->values();
        $fallbackGroupId = $request->input('assigned_group_id');
        $primaryGroupId = $fallbackGroupId !== null ? (int) $fallbackGroupId : $groupIds->first();

        if ($primaryGroupId !== null && !$groupIds->contains($primaryGroupId)) {
            $groupIds->push($primaryGroupId);
        }

        $payload = [
            'title' => $request->string('title')->value(),
            'username' => $request->input('username'),
            'server_ip' => $request->string('server_ip')->value(),
            'url' => $request->input('url'),
            'tags_json' => $request->input('tags'),
            'assigned_user_id' => $request->input('assigned_user_id'),
            'assigned_group_id' => $primaryGroupId,
            'updated_by_admin_id' => $request->user()->id,
        ];

        if ($request->filled('value') || $request->filled('password')) {
            $encrypted = $this->vaultItemCryptoService->encryptPayload(
                $request->input('password'),
                $request->input('value'),
                $request->boolean('clear_notes') ? null : $request->input('notes'),
            );

            $payload = [...$payload, ...$encrypted];
        } elseif ($request->has('notes') || $request->boolean('clear_notes')) {
            $notesPayload = $this->vaultItemCryptoService->encryptNotesWithExistingKey(
                $vaultItem,
                $request->boolean('clear_notes') ? null : $request->input('notes'),
            );
            $payload = [...$payload, ...$notesPayload];
        }

        $vaultItem->update($payload);
        $vaultItem->groups()->sync($groupIds->all());

        $this->auditLogService->record('item_updated', 'vault_item', $vaultItem->id, ['title' => $vaultItem->title], $request->user()?->id, $request);

        return response()->json($vaultItem->refresh()->load(['assignedUser:id,name,email', 'assignedGroup:id,name', 'groups:id,name']));
    }

    public function destroy(Request $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('delete', $vaultItem);

        $itemId = $vaultItem->id;
        $vaultItem->delete();

        $this->auditLogService->record('item_deleted', 'vault_item', $itemId, null, $request->user()?->id, $request);

        return response()->json(['status' => 'deleted']);
    }
}
