<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpdateRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'triggered_by_user_id',
        'mode',
        'status',
        'local_version',
        'target_version',
        'local_commit',
        'target_commit',
        'changed_files_json',
        'summary',
        'log_output',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'changed_files_json' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }
}
