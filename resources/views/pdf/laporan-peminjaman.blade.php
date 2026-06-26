<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Peminjaman dan Pengembalian Arsip</title>
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <style>
        @page {
            margin: 15mm 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #1a365d;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 15px;
        }
        .header h2 {
            margin: 5px 0;
            font-size: 14pt;
            font-weight: bold;
            color: #1a365d;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 12pt;
            font-weight: bold;
            color: #1a365d;
        }
        .header p {
            margin: 3px 0;
            font-size: 9pt;
            color: #333;
        }
        
        /* Summary Stats */
        .summary-section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f0f4f8;
            border-radius: 5px;
        }
        .summary-title {
            font-size: 11pt;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 10px;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 25%;
            text-align: center;
            padding: 10px;
        }
        .summary-value {
            font-size: 18pt;
            font-weight: bold;
            color: #1a365d;
        }
        .summary-label {
            font-size: 8pt;
            color: #666;
            margin-top: 3px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #1a365d;
            padding: 8px 6px;
            vertical-align: middle;
        }
        th {
            background-color: #1a365d;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 8pt;
        }
        td {
            font-size: 8pt;
        }
        .text-center {
            text-align: center;
        }
        
        /* Status colors */
        .status-dipinjam {
            color: #d69e2e;
            font-weight: bold;
        }
        .status-dikembalikan {
            color: #38a169;
            font-weight: bold;
        }
        .status-terlambat {
            color: #e53e3e;
            font-weight: bold;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
        }

    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN PEMINJAMAN & PENGEMBALIAN ARSIP</h2>
        @if($unitPengolah)
            <h3>{{ strtoupper($unitPengolah->nama_unit) }}</h3>
        @endif
        @if($dariTanggal && $sampaiTanggal)
            <p>Periode: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y, H:i') }} WIB</p>
        @endif
        @if($filterStatus)
            <p>Filter Status: {{ ucfirst($filterStatus) }}</p>
        @endif
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
        <div class="summary-title">RINGKASAN PEMINJAMAN</div>
        <table style="border: none; margin-bottom: 0;">
            <tr style="border: none;">
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value">{{ $stats['total'] }}</div>
                    <div class="summary-label">Total Transaksi</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value" style="color: #d69e2e;">{{ $stats['dipinjam'] }}</div>
                    <div class="summary-label">Sedang Dipinjam</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value" style="color: #38a169;">{{ $stats['dikembalikan'] }}</div>
                    <div class="summary-label">Telah Dikembalikan</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value" style="color: #e53e3e;">{{ $stats['terlambat'] }}</div>
                    <div class="summary-label">Terlambat</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Main Table -->
    <table>
        <thead>
            <tr>
                <th style="width: 3%;">NO</th>
                <th style="width: 10%;">INDEKS ARSIP</th>
                <th style="width: 17%;">URAIAN</th>
                <th style="width: 8%;">KODE KLASIFIKASI</th>
                <th style="width: 15%;">PEMINJAM</th>
                <th style="width: 12%;">UNIT / INSTANSI</th>
                <th style="width: 8%;">TGL PINJAM</th>
                <th style="width: 8%;">DEADLINE</th>
                <th style="width: 8%;">TGL KEMBALI</th>
                <th style="width: 6%;">STATUS</th>
                <th style="width: 5%;">KONDISI</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @forelse($peminjaman as $item)
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td>{{ $item->arsipUnit->indeks ?? ('#' . $item->arsipUnit->id_berkas) }}</td>
                    <td>{{ $item->arsipUnit->uraian_informasi }}</td>
                    <td class="text-center">{{ $item->arsipUnit->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                    <td>
                        {{ $item->nama_peminjam }}
                        @if($item->jabatan_peminjam)<br><small>({{ $item->jabatan_peminjam }})</small>@endif
                    </td>
                    <td>{{ $item->unitPengolah->nama_unit ?? '-' }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tanggal_pinjam)->format('d/m/Y') }}</td>
                    <td class="text-center {{ $item->status == 'terlambat' ? 'status-terlambat' : '' }}">{{ \Carbon\Carbon::parse($item->tanggal_harus_kembali)->format('d/m/Y') }}</td>
                    <td class="text-center">{{ $item->tanggal_kembali ? \Carbon\Carbon::parse($item->tanggal_kembali)->format('d/m/Y') : '-' }}</td>
                    <td class="text-center">
                        @if($item->status == 'dipinjam')
                            <span class="status-dipinjam">Dipinjam</span>
                        @elseif($item->status == 'dikembalikan')
                            <span class="status-dikembalikan">Kembali</span>
                        @elseif($item->status == 'terlambat')
                            <span class="status-terlambat">Terlambat</span>
                        @endif
                    </td>
                    <td class="text-center">{{ ucfirst($item->kondisi_pengembalian) ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="text-center">Tidak ada data peminjaman arsip pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p style="font-size: 8pt; color: #666;">
            Laporan ini digenerate oleh sistem pada {{ \Carbon\Carbon::now()->translatedFormat('d F Y, H:i') }} WIB
        </p>
    </div>

    @include('pdf.partials.report-signature', ['reportCreator' => $reportCreator])
</body>
</html>
