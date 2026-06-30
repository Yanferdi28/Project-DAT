<?php

namespace App\Services;

use App\Models\ArsipUnit;
use App\Models\KodeKlasifikasi;

class AiClassificationSuggestionService
{
    public function acceptPendingSuggestion(ArsipUnit $arsipUnit): bool
    {
        if (
            !$arsipUnit->suggested_kode_klasifikasi_id
            || $arsipUnit->ai_suggestion_status !== null
        ) {
            return false;
        }

        return $this->acceptSuggestion($arsipUnit);
    }

    public function acceptSuggestion(ArsipUnit $arsipUnit): bool
    {
        if (!$arsipUnit->suggested_kode_klasifikasi_id) {
            return false;
        }

        $klasifikasiKeamanan = KodeKlasifikasi::whereKey($arsipUnit->suggested_kode_klasifikasi_id)
            ->value('klasifikasi_keamanan');

        $arsipUnit->update([
            'kode_klasifikasi_id' => $arsipUnit->suggested_kode_klasifikasi_id,
            'klasifikasi_keamanan' => $klasifikasiKeamanan,
            'ai_suggestion_status' => 'accepted',
        ]);

        return true;
    }
}
