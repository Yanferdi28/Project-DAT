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
        // 1. Add unique index to kategori.nama_kategori if not exists
        Schema::table('kategori', function (Blueprint $table) {
            $table->unique('nama_kategori', 'kategori_nama_kategori_unique');
        });

        // 2. Add composite unique index to sub_kategori (kategori_id + nama_sub_kategori)
        Schema::table('sub_kategori', function (Blueprint $table) {
            $table->unique(['kategori_id', 'nama_sub_kategori'], 'sub_kategori_kategori_id_nama_unique');
        });

        // 3. Add foreign key constraints to arsip_unit verified_by and verifikasi_oleh
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->foreign('verified_by', 'fk_arsip_unit_verified_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('verifikasi_oleh', 'fk_arsip_unit_verifikasi_oleh')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->dropForeign('fk_arsip_unit_verified_by');
            $table->dropForeign('fk_arsip_unit_verifikasi_oleh');
        });

        Schema::table('sub_kategori', function (Blueprint $table) {
            $table->dropUnique('sub_kategori_kategori_id_nama_unique');
        });

        Schema::table('kategori', function (Blueprint $table) {
            $table->dropUnique('kategori_nama_kategori_unique');
        });
    }
};
