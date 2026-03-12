<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAppSettingsRequest;
use App\Models\User;
use App\Services\AppSettingsService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function uploadLogo(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
        ]);

        // Delete old logo if exists
        $currentUrl = $this->appSettingsService->get('app_logo_url');
        if ($currentUrl) {
            $oldPath = str_replace('/storage/', '', parse_url($currentUrl, PHP_URL_PATH) ?? '');
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('logo')->store('logos', 'public');
        $url = '/storage/'.$path;

        $this->appSettingsService->update(['app_logo_url' => $url], $request->user()?->id);

        $this->auditLogService->record(
            'app_logo_uploaded',
            'settings',
            null,
            ['path' => $path],
            $request->user()?->id,
            $request,
        );

        return response()->json([
            'app_logo_url' => $url,
        ]);
    }

    public function deleteLogo(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $currentUrl = $this->appSettingsService->get('app_logo_url');
        if ($currentUrl) {
            $oldPath = str_replace('/storage/', '', parse_url($currentUrl, PHP_URL_PATH) ?? '');
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $this->appSettingsService->update(['app_logo_url' => null], $request->user()?->id);

        $this->auditLogService->record(
            'app_logo_deleted',
            'settings',
            null,
            null,
            $request->user()?->id,
            $request,
        );

        return response()->json(['status' => 'deleted']);
    }
}
