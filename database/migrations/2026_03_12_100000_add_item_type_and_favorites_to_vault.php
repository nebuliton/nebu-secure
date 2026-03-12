<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vault_items', function (Blueprint $table) {
            $table->string('item_type', 32)->default('login')->after('title');
        });

        Schema::create('vault_item_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vault_item_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'vault_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vault_item_favorites');

        Schema::table('vault_items', function (Blueprint $table) {
            $table->dropColumn('item_type');
        });
    }
};

