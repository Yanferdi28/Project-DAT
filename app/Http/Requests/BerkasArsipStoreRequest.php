<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BerkasArsipStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->role !== 'operator';
    }

    public function rules(): array
    {
        return [
            'nama_berkas' => 'required|string|max:255',
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
            'klasifikasi_id.required' => 'Kode klasifikasi harus dipilih.',
        ];
    }
}
