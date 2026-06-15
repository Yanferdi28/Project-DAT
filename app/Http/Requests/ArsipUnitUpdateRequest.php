<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArsipUnitUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth()->user();

        if ($user->role === 'operator') {
            return false;
        }

        // Non-admin users can only update their own unit's arsip
        if ($user->role !== 'admin' && $user->unit_pengolah_id) {
            return $this->route('arsip_unit')->unit_pengolah_arsip_id === $user->unit_pengolah_id;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'kode_klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_arsip_id' => 'required|exists:unit_pengolah,id',
            'kategori_id' => 'required|exists:kategori,id',
            'sub_kategori_id' => 'required|exists:sub_kategori,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'indeks' => 'nullable|string|max:255',
            'uraian_informasi' => 'required|string',
            'tanggal' => 'required|date',
            'jumlah_nilai' => 'required|integer|min:1',
            'jumlah_satuan' => 'required|in:lembar,jilid,bundle',
            'tingkat_perkembangan' => 'required|in:asli,salinan,tembusan,pertinggal',
            'klasifikasi_keamanan' => 'nullable|string|max:255',
            'ruangan' => 'nullable|string|max:255',
            'no_filling' => 'nullable|string|max:255',
            'no_laci' => 'nullable|string|max:255',
            'no_folder' => 'nullable|string|max:255',
            'no_box' => 'nullable|string|max:255',
            'dokumen' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'keterangan' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'kode_klasifikasi_id.required' => 'Kode klasifikasi harus dipilih.',
            'unit_pengolah_arsip_id.required' => 'Unit pengolah harus dipilih.',
            'kategori_id.required' => 'Kategori harus dipilih.',
            'sub_kategori_id.required' => 'Sub kategori harus dipilih.',
            'uraian_informasi.required' => 'Uraian informasi harus diisi.',
            'tanggal.required' => 'Tanggal harus diisi.',
            'jumlah_nilai.required' => 'Jumlah harus diisi.',
            'jumlah_nilai.min' => 'Jumlah minimal 1.',
            'jumlah_satuan.required' => 'Satuan harus dipilih.',
            'tingkat_perkembangan.required' => 'Tingkat perkembangan harus dipilih.',
            'dokumen.max' => 'Ukuran dokumen maksimal 10 MB.',
            'dokumen.mimes' => 'Format dokumen harus PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, atau PNG.',
        ];
    }
}
