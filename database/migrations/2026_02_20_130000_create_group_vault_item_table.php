<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_vault_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('vault_item_id')->constrained('vault_items')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['group_id', 'vault_item_id']);
            $table->index('vault_item_id');
        });

        DB::table('vault_items')
            ->whereNotNull('assigned_group_id')
            ->orderBy('id')
            ->chunkById(200, function ($items): void {
                $rows = [];

                foreach ($items as $item) {
                    $rows[] = [
                        'group_id' => $item->assigned_group_id,
                        'vault_item_id' => $item->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($rows !== []) {
                    DB::table('group_vault_item')->insertOrIgnore($rows);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_vault_item');
    }
};
