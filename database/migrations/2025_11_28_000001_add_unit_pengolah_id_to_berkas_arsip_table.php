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
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->foreignId('unit_pengolah_id')->nullable()->after('klasifikasi_id')->constrained('unit_pengolah')->nullOnDelete();
            $table->index('unit_pengolah_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->dropForeign(['unit_pengolah_id']);
            $table->dropIndex(['unit_pengolah_id']);
            $table->dropColumn('unit_pengolah_id');
        });
    }
};
