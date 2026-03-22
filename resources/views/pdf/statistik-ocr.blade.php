<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Statistik OCR & AI</title>
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
        .section-title {
            background-color: #e9ecef;
            padding: 8px 12px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            border-left: 4px solid #1a365d;
            font-size: 11pt;
        }
        .summary-box {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .summary-item {
            display: table-cell;
            padding: 10px;
            text-align: center;
            border: 1px solid #1a365d;
        }
        .summary-item .number {
            font-size: 18pt;
            font-weight: bold;
            color: #1a365d;
        }
        .summary-item .text {
            font-size: 8pt;
            color: #666;
        }
        .bg-success { background-color: #d4edda; }
        .bg-warning { background-color: #fff3cd; }
        .bg-danger { background-color: #f8d7da; }
        .bg-info { background-color: #cce5ff; }
        .bg-purple { background-color: #e2e3f1; }
        .bg-light { background-color: #f8f9fa; }
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
        .bar-container {
            background-color: #e2e8f0;
            height: 14px;
            border-radius: 7px;
            overflow: hidden;
        }
        .bar-fill-blue {
            background-color: #3182ce;
            height: 100%;
            border-radius: 7px;
        }
        .bar-fill-purple {
            background-color: #805ad5;
            height: 100%;
            border-radius: 7px;
        }
        .highlight-box {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
        }
        .highlight-box .big-number {
            font-size: 24pt;
            font-weight: bold;
        }
        .highlight-box .label {
            font-size: 10pt;
            margin-top: 5px;
        }
        .two-col {
            display: table;
            width: 100%;
        }
        .two-col .col {
            display: table-cell;
            width: 50%;
            padding: 0 5px;
            vertical-align: top;
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
        <h3>LAPORAN STATISTIK OCR & KLASIFIKASI AI</h3>
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    {{-- ============================================ --}}
    {{-- OCR Section --}}
    {{-- ============================================ --}}
    <div class="section-title">Statistik OCR (Optical Character Recognition)</div>

    <div class="summary-box">
        <div class="summary-item bg-info">
            <div class="number">{{ $ocrStats['total_arsip'] }}</div>
            <div class="text">Total Arsip</div>
        </div>
        <div class="summary-item bg-success">
            <div class="number">{{ $ocrStats['completed'] }}</div>
            <div class="text">OCR Berhasil</div>
        </div>
        <div class="summary-item bg-warning">
            <div class="number">{{ $ocrStats['pending'] }}</div>
            <div class="text">Belum Diproses</div>
        </div>
        <div class="summary-item bg-danger">
            <div class="number">{{ $ocrStats['failed'] }}</div>
            <div class="text">OCR Gagal</div>
        </div>
    </div>

    <div class="two-col">
        <div class="col">
            <div class="highlight-box bg-success">
                <div class="big-number" style="color: #155724;">{{ $ocrStats['success_rate'] }}%</div>
                <div class="label" style="color: #155724;">Tingkat Keberhasilan OCR</div>
            </div>
        </div>
        <div class="col">
            <div class="highlight-box bg-info">
                <div class="big-number" style="color: #004085;">{{ $ocrStats['avg_confidence'] }}%</div>
                <div class="label" style="color: #004085;">Rata-rata Confidence OCR</div>
            </div>
        </div>
    </div>

    {{-- OCR Confidence Distribution --}}
    <table>
        <thead>
            <tr>
                <th style="width: 30%">Rentang Confidence</th>
                <th style="width: 15%">Jumlah</th>
                <th style="width: 55%">Distribusi</th>
            </tr>
        </thead>
        <tbody>
            @php $maxOcr = collect($confidenceBuckets)->max('count') ?: 1; @endphp
            @foreach($confidenceBuckets as $bucket)
                <tr>
                    <td class="text-center">{{ $bucket['range'] }}</td>
                    <td class="text-center">{{ $bucket['count'] }}</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill-blue" style="width: {{ ($bucket['count'] / $maxOcr) * 100 }}%"></div>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- ============================================ --}}
    {{-- AI Classification Section --}}
    {{-- ============================================ --}}
    <div class="section-title">Statistik Klasifikasi AI</div>

    <div class="summary-box">
        <div class="summary-item bg-purple">
            <div class="number">{{ $aiStats['total_suggested'] }}</div>
            <div class="text">Total Saran AI</div>
        </div>
        <div class="summary-item bg-success">
            <div class="number">{{ $aiStats['accepted'] }}</div>
            <div class="text">Diterima</div>
        </div>
        <div class="summary-item bg-danger">
            <div class="number">{{ $aiStats['rejected'] }}</div>
            <div class="text">Ditolak</div>
        </div>
        <div class="summary-item bg-warning">
            <div class="number">{{ $aiStats['pending'] }}</div>
            <div class="text">Menunggu Review</div>
        </div>
    </div>

    <div class="two-col">
        <div class="col">
            <div class="highlight-box bg-success">
                <div class="big-number" style="color: #155724;">{{ $aiStats['acceptance_rate'] }}%</div>
                <div class="label" style="color: #155724;">Tingkat Penerimaan Saran AI</div>
            </div>
        </div>
        <div class="col">
            <div class="highlight-box bg-purple">
                <div class="big-number" style="color: #4a2d8a;">{{ $aiStats['avg_confidence'] }}%</div>
                <div class="label" style="color: #4a2d8a;">Rata-rata Confidence AI</div>
            </div>
        </div>
    </div>

    {{-- AI Confidence Distribution --}}
    <table>
        <thead>
            <tr>
                <th style="width: 30%">Rentang Confidence</th>
                <th style="width: 15%">Jumlah</th>
                <th style="width: 55%">Distribusi</th>
            </tr>
        </thead>
        <tbody>
            @php $maxAi = collect($aiConfidenceBuckets)->max('count') ?: 1; @endphp
            @foreach($aiConfidenceBuckets as $bucket)
                <tr>
                    <td class="text-center">{{ $bucket['range'] }}</td>
                    <td class="text-center">{{ $bucket['count'] }}</td>
                    <td>
                        <div class="bar-container">
                            <div class="bar-fill-purple" style="width: {{ ($bucket['count'] / $maxAi) * 100 }}%"></div>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }} WIB
    </div>
</body>
</html>
