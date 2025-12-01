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
            margin: 15mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            margin: 0;
            padding: 0;
        }
        h1 {
            text-align: center;
            font-size: 14px;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }
        td {
            vertical-align: top;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <h1>DAFTAR ARSIP UNIT</h1>
    
    <table>
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 8%;">KODE KLASIFIKASI</th>
                <th style="width: 7%;">INDEKS</th>
                <th style="width: 20%;">URAIAN INFORMASI</th>
                <th style="width: 8%;">TANGGAL</th>
                <th style="width: 7%;">JUMLAH</th>
                <th style="width: 10%;">TINGKAT PERKEMBANGAN</th>
                <th style="width: 10%;">UNIT PENGOLAH</th>
                <th style="width: 6%;">RETENSI AKTIF</th>
                <th style="width: 6%;">RETENSI INAKTIF</th>
                <th style="width: 8%;">STATUS</th>
                <th style="width: 7%;">KETERANGAN</th>
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
                <td>{{ ucfirst($arsip->tingkat_perkembangan) }}</td>
                <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                <td class="text-center">{{ $arsip->retensi_aktif ?? '-' }}</td>
                <td class="text-center">{{ $arsip->retensi_inaktif ?? '-' }}</td>
                <td class="text-center">{{ $arsip->status }}</td>
                <td>{{ $arsip->skkaad ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        Dicetak pada: {{ now()->format('d-m-Y H:i:s') }}
    </div>
</body>
</html>
