<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Log Aktivitas</title>
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
            color: #333;
        }
        .summary-box {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .summary-item {
            display: table-cell;
            width: 20%;
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
        .summary-item.bg-created { background-color: #d4edda; }
        .summary-item.bg-updated { background-color: #fff3cd; }
        .summary-item.bg-deleted { background-color: #f8d7da; }
        .summary-item.bg-total { background-color: #cce5ff; }
        .summary-item.bg-users { background-color: #e2e3f1; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            border: 1px solid #1a365d;
            padding: 4px 6px;
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
        .text-center { text-align: center; }
        .badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 6pt;
            font-weight: bold;
            display: inline-block;
        }
        .badge-created { background-color: #28a745; color: white; }
        .badge-updated { background-color: #ffc107; color: #333; }
        .badge-deleted { background-color: #dc3545; color: white; }
        .section-title {
            background-color: #e9ecef;
            padding: 5px 10px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            border-left: 4px solid #1a365d;
            font-size: 10pt;
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
        <h3>LAPORAN LOG AKTIVITAS (AUDIT TRAIL)</h3>
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @endif
        @if($action)
            <p>Filter Aksi: {{ ucfirst($action) }}</p>
        @endif
    </div>

    {{-- Summary Statistics --}}
    <div class="summary-box">
        <div class="summary-item bg-total">
            <div class="number">{{ $stats['total'] }}</div>
            <div class="text">Total Aktivitas</div>
        </div>
        <div class="summary-item bg-created">
            <div class="number">{{ $stats['created'] }}</div>
            <div class="text">Created</div>
        </div>
        <div class="summary-item bg-updated">
            <div class="number">{{ $stats['updated'] }}</div>
            <div class="text">Updated</div>
        </div>
        <div class="summary-item bg-deleted">
            <div class="number">{{ $stats['deleted'] }}</div>
            <div class="text">Deleted</div>
        </div>
        <div class="summary-item bg-users">
            <div class="number">{{ $stats['unique_users'] }}</div>
            <div class="text">Pengguna Aktif</div>
        </div>
    </div>

    {{-- Top Users --}}
    @if($perUser->count() > 0)
    <div class="section-title">Aktivitas per Pengguna (Top 10)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 50%">Nama Pengguna</th>
                <th style="width: 20%">Jumlah Aktivitas</th>
                <th style="width: 25%">Proporsi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($perUser as $index => $user)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $user['nama'] }}</td>
                    <td class="text-center">{{ $user['jumlah'] }}</td>
                    <td class="text-center">{{ $stats['total'] > 0 ? round(($user['jumlah'] / $stats['total']) * 100, 1) : 0 }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- Detail Log --}}
    <div class="section-title">Detail Log Aktivitas ({{ $logs->count() }} entri terbaru)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 4%">No</th>
                <th style="width: 12%">Waktu</th>
                <th style="width: 13%">Pengguna</th>
                <th style="width: 7%">Aksi</th>
                <th style="width: 10%">Model</th>
                <th style="width: 44%">Deskripsi</th>
                <th style="width: 10%">IP Address</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $index => $log)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ $log->created_at->translatedFormat('d/m/Y H:i') }}</td>
                    <td>{{ $log->user?->name ?? '-' }}</td>
                    <td class="text-center">
                        @php
                            $badgeClass = match($log->action) {
                                'created' => 'badge-created',
                                'updated' => 'badge-updated',
                                'deleted' => 'badge-deleted',
                                default => '',
                            };
                        @endphp
                        <span class="badge {{ $badgeClass }}">{{ strtoupper($log->action) }}</span>
                    </td>
                    <td class="text-center">{{ $log->model_name }}</td>
                    <td>{{ \Illuminate\Support\Str::limit($log->description, 80) }}</td>
                    <td class="text-center">{{ $log->ip_address ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 20px; color: #666;">Tidak ada data</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }} WIB
    </div>
</body>
</html>
