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
            margin: 8mm 6mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 7pt;
            line-height: 1.2;
            color: #000000;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 12pt;
            font-weight: bold;
            color: #000000;
        }
        .header p {
            margin: 2px 0;
            font-size: 9pt;
            color: #000000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #000000;
            padding: 3px 4px;
            vertical-align: middle;
        }
        th {
            background-color: #f7fafc;
            color: #000000;
            font-weight: bold;
            text-align: center;
            font-size: 6pt;
        }
        td {
            font-size: 6pt;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .berkas-row td {
            background-color: #ffffff;
            font-weight: bold;
        }
        .item-row td {
            background-color: #ffffff;
            font-weight: normal;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN DAFTAR ISI BERKAS ARSIP AKTIF</h3>
        @if($unitPengolah)
            <p>UNIT PENGOLAH: {{ strtoupper($unitPengolah->nama_unit) }}</p>
        @endif
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ strtoupper(\Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y')) }} - {{ strtoupper(\Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y')) }}</p>
        @else
            <p>Tanggal: {{ strtoupper(now()->translatedFormat('d F Y')) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 2%;">NO</th>
                <th rowspan="2" style="width: 4%;">KODE KLSF</th>
                <th rowspan="2" style="width: 5%;">INDEKS</th>
                <th rowspan="2" style="width: 8%;">NAMA BERKAS</th>
                <th rowspan="2" style="width: 5%;">TGL BUAT BERKAS</th>
                <th rowspan="2" style="width: 3%;">NO ITEM</th>
                <th rowspan="2" style="width: 12%;">URAIAN INFORMASI</th>
                <th rowspan="2" style="width: 5%;">TANGGAL</th>
                <th rowspan="2" style="width: 5%;">TINGKAT PERKMB</th>
                <th rowspan="2" style="width: 3%;">JML ITEM</th>
                <th rowspan="2" style="width: 3%;">RET AKTIF</th>
                <th rowspan="2" style="width: 3%;">RET INAKTIF</th>
                <th rowspan="2" style="width: 5%;">SKKAAD</th>
                <th rowspan="2" style="width: 5%;">STATUS AKHIR</th>
                <th rowspan="2" style="width: 5%;">LOKASI BERKAS</th>
                <th colspan="5" style="width: 15%;">LOKASI ARSIP</th>
                <th rowspan="2" style="width: 4%;">KET</th>
            </tr>
            <tr>
                <th>RUANG</th>
                <th>RAK</th>
                <th>LACI</th>
                <th>BOX</th>
                <th>FOLDER</th>
            </tr>
        </thead>
        <tbody>
            @php $counter = 1; @endphp
            @foreach($berkasArsips as $berkas)
                @php
                    $arsipUnits = $berkas->arsipUnits;
                    $totalItems = $arsipUnits->count();
                    $kodeKlasifikasi = $berkas->kodeKlasifikasi ? $berkas->kodeKlasifikasi->kode_klasifikasi : '-';
                    $tanggalBuat = $berkas->created_at ? \Carbon\Carbon::parse($berkas->created_at)->format('d/m/Y') : '-';
                    $skkaad = $berkas->kodeKlasifikasi->status_akhir ?? '-';
                    $statusAkhir = $berkas->penyusutan_akhir ?: '-';
                @endphp
                
                {{-- Baris Berkas Arsip --}}
                <tr class="berkas-row">
                    <td class="text-center" rowspan="{{ max($totalItems + 1, 1) }}">{{ $counter++ }}</td>
                    <td>{{ $kodeKlasifikasi }}</td>
                    <td></td>
                    <td>{{ $berkas->nama_berkas }}</td>
                    <td class="text-center">{{ $tanggalBuat }}</td>
                    <td class="text-center">-</td>
                    <td>-</td>
                    <td class="text-center"></td>
                    <td class="text-center"></td>
                    <td class="text-center">{{ $totalItems }}</td>
                    <td class="text-center">{{ $berkas->retensi_aktif ?? '-' }}</td>
                    <td class="text-center">{{ $berkas->retensi_inaktif ?? '-' }}</td>
                    <td class="text-center">{{ $skkaad }}</td>
                    <td class="text-center">{{ $statusAkhir }}</td>
                    <td>{{ $berkas->lokasi_fisik ?: '-' }}</td>
                    <td class="text-center"></td>
                    <td class="text-center"></td>
                    <td class="text-center"></td>
                    <td class="text-center"></td>
                    <td class="text-center"></td>
                    <td></td>
                </tr>
                
                {{-- Baris Arsip Unit --}}
                @foreach($arsipUnits as $index => $arsip)
                    <tr class="item-row">
                        <td></td>
                        <td>{{ $arsip->indeks ?? '-' }}</td>
                        <td></td>
                        <td></td>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $arsip->uraian_informasi ?? '-' }}</td>
                        <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d-m-Y') : '-' }}</td>
                        <td class="text-center">{{ ucfirst($arsip->tingkat_perkembangan ?? '-') }}</td>
                        <td class="text-center"></td>
                        <td class="text-center"></td>
                        <td class="text-center"></td>
                        <td class="text-center"></td>
                        <td class="text-center"></td>
                        <td></td>
                        <td class="text-center">{{ $arsip->ruangan ?? '-' }}</td>
                        <td class="text-center">{{ $arsip->no_filling ?? '-' }}</td>
                        <td class="text-center">{{ $arsip->no_laci ?? '-' }}</td>
                        <td class="text-center">{{ $arsip->no_box ?? '-' }}</td>
                        <td class="text-center">{{ $arsip->no_folder ?? '-' }}</td>
                        <td>{{ $arsip->keterangan ?? '-' }}</td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>
</body>
</html>
