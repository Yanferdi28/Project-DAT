<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BerkasArsipStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->role !== 'operator';
    }

    public function rules(): array
    {
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
                    }),
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
