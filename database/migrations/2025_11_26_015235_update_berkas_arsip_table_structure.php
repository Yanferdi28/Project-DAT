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
            $table->dropForeign(['klasifikasi_id']);
            $table->dropColumn('klasifikasi_id');
        });
        
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->string('klasifikasi_id')->after('nama_berkas');
            $table->foreign('klasifikasi_id')->references('kode_klasifikasi')->on('kode_klasifikasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->dropForeign(['klasifikasi_id']);
            $table->dropColumn('klasifikasi_id');
        });
        
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->foreignId('klasifikasi_id')->after('nama_berkas')->constrained('kode_klasifikasi');
        });
    }
};
