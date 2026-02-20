<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VaultItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'username',
        'server_ip',
        'url',
        'tags_json',
        'assigned_user_id',
        'assigned_group_id',
        'created_by_admin_id',
        'updated_by_admin_id',
        'password_ciphertext',
        'password_iv',
        'password_tag',
        'notes_ciphertext',
        'notes_iv',
        'notes_tag',
        'wrapped_data_key',
        'key_version',
    ];

    protected function casts(): array
    {
        return [
            'tags_json' => 'array',
        ];
    }

    protected $hidden = [
        'password_ciphertext',
        'password_iv',
        'password_tag',
        'notes_ciphertext',
        'notes_iv',
        'notes_tag',
        'wrapped_data_key',
        'key_version',
    ];

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function assignedGroup(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'assigned_group_id');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_vault_item');
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    public function updatedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_admin_id');
    }

    public function shareLinks(): HasMany
    {
        return $this->hasMany(VaultItemShareLink::class);
    }
}
