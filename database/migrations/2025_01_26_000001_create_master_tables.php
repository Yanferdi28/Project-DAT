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
        // 1. Kode Klasifikasi
        Schema::create('kode_klasifikasi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_klasifikasi')->unique();
            $table->string('kode_klasifikasi_induk')->nullable();
            $table->string('uraian');
            $table->integer('retensi_aktif');
            $table->integer('retensi_inaktif');
            $table->enum('status_akhir', ['Musnah', 'Permanen', 'Dinilai Kembali'])->default('Dinilai Kembali');
            $table->enum('klasifikasi_keamanan', ['Biasa', 'Rahasia', 'Terbatas'])->default('Biasa');
            $table->timestamps();
            
            $table->index('kode_klasifikasi_induk');
        });

        // 2. Unit Pengolah
        Schema::create('unit_pengolah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_unit')->unique();
        });

        // 3. Kategori
        Schema::create('kategori', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        // 4. Sub Kategori
        Schema::create('sub_kategori', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('cascade');
            $table->string('nama_sub_kategori');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
            
            $table->index('kategori_id');
        });

        // 5. Berkas Arsip
        Schema::create('berkas_arsip', function (Blueprint $table) {
            $table->id('nomor_berkas');
            $table->string('nama_berkas');
            $table->foreignId('klasifikasi_id')->constrained('kode_klasifikasi')->onDelete('restrict');
            $table->integer('retensi_aktif')->nullable();
            $table->integer('retensi_inaktif')->nullable();
            $table->string('penyusutan_akhir')->nullable();
            $table->string('lokasi_fisik')->nullable();
            $table->text('uraian')->nullable();
            $table->timestamps();
            
            $table->index('klasifikasi_id');
        });

        // 6. Arsip Unit
        Schema::create('arsip_unit', function (Blueprint $table) {
            $table->id('id_berkas');

            // Relasi
            $table->foreignId('kode_klasifikasi_id')->nullable()->constrained('kode_klasifikasi')->nullOnDelete(); 
            $table->foreignId('unit_pengolah_arsip_id')->nullable()->constrained('unit_pengolah')->nullOnDelete(); 
            $table->foreignId('berkas_arsip_id')->nullable()->constrained('berkas_arsip', 'nomor_berkas')->nullOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori')->nullOnDelete();
            $table->foreignId('sub_kategori_id')->nullable()->constrained('sub_kategori')->nullOnDelete();

            // Kolom untuk fitur verifikasi
            $table->string('publish_status')->default('draft');
            $table->foreignId('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('verifikasi_oleh')->nullable();
            $table->timestamp('verifikasi_tanggal')->nullable();

            // Kolom-kolom lainnya
            $table->integer('retensi_aktif')->nullable();
            $table->integer('retensi_inaktif')->nullable();
            $table->string('indeks')->nullable();
            $table->string('no_item_arsip')->nullable();
            $table->text('uraian_informasi')->nullable();
            $table->date('tanggal')->nullable();
            $table->integer('jumlah_nilai');
            $table->string('jumlah_satuan');
            $table->string('tingkat_perkembangan')->nullable();
            $table->string('skkaad')->nullable();
            $table->string('ruangan')->nullable();
            $table->string('no_filling')->nullable();
            $table->string('no_laci')->nullable();
            $table->string('no_folder')->nullable();
            $table->string('no_box')->nullable();
            $table->string('dokumen')->nullable();
            $table->text('keterangan')->nullable();
            $table->enum('status', ['pending', 'diterima', 'ditolak'])->default('pending');
            $table->text('verifikasi_keterangan')->nullable();

            $table->timestamps();

            // Index untuk performa
            $table->index(['kode_klasifikasi_id', 'status', 'publish_status']);
            $table->index('unit_pengolah_arsip_id');
            $table->index('berkas_arsip_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arsip_unit');
        Schema::dropIfExists('berkas_arsip');
        Schema::dropIfExists('sub_kategori');
        Schema::dropIfExists('kategori');
        Schema::dropIfExists('unit_pengolah');
        Schema::dropIfExists('kode_klasifikasi');
    }
};
