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
        Schema::create('berita_acara_penyerahan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_berita_acara')->unique();
            $table->date('tanggal_penyerahan');
            $table->unsignedBigInteger('unit_pengolah_asal_id');
            $table->unsignedBigInteger('unit_pengolah_tujuan_id')->nullable();
            $table->string('penerima_nama')->nullable(); // Jika penerima bukan unit internal
            $table->string('penerima_jabatan')->nullable();
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('dibuat_oleh');
            $table->timestamps();

            $table->foreign('unit_pengolah_asal_id')->references('id')->on('unit_pengolah')->onDelete('restrict');
            $table->foreign('unit_pengolah_tujuan_id')->references('id')->on('unit_pengolah')->onDelete('restrict');
            $table->foreign('dibuat_oleh')->references('id')->on('users')->onDelete('restrict');
        });

        // Pivot table untuk arsip yang diserahkan
        Schema::create('berita_acara_arsip', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('berita_acara_id');
            $table->unsignedBigInteger('arsip_unit_id');
            $table->text('keterangan_item')->nullable();
            $table->timestamps();

            $table->foreign('berita_acara_id')->references('id')->on('berita_acara_penyerahan')->onDelete('cascade');
            $table->foreign('arsip_unit_id')->references('id_berkas')->on('arsip_unit')->onDelete('restrict');
            
            $table->unique(['berita_acara_id', 'arsip_unit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berita_acara_arsip');
        Schema::dropIfExists('berita_acara_penyerahan');
    }
};
