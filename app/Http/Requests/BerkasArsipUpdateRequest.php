<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BerkasArsipUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth()->user();

        if ($user->role === 'operator') {
            return false;
        }

        // Non-admin users can only update their own unit's berkas
        if ($user->role !== 'admin' && $user->unit_pengolah_id) {
            return $this->route('berkas_arsip')->unit_pengolah_id === $user->unit_pengolah_id;
        }

        return true;
    }

    public function rules(): array
    {
        $berkas = $this->route('berkas_arsip');
        $nomorBerkas = is_object($berkas) ? $berkas->nomor_berkas : $berkas;

        return [
            'nama_berkas' => [
                'required',
                'string',
                'max:255',
                Rule::unique('berkas_arsip', 'nama_berkas')
                    ->where(function ($query) {
                        return $query->where('klasifikasi_id', $this->klasifikasi_id)
                            ->where('unit_pengolah_id', $this->unit_pengolah_id)
                            ->whereNull('deleted_at');
                    })
                    ->ignore($nomorBerkas, 'nomor_berkas'),
            ],
            'klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_id' => 'nullable|exists:unit_pengolah,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'penyusutan_akhir' => 'nullable|string|max:255',
            'lokasi_fisik' => 'nullable|string|max:255',
            'uraian' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'nama_berkas.required' => 'Nama berkas harus diisi.',
            'nama_berkas.unique' => 'Nama berkas dengan kode klasifikasi dan unit pengolah ini sudah terdaftar.',
            'klasifikasi_id.required' => 'Kode klasifikasi harus dipilih.',
        ];
    }
}
