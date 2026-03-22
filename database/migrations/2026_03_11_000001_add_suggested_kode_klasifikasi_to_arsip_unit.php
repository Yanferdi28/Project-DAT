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
            $table->foreignId('suggested_kode_klasifikasi_id')
                ->nullable()
                ->after('ocr_processed_at')
                ->constrained('kode_klasifikasi')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->dropForeign(['suggested_kode_klasifikasi_id']);
            $table->dropColumn('suggested_kode_klasifikasi_id');
        });
    }
};
