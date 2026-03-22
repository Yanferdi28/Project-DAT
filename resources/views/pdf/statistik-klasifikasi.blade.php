<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Statistik Klasifikasi Arsip</title>
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
        .header h3 {
            margin: 3px 0;
            font-size: 14pt;
            font-weight: bold;
            color: #1a365d;
        }
        .header p {
            margin: 3px 0;
            font-size: 9pt;
            color: #333;
        }
        .summary-section {
            margin-bottom: 20px;
            padding: 12px;
            background-color: #f0f4f8;
            border-radius: 5px;
        }
        .summary-title {
            font-size: 11pt;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 8px;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 33%;
            text-align: center;
            padding: 8px;
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            border: 1px solid #1a365d;
            padding: 6px 8px;
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
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-row {
            background-color: #e2e8f0;
            font-weight: bold;
        }
        .section-title {
            background-color: #e9ecef;
            padding: 8px 12px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 8px;
            border-left: 4px solid #1a365d;
            font-size: 10pt;
        }
        .bar-container {
            background-color: #e2e8f0;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
        }
        .bar-fill {
            background-color: #3182ce;
            height: 100%;
            border-radius: 6px;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN STATISTIK KLASIFIKASI ARSIP</h3>
        @if($unitPengolah)
            <p><strong>UNIT PENGOLAH: {{ strtoupper($unitPengolah->nama_unit) }}</strong></p>
        @endif
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    {{-- Summary --}}
    <div class="summary-section">
        <div class="summary-title">Ringkasan</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">{{ $totalArsip }}</div>
                <div class="summary-label">Total Arsip</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $perKlasifikasi->count() }}</div>
                <div class="summary-label">Kode Klasifikasi Terpakai</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $perPrefix->count() }}</div>
                <div class="summary-label">Grup Klasifikasi</div>
            </div>
        </div>
    </div>

    {{-- Per Prefix Group --}}
    <div class="section-title">Distribusi per Grup Klasifikasi</div>
    <table>
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 15%">Prefix</th>
                <th style="width: 15%">Jumlah Arsip</th>
                <th style="width: 15%">Persentase</th>
                <th style="width: 50%">Proporsi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($perPrefix as $index => $group)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center" style="font-weight: bold;">{{ $group['prefix'] }}</td>
                    <td class="text-center">{{ $group['jumlah'] }}</td>
                    <td class="text-center">{{ $group['persentase'] }}%</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: {{ $group['persentase'] }}%"></div>
                        </div>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="padding: 20px; color: #666;">Tidak ada data</td>
                </tr>
            @endforelse
            @if($perPrefix->count() > 0)
                <tr class="total-row">
                    <td colspan="2" class="text-center">TOTAL</td>
                    <td class="text-center">{{ $totalArsip }}</td>
                    <td class="text-center">100%</td>
                    <td></td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- Detailed per Kode Klasifikasi --}}
    <div class="section-title">Detail per Kode Klasifikasi</div>
    <table>
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 15%">Kode</th>
                <th style="width: 45%">Uraian</th>
                <th style="width: 15%">Jumlah</th>
                <th style="width: 20%">Persentase</th>
            </tr>
        </thead>
        <tbody>
            @forelse($perKlasifikasi as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td style="font-weight: bold;">{{ $item['kode_klasifikasi'] }}</td>
                    <td>{{ $item['uraian'] }}</td>
                    <td class="text-center">{{ $item['jumlah'] }}</td>
                    <td class="text-center">{{ $item['persentase'] }}%</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="padding: 20px; color: #666;">Tidak ada data</td>
                </tr>
            @endforelse
            @if($perKlasifikasi->count() > 0)
                <tr class="total-row">
                    <td colspan="3" class="text-center">TOTAL</td>
                    <td class="text-center">{{ $totalArsip }}</td>
                    <td class="text-center">100%</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }} WIB
    </div>
</body>
</html>
