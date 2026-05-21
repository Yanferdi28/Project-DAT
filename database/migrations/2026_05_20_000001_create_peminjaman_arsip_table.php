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
        Schema::create('peminjaman_arsip', function (Blueprint $table) {
            $table->id();

            // Arsip yang dipinjam
            $table->unsignedBigInteger('arsip_unit_id');
            $table->foreign('arsip_unit_id')->references('id_berkas')->on('arsip_unit')->onDelete('restrict');

            // Peminjam
            $table->foreignId('peminjam_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('unit_pengolah_id')->nullable()->constrained('unit_pengolah')->nullOnDelete();
            $table->string('nama_peminjam');
            $table->string('jabatan_peminjam')->nullable();
            $table->text('tujuan_peminjaman');

            // Tanggal
            $table->date('tanggal_pinjam');
            $table->date('tanggal_harus_kembali');
            $table->date('tanggal_kembali')->nullable();

            // Status
            $table->enum('status', ['dipinjam', 'dikembalikan', 'terlambat'])->default('dipinjam');
            $table->string('kondisi_pengembalian')->nullable(); // baik, rusak ringan, rusak berat
            $table->text('catatan')->nullable();

            // Pencatat
            $table->foreignId('dicatat_oleh')->constrained('users')->onDelete('restrict');
            $table->foreignId('dikembalikan_oleh')->nullable()->constrained('users')->onDelete('restrict');

            $table->timestamps();

            // Indexes
            $table->index(['status', 'tanggal_pinjam']);
            $table->index('arsip_unit_id');
            $table->index('peminjam_id');
            $table->index('tanggal_harus_kembali');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman_arsip');
    }
};
