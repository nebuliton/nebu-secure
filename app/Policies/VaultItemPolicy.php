<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VaultItem;

class VaultItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, VaultItem $vaultItem): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($vaultItem->assigned_user_id === $user->id) {
            return true;
        }

        $userGroupIds = $user->groups()->pluck('groups.id');

        if ($userGroupIds->isEmpty()) {
            return false;
        }

        if ($vaultItem->assigned_group_id !== null && $userGroupIds->contains($vaultItem->assigned_group_id)) {
            return true;
        }

        return $vaultItem->groups()->whereIn('groups.id', $userGroupIds)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, VaultItem $vaultItem): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, VaultItem $vaultItem): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, VaultItem $vaultItem): bool
    {
        return false;
    }

    public function forceDelete(User $user, VaultItem $vaultItem): bool
    {
        return false;
    }
}
