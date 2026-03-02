<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add additional indexes for production performance optimization.
     */
    public function up(): void
    {
        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            // Index for role-based queries
            $table->index('role');
            // Index for unit_pengolah filtering
            $table->index('unit_pengolah_id');
            // Composite index for common queries
            $table->index(['role', 'unit_pengolah_id']);
        });

        // Arsip Unit additional indexes
        if (Schema::hasTable('arsip_unit')) {
            Schema::table('arsip_unit', function (Blueprint $table) {
                // Index for date range queries
                $table->index('tanggal');
                // Index for category filtering
                $table->index('kategori_id');
                $table->index('sub_kategori_id');
                // Composite index for status filtering with date
                $table->index(['status', 'tanggal']);
                $table->index(['publish_status', 'created_at']);
            });
        }

        // Berkas Arsip additional indexes
        if (Schema::hasTable('berkas_arsip')) {
            Schema::table('berkas_arsip', function (Blueprint $table) {
                // Index for name search
                $table->index('nama_berkas');
            });
        }

        // Kode Klasifikasi additional index (MySQL only - partial index not supported on SQLite)
        if (Schema::hasTable('kode_klasifikasi') && DB::getDriverName() === 'mysql') {
            Schema::table('kode_klasifikasi', function (Blueprint $table) {
                // Index for uraian search (partial - first 191 chars for utf8mb4)
                $table->index([DB::raw('uraian(191)')], 'kode_klasifikasi_uraian_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['unit_pengolah_id']);
            $table->dropIndex(['role', 'unit_pengolah_id']);
        });

        if (Schema::hasTable('arsip_unit')) {
            Schema::table('arsip_unit', function (Blueprint $table) {
                $table->dropIndex(['tanggal']);
                $table->dropIndex(['kategori_id']);
                $table->dropIndex(['sub_kategori_id']);
                $table->dropIndex(['status', 'tanggal']);
                $table->dropIndex(['publish_status', 'created_at']);
            });
        }

        if (Schema::hasTable('berkas_arsip')) {
            Schema::table('berkas_arsip', function (Blueprint $table) {
                $table->dropIndex(['nama_berkas']);
            });
        }

        if (Schema::hasTable('kode_klasifikasi') && DB::getDriverName() === 'mysql') {
            Schema::table('kode_klasifikasi', function (Blueprint $table) {
                $table->dropIndex('kode_klasifikasi_uraian_index');
            });
        }
    }
};
