<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vault_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('username')->nullable();
            $table->string('url')->nullable();
            $table->text('tags_json')->nullable();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->foreignId('created_by_admin_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('password_ciphertext');
            $table->text('password_iv');
            $table->text('password_tag');
            $table->text('notes_ciphertext')->nullable();
            $table->text('notes_iv')->nullable();
            $table->text('notes_tag')->nullable();
            $table->text('wrapped_data_key');
            $table->unsignedInteger('key_version');
            $table->timestamps();
            $table->index(['assigned_user_id', 'assigned_group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vault_items');
    }
};
