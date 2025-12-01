<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Rekap Arsip per Unit Pengolah</title>
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
            padding: 8px 10px;
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
        .text-right {
            text-align: right;
        }
        .total-row {
            background-color: #e2e8f0;
            font-weight: bold;
        }
        .unit-name {
            font-weight: bold;
            color: #1a365d;
        }
        
        /* Status colors */
        .status-pending {
            color: #d69e2e;
            font-weight: bold;
        }
        .status-diterima {
            color: #38a169;
            font-weight: bold;
        }
        .status-ditolak {
            color: #e53e3e;
            font-weight: bold;
        }
        
        /* Chart visualization using table */
        .bar-container {
            width: 100%;
            height: 12px;
            background-color: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background-color: #3182ce;
            border-radius: 3px;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
        }
        .signature-section {
            float: right;
            width: 200px;
            text-align: center;
        }
        .signature-line {
            margin-top: 60px;
            border-top: 1px solid #333;
            padding-top: 5px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN REKAP ARSIP</h2>
        <h3>PER UNIT PENGOLAH</h3>
        @if($dariTanggal && $sampaiTanggal)
            <p>Periode: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Per Tanggal: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
        <div class="summary-title">RINGKASAN KESELURUHAN</div>
        <table style="border: none; margin-bottom: 0;">
            <tr style="border: none;">
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value">{{ $totalStats['total_unit'] }}</div>
                    <div class="summary-label">Unit Pengolah</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value">{{ $totalStats['total_arsip'] }}</div>
                    <div class="summary-label">Total Arsip</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value">{{ $totalStats['total_berkas'] }}</div>
                    <div class="summary-label">Total Berkas</div>
                </td>
                <td style="border: none; width: 25%; text-align: center; padding: 10px;">
                    <div class="summary-value">{{ number_format($totalStats['avg_arsip_per_unit'], 1) }}</div>
                    <div class="summary-label">Rata-rata Arsip/Unit</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Main Table: Rekap per Unit Pengolah -->
    <h4 style="color: #1a365d; margin-bottom: 10px;">REKAP ARSIP PER UNIT PENGOLAH</h4>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">NO</th>
                <th style="width: 30%;">UNIT PENGOLAH</th>
                <th style="width: 10%;">JUMLAH ARSIP</th>
                <th style="width: 10%;">JUMLAH BERKAS</th>
                <th style="width: 10%;">PENDING</th>
                <th style="width: 10%;">DITERIMA</th>
                <th style="width: 10%;">DITOLAK</th>
                <th style="width: 15%;">PROPORSI</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach($rekapPerUnit as $rekap)
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td class="unit-name">{{ $rekap['nama_unit'] }}</td>
                    <td class="text-center">{{ $rekap['jumlah_arsip'] }}</td>
                    <td class="text-center">{{ $rekap['jumlah_berkas'] }}</td>
                    <td class="text-center status-pending">{{ $rekap['pending'] }}</td>
                    <td class="text-center status-diterima">{{ $rekap['diterima'] }}</td>
                    <td class="text-center status-ditolak">{{ $rekap['ditolak'] }}</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: {{ $totalStats['total_arsip'] > 0 ? ($rekap['jumlah_arsip'] / $totalStats['total_arsip'] * 100) : 0 }}%;"></div>
                        </div>
                        <div style="text-align: center; font-size: 7pt; margin-top: 2px;">
                            {{ $totalStats['total_arsip'] > 0 ? number_format($rekap['jumlah_arsip'] / $totalStats['total_arsip'] * 100, 1) : 0 }}%
                        </div>
                    </td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2" class="text-center">TOTAL</td>
                <td class="text-center">{{ $totalStats['total_arsip'] }}</td>
                <td class="text-center">{{ $totalStats['total_berkas'] }}</td>
                <td class="text-center status-pending">{{ $totalStats['total_pending'] }}</td>
                <td class="text-center status-diterima">{{ $totalStats['total_diterima'] }}</td>
                <td class="text-center status-ditolak">{{ $totalStats['total_ditolak'] }}</td>
                <td class="text-center">100%</td>
            </tr>
        </tbody>
    </table>

    <!-- Status Summary Table -->
    <h4 style="color: #1a365d; margin-bottom: 10px; margin-top: 25px;">RINGKASAN STATUS VERIFIKASI</h4>
    <table style="width: 60%;">
        <thead>
            <tr>
                <th style="width: 40%;">STATUS</th>
                <th style="width: 30%;">JUMLAH</th>
                <th style="width: 30%;">PERSENTASE</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="status-pending">● Pending</span></td>
                <td class="text-center">{{ $totalStats['total_pending'] }}</td>
                <td class="text-center">{{ $totalStats['total_arsip'] > 0 ? number_format($totalStats['total_pending'] / $totalStats['total_arsip'] * 100, 1) : 0 }}%</td>
            </tr>
            <tr>
                <td><span class="status-diterima">● Diterima</span></td>
                <td class="text-center">{{ $totalStats['total_diterima'] }}</td>
                <td class="text-center">{{ $totalStats['total_arsip'] > 0 ? number_format($totalStats['total_diterima'] / $totalStats['total_arsip'] * 100, 1) : 0 }}%</td>
            </tr>
            <tr>
                <td><span class="status-ditolak">● Ditolak</span></td>
                <td class="text-center">{{ $totalStats['total_ditolak'] }}</td>
                <td class="text-center">{{ $totalStats['total_arsip'] > 0 ? number_format($totalStats['total_ditolak'] / $totalStats['total_arsip'] * 100, 1) : 0 }}%</td>
            </tr>
            <tr class="total-row">
                <td class="text-center"><strong>TOTAL</strong></td>
                <td class="text-center">{{ $totalStats['total_arsip'] }}</td>
                <td class="text-center">100%</td>
            </tr>
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p style="font-size: 8pt; color: #666;">
            Laporan ini digenerate secara otomatis pada {{ \Carbon\Carbon::now()->translatedFormat('d F Y, H:i') }} WIB
        </p>
        <div class="signature-section">
            <p>{{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
            <p>Mengetahui,</p>
            <div class="signature-line">
                <p>_______________________</p>
            </div>
        </div>
    </div>
</body>
</html>
