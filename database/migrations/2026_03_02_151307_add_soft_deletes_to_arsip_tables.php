<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
