<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Daftar Isi Berkas Arsip Aktif</title>
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <style>
        @page {
            margin: 10mm 8mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.2;
            color: #1a365d;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 12pt;
            font-weight: bold;
            color: #1a365d;
        }
        .header p {
            margin: 2px 0;
            font-size: 9pt;
            color: #1a365d;
        }
        table {
            width: 100%;
            border-collapse: collapse;
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
        .berkas-row td {
            background-color: #ffffff;
        }
        .item-row td {
            background-color: #f8f9fa;
            padding-left: 10px;
        }
        .no-border-top {
            border-top: none !important;
        }
        .no-border-bottom {
            border-bottom: none !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN DAFTAR ISI BERKAS ARSIP AKTIF</h3>
        @if($unitPengolah)
            <p><strong>UNIT PENGOLAH: {{ strtoupper($unitPengolah->nama_unit) }}</strong></p>
        @endif
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>PERIODE: {{ date('d F Y') }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 10%;">KODE KLASIFIKASI / NOMOR BERKAS</th>
                <th style="width: 18%;">NAMA BERKAS</th>
                <th style="width: 8%;">TANGGAL BUAT BERKAS</th>
                <th style="width: 5%;">NO ITEM ARSIP</th>
                <th style="width: 36%;">URAIAN INFORMASI ARSIP</th>
                <th style="width: 8%;">TANGGAL ITEM</th>
                <th style="width: 6%;">JUMLAH ITEM</th>
            </tr>
        </thead>
        <tbody>
            @php $counter = 1; @endphp
            @foreach($berkasArsips as $berkas)
                @php
                    $arsipUnits = $berkas->arsipUnits;
                    $totalItems = $arsipUnits->count();
                    $kodeKlasifikasi = $berkas->kodeKlasifikasi ? $berkas->kodeKlasifikasi->kode_klasifikasi : '-';
                    $nomorBerkas = $berkas->nomor_berkas;
                    $kodeNomor = $kodeKlasifikasi . ' / ' . $nomorBerkas;
                    $tanggalBuat = $berkas->created_at ? \Carbon\Carbon::parse($berkas->created_at)->format('d/m/Y') : '-';
                @endphp
                
                @if($totalItems == 0)
                    {{-- Berkas tanpa arsip unit --}}
                    <tr class="berkas-row">
                        <td class="text-center">{{ $counter++ }}</td>
                        <td>{{ $kodeNomor }}</td>
                        <td>{{ $berkas->nama_berkas }}</td>
                        <td class="text-center">{{ $tanggalBuat }}</td>
                        <td class="text-center">-</td>
                        <td>-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">0</td>
                    </tr>
                @else
                    {{-- Berkas dengan arsip unit --}}
                    @foreach($arsipUnits as $index => $arsip)
                        <tr class="{{ $index > 0 ? 'item-row' : 'berkas-row' }}">
                            @if($index == 0)
                                <td class="text-center" rowspan="{{ $totalItems }}">{{ $counter++ }}</td>
                                <td rowspan="{{ $totalItems }}">{{ $kodeNomor }}</td>
                                <td rowspan="{{ $totalItems }}">{{ $berkas->nama_berkas }}</td>
                                <td class="text-center" rowspan="{{ $totalItems }}">{{ $tanggalBuat }}</td>
                            @endif
                            <td class="text-center">{{ $arsip->no_item_arsip ?: ($index + 1) }}</td>
                            <td>{{ $arsip->uraian_informasi ?: '-' }}</td>
                            <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d-m-Y') : '-' }}</td>
                            @if($index == 0)
                                <td class="text-center" rowspan="{{ $totalItems }}">{{ $totalItems }}</td>
                            @endif
                        </tr>
                    @endforeach
                @endif
            @endforeach
        </tbody>
    </table>
</body>
</html>
