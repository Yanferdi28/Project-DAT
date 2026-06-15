<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('arsip_unit')) {
            return;
        }

        if (Schema::hasColumn('arsip_unit', 'skkaad') && !Schema::hasColumn('arsip_unit', 'klasifikasi_keamanan')) {
            Schema::table('arsip_unit', function (Blueprint $table) {
                $table->renameColumn('skkaad', 'klasifikasi_keamanan');
            });
        }

        if (!Schema::hasColumn('arsip_unit', 'klasifikasi_keamanan')) {
            Schema::table('arsip_unit', function (Blueprint $table) {
                $table->string('klasifikasi_keamanan')->nullable();
            });
        }

        if (!Schema::hasTable('kode_klasifikasi')) {
            return;
        }

        $arsipUnits = DB::table('arsip_unit')
            ->whereNotNull('kode_klasifikasi_id')
            ->get(['id_berkas', 'kode_klasifikasi_id']);

        $keamananByKode = DB::table('kode_klasifikasi')
            ->whereIn('id', $arsipUnits->pluck('kode_klasifikasi_id')->unique())
            ->pluck('klasifikasi_keamanan', 'id');

        foreach ($arsipUnits as $arsipUnit) {
            $klasifikasiKeamanan = $keamananByKode[$arsipUnit->kode_klasifikasi_id] ?? null;

            if (!$klasifikasiKeamanan) {
                continue;
            }

            DB::table('arsip_unit')
                ->where('id_berkas', $arsipUnit->id_berkas)
                ->update(['klasifikasi_keamanan' => $klasifikasiKeamanan]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Klasifikasi keamanan is now the canonical column in the base schema.
    }
};
