<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGroupRequest;
use App\Http\Requests\Admin\UpdateGroupRequest;
use App\Models\Group;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService)
    {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Group::class);

        $groups = Group::query()->with('users:id,name,email')->orderBy('name')->get();

        return response()->json($groups);
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $this->authorize('create', Group::class);

        $group = Group::query()->create([
            'name' => $request->string('name')->value(),
        ]);

        if ($request->has('member_ids')) {
            $group->users()->sync($request->input('member_ids', []));
        }

        $this->auditLogService->record('group_created', 'group', $group->id, ['member_ids' => $request->input('member_ids', [])], $request->user()?->id, $request);

        return response()->json($group->load('users:id,name,email'), 201);
    }

    public function show(Group $group): JsonResponse
    {
        $this->authorize('view', $group);

        return response()->json($group->load('users:id,name,email'));
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $this->authorize('update', $group);

        $group->update([
            'name' => $request->string('name')->value(),
        ]);

        if ($request->has('member_ids')) {
            $group->users()->sync($request->input('member_ids', []));
        }

        $this->auditLogService->record('group_updated', 'group', $group->id, ['member_ids' => $request->input('member_ids', [])], $request->user()?->id, $request);

        return response()->json($group->refresh()->load('users:id,name,email'));
    }

    public function destroy(Request $request, Group $group): JsonResponse
    {
        $this->authorize('delete', $group);

        $groupId = $group->id;
        $group->delete();

        $this->auditLogService->record('group_deleted', 'group', $groupId, null, $request->user()?->id, $request);

        return response()->json(['status' => 'deleted']);
    }
}
