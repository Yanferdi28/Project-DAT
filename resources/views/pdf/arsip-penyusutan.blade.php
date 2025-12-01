<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Arsip Mendekati Penyusutan</title>
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 8mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.3;
            color: #1a365d;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 10px;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 14pt;
            font-weight: bold;
            color: #1a365d;
        }
        .header p {
            margin: 2px 0;
            font-size: 9pt;
            color: #1a365d;
        }
        .info-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 15px;
            font-size: 9pt;
        }
        .info-box .label {
            font-weight: bold;
            color: #856404;
        }
        .summary-box {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .summary-item {
            display: table-cell;
            width: 25%;
            padding: 8px;
            text-align: center;
            border: 1px solid #1a365d;
        }
        .summary-item .number {
            font-size: 16pt;
            font-weight: bold;
            color: #1a365d;
        }
        .summary-item .text {
            font-size: 8pt;
            color: #666;
        }
        .summary-item.warning {
            background-color: #fff3cd;
        }
        .summary-item.danger {
            background-color: #f8d7da;
        }
        .summary-item.success {
            background-color: #d4edda;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #1a365d;
            padding: 4px 5px;
            vertical-align: top;
        }
        th {
            background-color: #1a365d;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 7pt;
        }
        td {
            font-size: 7pt;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .status-segera {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: bold;
        }
        .status-mendekat {
            background-color: #fff3cd;
            color: #856404;
            font-weight: bold;
        }
        .status-normal {
            background-color: #d4edda;
            color: #155724;
        }
        .badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 6pt;
            font-weight: bold;
        }
        .badge-musnah {
            background-color: #dc3545;
            color: white;
        }
        .badge-permanen {
            background-color: #28a745;
            color: white;
        }
        .badge-nilai-guna {
            background-color: #17a2b8;
            color: white;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .page-break {
            page-break-after: always;
        }
        .section-title {
            background-color: #e9ecef;
            padding: 5px 10px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-left: 4px solid #1a365d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN ARSIP MENDEKATI MASA PENYUSUTAN</h3>
        @if($unitPengolah)
            <p><strong>UNIT PENGOLAH: {{ strtoupper($unitPengolah->nama_unit) }}</strong></p>
        @endif
        <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @if($tahunAcuan)
            <p>Tahun Acuan Perhitungan: {{ $tahunAcuan }}</p>
        @endif
    </div>

    <div class="info-box">
        <span class="label">Keterangan:</span> Laporan ini menampilkan arsip yang mendekati atau telah melewati masa retensi. 
        Arsip dengan status <strong>"Segera"</strong> adalah arsip yang sudah melewati masa retensi dan perlu segera ditindaklanjuti.
        Arsip dengan status <strong>"Mendekat"</strong> adalah arsip yang akan memasuki masa penyusutan dalam {{ $batasWarning ?? 1 }} tahun.
    </div>

    {{-- Summary Statistics --}}
    <table style="margin-bottom: 15px;">
        <tr>
            <td class="summary-item danger" style="width: 25%;">
                <div class="number">{{ $totalSegera ?? 0 }}</div>
                <div class="text">Segera Disusutkan</div>
            </td>
            <td class="summary-item warning" style="width: 25%;">
                <div class="number">{{ $totalMendekat ?? 0 }}</div>
                <div class="text">Mendekati Penyusutan</div>
            </td>
            <td class="summary-item success" style="width: 25%;">
                <div class="number">{{ $totalMusnah ?? 0 }}</div>
                <div class="text">Akan Dimusnahkan</div>
            </td>
            <td class="summary-item" style="width: 25%;">
                <div class="number">{{ $totalPermanen ?? 0 }}</div>
                <div class="text">Disimpan Permanen</div>
            </td>
        </tr>
    </table>

    @if(count($arsipSegera) > 0)
    <div class="section-title" style="background-color: #f8d7da; border-left-color: #dc3545;">
        ARSIP SEGERA DISUSUTKAN (Sudah Melewati Masa Retensi)
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 8%;">KODE KLASIFIKASI</th>
                <th style="width: 15%;">NAMA BERKAS / URAIAN</th>
                <th style="width: 8%;">UNIT PENGOLAH</th>
                <th style="width: 7%;">TGL ARSIP</th>
                <th style="width: 5%;">RET. AKTIF</th>
                <th style="width: 5%;">RET. INAKTIF</th>
                <th style="width: 7%;">TOTAL RETENSI</th>
                <th style="width: 8%;">TGL PENYUSUTAN</th>
                <th style="width: 7%;">TERLAMBAT</th>
                <th style="width: 8%;">STATUS AKHIR</th>
                <th style="width: 10%;">LOKASI</th>
            </tr>
        </thead>
        <tbody>
            @foreach($arsipSegera as $index => $arsip)
            <tr class="status-segera">
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $arsip['kode_klasifikasi'] ?? '-' }}</td>
                <td>{{ $arsip['nama_berkas'] ?? $arsip['uraian_informasi'] ?? '-' }}</td>
                <td>{{ $arsip['unit_pengolah'] ?? '-' }}</td>
                <td class="text-center">{{ $arsip['tanggal_arsip'] ?? '-' }}</td>
                <td class="text-center">{{ $arsip['retensi_aktif'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['retensi_inaktif'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['total_retensi'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['tanggal_penyusutan'] ?? '-' }}</td>
                <td class="text-center" style="color: #dc3545; font-weight: bold;">{{ $arsip['sisa_waktu'] ?? '-' }}</td>
                <td class="text-center">
                    @php
                        $statusAkhir = $arsip['status_akhir'] ?? 'musnah';
                    @endphp
                    <span class="badge badge-{{ $statusAkhir == 'permanen' ? 'permanen' : ($statusAkhir == 'nilai guna' ? 'nilai-guna' : 'musnah') }}">
                        {{ strtoupper($statusAkhir) }}
                    </span>
                </td>
                <td>{{ $arsip['lokasi'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($arsipMendekat) > 0)
    <div class="section-title" style="background-color: #fff3cd; border-left-color: #ffc107;">
        ARSIP MENDEKATI MASA PENYUSUTAN (Kurang dari {{ $batasWarning ?? 1 }} Tahun)
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 8%;">KODE KLASIFIKASI</th>
                <th style="width: 15%;">NAMA BERKAS / URAIAN</th>
                <th style="width: 8%;">UNIT PENGOLAH</th>
                <th style="width: 7%;">TGL ARSIP</th>
                <th style="width: 5%;">RET. AKTIF</th>
                <th style="width: 5%;">RET. INAKTIF</th>
                <th style="width: 7%;">TOTAL RETENSI</th>
                <th style="width: 8%;">TGL PENYUSUTAN</th>
                <th style="width: 7%;">SISA WAKTU</th>
                <th style="width: 8%;">STATUS AKHIR</th>
                <th style="width: 10%;">LOKASI</th>
            </tr>
        </thead>
        <tbody>
            @foreach($arsipMendekat as $index => $arsip)
            <tr class="status-mendekat">
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $arsip['kode_klasifikasi'] ?? '-' }}</td>
                <td>{{ $arsip['nama_berkas'] ?? $arsip['uraian_informasi'] ?? '-' }}</td>
                <td>{{ $arsip['unit_pengolah'] ?? '-' }}</td>
                <td class="text-center">{{ $arsip['tanggal_arsip'] ?? '-' }}</td>
                <td class="text-center">{{ $arsip['retensi_aktif'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['retensi_inaktif'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['total_retensi'] ?? '-' }} thn</td>
                <td class="text-center">{{ $arsip['tanggal_penyusutan'] ?? '-' }}</td>
                <td class="text-center" style="color: #856404; font-weight: bold;">{{ $arsip['sisa_waktu'] ?? '-' }}</td>
                <td class="text-center">
                    @php
                        $statusAkhir = $arsip['status_akhir'] ?? 'musnah';
                    @endphp
                    <span class="badge badge-{{ $statusAkhir == 'permanen' ? 'permanen' : ($statusAkhir == 'nilai guna' ? 'nilai-guna' : 'musnah') }}">
                        {{ strtoupper($statusAkhir) }}
                    </span>
                </td>
                <td>{{ $arsip['lokasi'] ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($arsipSegera) == 0 && count($arsipMendekat) == 0)
    <div style="text-align: center; padding: 50px; color: #666;">
        <p style="font-size: 12pt;">Tidak ada arsip yang mendekati masa penyusutan.</p>
        <p style="font-size: 9pt;">Semua arsip masih dalam masa retensi yang aman.</p>
    </div>
    @endif

    <div class="footer">
        <table style="border: none; width: 100%;">
            <tr>
                <td style="border: none; text-align: left; width: 50%;">
                    Total Arsip dalam Laporan: <strong>{{ count($arsipSegera) + count($arsipMendekat) }}</strong>
                </td>
                <td style="border: none; text-align: right; width: 50%;">
                    Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i:s') }}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
