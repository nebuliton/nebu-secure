<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vault_items', function (Blueprint $table) {
            $table->string('server_ip', 45)->nullable()->after('username');
        });
    }

    public function down(): void
    {
        Schema::table('vault_items', function (Blueprint $table) {
            $table->dropColumn('server_ip');
        });
    }
};
