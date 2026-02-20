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
            ->with(['assignedUser:id,name,email', 'assignedGroup:id,name'])
            ->latest()
            ->get();

        return response()->json($items);
    }

    public function store(StoreVaultItemRequest $request): JsonResponse
    {
        $this->authorize('create', VaultItem::class);

        $encrypted = $this->vaultItemCryptoService->encryptPayload(
            $request->string('password')->value(),
            $request->input('notes'),
        );

        $item = VaultItem::query()->create([
            'title' => $request->string('title')->value(),
            'username' => $request->input('username'),
            'url' => $request->input('url'),
            'tags_json' => $request->input('tags'),
            'assigned_user_id' => $request->input('assigned_user_id'),
            'assigned_group_id' => $request->input('assigned_group_id'),
            'created_by_admin_id' => $request->user()->id,
            'updated_by_admin_id' => $request->user()->id,
            ...$encrypted,
        ]);

        $this->auditLogService->record('item_created', 'vault_item', $item->id, ['title' => $item->title], $request->user()?->id, $request);

        return response()->json($item->load(['assignedUser:id,name,email', 'assignedGroup:id,name']), 201);
    }

    public function show(VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('view', $vaultItem);

        return response()->json($vaultItem->load(['assignedUser:id,name,email', 'assignedGroup:id,name']));
    }

    public function update(UpdateVaultItemRequest $request, VaultItem $vaultItem): JsonResponse
    {
        $this->authorize('update', $vaultItem);

        $payload = [
            'title' => $request->string('title')->value(),
            'username' => $request->input('username'),
            'url' => $request->input('url'),
            'tags_json' => $request->input('tags'),
            'assigned_user_id' => $request->input('assigned_user_id'),
            'assigned_group_id' => $request->input('assigned_group_id'),
            'updated_by_admin_id' => $request->user()->id,
        ];

        if ($request->filled('password')) {
            $encrypted = $this->vaultItemCryptoService->encryptPayload(
                $request->string('password')->value(),
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

        $this->auditLogService->record('item_updated', 'vault_item', $vaultItem->id, ['title' => $vaultItem->title], $request->user()?->id, $request);

        return response()->json($vaultItem->refresh()->load(['assignedUser:id,name,email', 'assignedGroup:id,name']));
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
