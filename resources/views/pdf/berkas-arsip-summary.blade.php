<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Daftar Berkas Arsip Aktif</title>
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
            padding: 5px 6px;
            vertical-align: middle;
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
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN DAFTAR BERKAS ARSIP AKTIF</h3>
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
                <th style="width: 4%;">NO</th>
                <th style="width: 12%;">KODE KLASIFIKASI / NOMOR BERKAS</th>
                <th style="width: 28%;">NAMA BERKAS</th>
                <th style="width: 10%;">TANGGAL BUAT BERKAS</th>
                <th style="width: 14%;">KURUN WAKTU</th>
                <th style="width: 7%;">JUMLAH ITEM</th>
                <th style="width: 7%;">RETENSI AKTIF</th>
                <th style="width: 7%;">RETENSI INAKTIF</th>
                <th style="width: 8%;">STATUS AKHIR</th>
            </tr>
        </thead>
        <tbody>
            @php $counter = 1; @endphp
            @foreach($berkasArsips as $berkas)
                @php
                    // Get min and max dates from arsip units
                    $dates = $berkas->arsipUnits->pluck('tanggal')->filter();
                    $minDate = $dates->min();
                    $maxDate = $dates->max();
                    $kurunWaktu = '-';
                    
                    if ($minDate && $maxDate) {
                        $minFormatted = \Carbon\Carbon::parse($minDate)->format('d M Y');
                        $maxFormatted = \Carbon\Carbon::parse($maxDate)->format('d M Y');
                        if ($minFormatted === $maxFormatted) {
                            $kurunWaktu = $minFormatted;
                        } else {
                            $kurunWaktu = $minFormatted . ' s/d ' . $maxFormatted;
                        }
                    } elseif ($minDate) {
                        $kurunWaktu = \Carbon\Carbon::parse($minDate)->format('d M Y');
                    }
                    
                    $kodeKlasifikasi = $berkas->kodeKlasifikasi ? $berkas->kodeKlasifikasi->kode_klasifikasi : '-';
                    $nomorBerkas = $berkas->nomor_berkas;
                    $kodeNomor = $kodeKlasifikasi . ' / ' . $nomorBerkas;
                    $tanggalBuat = $berkas->created_at ? \Carbon\Carbon::parse($berkas->created_at)->format('d-m-Y') : '-';
                    
                    // Status akhir based on penyusutan_akhir
                    $statusAkhir = $berkas->penyusutan_akhir ?: '-';
                @endphp
                <tr>
                    <td class="text-center">{{ $counter++ }}</td>
                    <td>{{ $kodeNomor }}</td>
                    <td>{{ $berkas->nama_berkas }}</td>
                    <td class="text-center">{{ $tanggalBuat }}</td>
                    <td class="text-center">{{ $kurunWaktu }}</td>
                    <td class="text-center">{{ $berkas->arsipUnits->count() }}</td>
                    <td class="text-center">{{ $berkas->retensi_aktif ?: '-' }}</td>
                    <td class="text-center">{{ $berkas->retensi_inaktif ?: '-' }}</td>
                    <td class="text-center">{{ $statusAkhir }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
