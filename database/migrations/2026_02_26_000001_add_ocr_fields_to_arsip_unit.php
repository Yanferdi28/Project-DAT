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
            // OCR extracted text
            $table->longText('extracted_text')->nullable()->after('dokumen');

            // OCR processing status: pending, processing, completed, failed, skipped
            $table->string('ocr_status')->nullable()->after('extracted_text');

            // OCR confidence score (0-100)
            $table->decimal('ocr_confidence', 5, 2)->nullable()->after('ocr_status');

            // OCR error message when failed
            $table->text('ocr_error')->nullable()->after('ocr_confidence');

            // OCR processed timestamp
            $table->timestamp('ocr_processed_at')->nullable()->after('ocr_error');

            // AI Classification - suggested kategori
            $table->foreignId('suggested_kategori_id')->nullable()->after('ocr_processed_at')
                ->constrained('kategori')->nullOnDelete();

            // AI Classification - suggested sub kategori
            $table->foreignId('suggested_sub_kategori_id')->nullable()->after('suggested_kategori_id')
                ->constrained('sub_kategori')->nullOnDelete();

            // AI classification confidence score (0-100)
            $table->decimal('ai_confidence_score', 5, 2)->nullable()->after('suggested_sub_kategori_id');

            // Whether user accepted/rejected AI suggestion: null (pending), accepted, rejected
            $table->string('ai_suggestion_status')->nullable()->after('ai_confidence_score');

            // Indexes for search and filtering
            $table->index('ocr_status');
        });

        // Add fulltext index for content search
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->fullText('extracted_text', 'arsip_unit_fulltext_search');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arsip_unit', function (Blueprint $table) {
            $table->dropFullText('arsip_unit_fulltext_search');
            $table->dropIndex(['ocr_status']);

            $table->dropForeign(['suggested_kategori_id']);
            $table->dropForeign(['suggested_sub_kategori_id']);

            $table->dropColumn([
                'extracted_text',
                'ocr_status',
                'ocr_confidence',
                'ocr_error',
                'ocr_processed_at',
                'suggested_kategori_id',
                'suggested_sub_kategori_id',
                'ai_confidence_score',
                'ai_suggestion_status',
            ]);
        });
    }
};
