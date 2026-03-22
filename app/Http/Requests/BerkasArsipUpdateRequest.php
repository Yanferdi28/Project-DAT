<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
