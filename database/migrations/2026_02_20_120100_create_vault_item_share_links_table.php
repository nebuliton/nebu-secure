<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vault_item_share_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vault_item_id')->constrained('vault_items')->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index(['vault_item_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vault_item_share_links');
    }
};
