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

        if ($vaultItem->assigned_group_id === null) {
            return false;
        }

        return $user->groups()->where('groups.id', $vaultItem->assigned_group_id)->exists();
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
