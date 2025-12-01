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
        $conn = Schema::getConnection();
        $dbName = $conn->getDatabaseName();
        
        // Check and drop existing foreign key constraint if it exists
        $foreignKeys = $conn->select(
            "SELECT CONSTRAINT_NAME 
             FROM information_schema.KEY_COLUMN_USAGE 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'berkas_arsip' 
             AND COLUMN_NAME = 'klasifikasi_id' 
             AND REFERENCED_TABLE_NAME IS NOT NULL",
            [$dbName]
        );
        
        if (!empty($foreignKeys)) {
            $constraintName = $foreignKeys[0]->CONSTRAINT_NAME;
            $conn->statement("ALTER TABLE berkas_arsip DROP FOREIGN KEY {$constraintName}");
        }
        
        // Check and drop existing index if it exists
        $indexes = $conn->select(
            "SELECT INDEX_NAME 
             FROM information_schema.STATISTICS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'berkas_arsip' 
             AND COLUMN_NAME = 'klasifikasi_id' 
             AND INDEX_NAME != 'PRIMARY'",
            [$dbName]
        );
        
        if (!empty($indexes)) {
            $indexName = $indexes[0]->INDEX_NAME;
            $conn->statement("ALTER TABLE berkas_arsip DROP INDEX {$indexName}");
        }
        
        // Change column type from string to unsignedBigInteger
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->unsignedBigInteger('klasifikasi_id')->change();
        });
        
        // Recreate foreign key and index
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->foreign('klasifikasi_id')
                  ->references('id')
                  ->on('kode_klasifikasi')
                  ->onDelete('restrict');
            
            $table->index('klasifikasi_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berkas_arsip', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['klasifikasi_id']);
            
            // Drop the index
            $table->dropIndex(['klasifikasi_id']);
        });
        
        // Change column type back to string
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->string('klasifikasi_id')->change();
        });
        
        // Restore the old foreign key constraint
        Schema::table('berkas_arsip', function (Blueprint $table) {
            $table->foreign('klasifikasi_id')
                  ->references('kode_klasifikasi')
                  ->on('kode_klasifikasi')
                  ->onDelete('restrict');
            
            $table->index('klasifikasi_id');
        });
    }
};
