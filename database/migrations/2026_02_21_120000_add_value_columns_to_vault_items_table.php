<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vault_items', function (Blueprint $table) {
            $table->text('value_ciphertext')->nullable()->after('password_tag');
            $table->text('value_iv')->nullable()->after('value_ciphertext');
            $table->text('value_tag')->nullable()->after('value_iv');
        });
    }

    public function down(): void
    {
        Schema::table('vault_items', function (Blueprint $table) {
            $table->dropColumn(['value_ciphertext', 'value_iv', 'value_tag']);
        });
    }
};
