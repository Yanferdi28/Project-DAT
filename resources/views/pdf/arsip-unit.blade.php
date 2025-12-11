<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Arsip Unit Export</title>
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <style>
        @page {
            size: A4 landscape;
            margin: 8mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 16px;
            margin: 0 0 5px 0;
            color: #1a365d;
        }
        .header p {
            margin: 2px 0;
            font-size: 12px;
            color: #2c5282;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #333;
            padding: 4px 5px;
            text-align: left;
        }
        th {
            background-color: #edf2f7;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            font-size: 9px;
        }
        td {
            vertical-align: top;
            font-size: 9px;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 10px;
        }
        .lokasi-header {
            text-align: center;
            background-color: #edf2f7;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN DAFTAR ARSIP UNIT</h1>
        @if(isset($unitPengolah))
            <p>UNIT PENGOLAH: {{ $unitPengolah }}</p>
        @endif
        @if(isset($periode))
            <p>PERIODE: {{ $periode }}</p>
        @endif
    </div>
    
    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 2%;">NO</th>
                <th rowspan="2" style="width: 5%;">KODE KLASIFIKASI</th>
                <th rowspan="2" style="width: 6%;">INDEKS</th>
                <th rowspan="2" style="width: 12%;">URAIAN INFORMASI</th>
                <th rowspan="2" style="width: 5%;">TANGGAL</th>
                <th rowspan="2" style="width: 5%;">JUMLAH</th>
                <th rowspan="2" style="width: 7%;">TINGKAT PERKEMBANGAN</th>
                <th rowspan="2" style="width: 8%;">UNIT PENGOLAH</th>
                <th rowspan="2" style="width: 4%;">RETENSI AKTIF</th>
                <th rowspan="2" style="width: 4%;">RETENSI INAKTIF</th>
                <th rowspan="2" style="width: 5%;">SKKAAD</th>
                <th colspan="5" class="lokasi-header">LOKASI FISIK</th>
                <th rowspan="2" style="width: 7%;">KETERANGAN</th>
            </tr>
            <tr>
                <th style="width: 4%;">RUANG</th>
                <th style="width: 4%;">NO RAK</th>
                <th style="width: 4%;">NO LACI</th>
                <th style="width: 4%;">NO BOX</th>
                <th style="width: 4%;">NO FOLDER</th>
            </tr>
        </thead>
        <tbody>
            @foreach($arsipUnits as $index => $arsip)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                <td>{{ $arsip->indeks ?? '-' }}</td>
                <td>{{ $arsip->uraian_informasi ?? '-' }}</td>
                <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d-m-Y') : '-' }}</td>
                <td class="text-center">{{ $arsip->jumlah_nilai }} {{ $arsip->jumlah_satuan }}</td>
                <td class="text-center">{{ ucfirst($arsip->tingkat_perkembangan ?? '-') }}</td>
                <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                <td class="text-center">{{ $arsip->retensi_aktif ?? '-' }}</td>
                <td class="text-center">{{ $arsip->retensi_inaktif ?? '-' }}</td>
                <td>{{ $arsip->skkaad ?? '-' }}</td>
                <td class="text-center">{{ $arsip->ruangan ?? '-' }}</td>
                <td class="text-center">{{ $arsip->no_filling ?? '-' }}</td>
                <td class="text-center">{{ $arsip->no_laci ?? '-' }}</td>
                <td class="text-center">{{ $arsip->no_box ?? '-' }}</td>
                <td class="text-center">{{ $arsip->no_folder ?? '-' }}</td>
                <td>{{ $arsip->keterangan ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        Dicetak pada: {{ now()->format('d-m-Y H:i:s') }}
    </div>
</body>
</html>
