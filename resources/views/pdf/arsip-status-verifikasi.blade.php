<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Status & Verifikasi Arsip</title>
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
            color: #1a365d;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
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
        .summary-table {
            margin-bottom: 20px;
        }
        .summary-table td {
            padding: 10px;
            text-align: center;
            font-size: 9pt;
        }
        .summary-table .number {
            font-size: 18pt;
            font-weight: bold;
            display: block;
            margin-bottom: 3px;
        }
        .summary-table .label {
            font-size: 8pt;
            color: #666;
        }
        .bg-pending {
            background-color: #fff3cd;
        }
        .bg-diterima {
            background-color: #d4edda;
        }
        .bg-ditolak {
            background-color: #f8d7da;
        }
        .bg-draft {
            background-color: #e9ecef;
        }
        .bg-published {
            background-color: #d1ecf1;
        }
        .bg-total {
            background-color: #cce5ff;
        }
        .badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 6pt;
            font-weight: bold;
            display: inline-block;
        }
        .badge-pending {
            background-color: #ffc107;
            color: #333;
        }
        .badge-diterima {
            background-color: #28a745;
            color: white;
        }
        .badge-ditolak {
            background-color: #dc3545;
            color: white;
        }
        .badge-draft {
            background-color: #6c757d;
            color: white;
        }
        .badge-published {
            background-color: #17a2b8;
            color: white;
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
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .no-data {
            text-align: center;
            padding: 30px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN STATUS & VERIFIKASI ARSIP</h3>
        @if($unitPengolah)
            <p><strong>UNIT PENGOLAH: {{ strtoupper($unitPengolah->nama_unit) }}</strong></p>
        @endif
        @if($dariTanggal && $sampaiTanggal)
            <p>PERIODE: {{ \Carbon\Carbon::parse($dariTanggal)->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($sampaiTanggal)->translatedFormat('d F Y') }}</p>
        @else
            <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    {{-- Summary Statistics --}}
    <table class="summary-table">
        <tr>
            <td class="bg-total" style="width: 16.66%;">
                <span class="number">{{ $stats['total'] ?? 0 }}</span>
                <span class="label">Total Arsip</span>
            </td>
            <td class="bg-pending" style="width: 16.66%;">
                <span class="number">{{ $stats['pending'] ?? 0 }}</span>
                <span class="label">Pending</span>
            </td>
            <td class="bg-diterima" style="width: 16.66%;">
                <span class="number">{{ $stats['diterima'] ?? 0 }}</span>
                <span class="label">Diterima</span>
            </td>
            <td class="bg-ditolak" style="width: 16.66%;">
                <span class="number">{{ $stats['ditolak'] ?? 0 }}</span>
                <span class="label">Ditolak</span>
            </td>
            <td class="bg-draft" style="width: 16.66%;">
                <span class="number">{{ $stats['draft'] ?? 0 }}</span>
                <span class="label">Draft</span>
            </td>
            <td class="bg-published" style="width: 16.66%;">
                <span class="number">{{ $stats['published'] ?? 0 }}</span>
                <span class="label">Published</span>
            </td>
        </tr>
    </table>

    @if($filterStatus && count($arsipUnits) > 0)
        {{-- Filtered by specific status --}}
        <div class="section-title">
            DAFTAR ARSIP - STATUS: {{ strtoupper($filterStatus) }}
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 3%;">NO</th>
                    <th style="width: 8%;">KODE KLASIFIKASI</th>
                    <th style="width: 8%;">NO ITEM</th>
                    <th style="width: 18%;">URAIAN INFORMASI</th>
                    <th style="width: 8%;">UNIT PENGOLAH</th>
                    <th style="width: 7%;">TANGGAL</th>
                    <th style="width: 7%;">STATUS</th>
                    <th style="width: 7%;">PUBLISH</th>
                    <th style="width: 10%;">DIVERIFIKASI OLEH</th>
                    <th style="width: 8%;">TGL VERIFIKASI</th>
                    <th style="width: 16%;">CATATAN VERIFIKASI</th>
                </tr>
            </thead>
            <tbody>
                @foreach($arsipUnits as $index => $arsip)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                    <td>{{ $arsip->no_item_arsip ?? '-' }}</td>
                    <td>{{ Str::limit($arsip->uraian_informasi, 50) ?? '-' }}</td>
                    <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d/m/Y') : '-' }}</td>
                    <td class="text-center">
                        <span class="badge badge-{{ $arsip->status }}">{{ strtoupper($arsip->status) }}</span>
                    </td>
                    <td class="text-center">
                        <span class="badge badge-{{ $arsip->publish_status ?? 'draft' }}">
                            {{ strtoupper($arsip->publish_status ?? 'DRAFT') }}
                        </span>
                    </td>
                    <td>
                        {{ $arsip->verifiedBy->name ?? $arsip->verifikasiOleh->name ?? '-' }}
                    </td>
                    <td class="text-center">
                        {{ $arsip->verified_at ? \Carbon\Carbon::parse($arsip->verified_at)->format('d/m/Y H:i') : ($arsip->verifikasi_tanggal ? \Carbon\Carbon::parse($arsip->verifikasi_tanggal)->format('d/m/Y H:i') : '-') }}
                    </td>
                    <td>{{ Str::limit($arsip->verification_notes ?? $arsip->verifikasi_keterangan, 40) ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        {{-- Show all statuses grouped --}}
        
        @if(isset($arsipPending) && count($arsipPending) > 0)
        <div class="section-title" style="background-color: #fff3cd; border-left-color: #ffc107;">
            ARSIP PENDING - MENUNGGU VERIFIKASI ({{ count($arsipPending) }})
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 3%;">NO</th>
                    <th style="width: 10%;">KODE KLASIFIKASI</th>
                    <th style="width: 8%;">NO ITEM</th>
                    <th style="width: 22%;">URAIAN INFORMASI</th>
                    <th style="width: 12%;">UNIT PENGOLAH</th>
                    <th style="width: 10%;">TANGGAL</th>
                    <th style="width: 8%;">PUBLISH</th>
                    <th style="width: 10%;">DIBUAT</th>
                    <th style="width: 12%;">LOKASI</th>
                </tr>
            </thead>
            <tbody>
                @foreach($arsipPending as $index => $arsip)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                    <td>{{ $arsip->no_item_arsip ?? '-' }}</td>
                    <td>{{ Str::limit($arsip->uraian_informasi, 55) ?? '-' }}</td>
                    <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d/m/Y') : '-' }}</td>
                    <td class="text-center">
                        <span class="badge badge-{{ $arsip->publish_status ?? 'draft' }}">{{ strtoupper($arsip->publish_status ?? 'DRAFT') }}</span>
                    </td>
                    <td class="text-center">{{ $arsip->created_at ? \Carbon\Carbon::parse($arsip->created_at)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $arsip->ruangan ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if(isset($arsipDiterima) && count($arsipDiterima) > 0)
        <div class="section-title" style="background-color: #d4edda; border-left-color: #28a745;">
            ARSIP DITERIMA ({{ count($arsipDiterima) }})
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 3%;">NO</th>
                    <th style="width: 9%;">KODE KLASIFIKASI</th>
                    <th style="width: 7%;">NO ITEM</th>
                    <th style="width: 18%;">URAIAN INFORMASI</th>
                    <th style="width: 10%;">UNIT PENGOLAH</th>
                    <th style="width: 8%;">TANGGAL</th>
                    <th style="width: 7%;">PUBLISH</th>
                    <th style="width: 10%;">DIVERIFIKASI OLEH</th>
                    <th style="width: 8%;">TGL VERIFIKASI</th>
                    <th style="width: 20%;">CATATAN</th>
                </tr>
            </thead>
            <tbody>
                @foreach($arsipDiterima as $index => $arsip)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                    <td>{{ $arsip->no_item_arsip ?? '-' }}</td>
                    <td>{{ Str::limit($arsip->uraian_informasi, 40) ?? '-' }}</td>
                    <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d/m/Y') : '-' }}</td>
                    <td class="text-center">
                        <span class="badge badge-{{ $arsip->publish_status ?? 'draft' }}">
                            {{ strtoupper($arsip->publish_status ?? 'DRAFT') }}
                        </span>
                    </td>
                    <td>{{ $arsip->verifiedBy->name ?? $arsip->verifikasiOleh->name ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->verified_at ? \Carbon\Carbon::parse($arsip->verified_at)->format('d/m/Y') : ($arsip->verifikasi_tanggal ? \Carbon\Carbon::parse($arsip->verifikasi_tanggal)->format('d/m/Y') : '-') }}</td>
                    <td>{{ Str::limit($arsip->verification_notes ?? $arsip->verifikasi_keterangan, 40) ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if(isset($arsipDitolak) && count($arsipDitolak) > 0)
        <div class="section-title" style="background-color: #f8d7da; border-left-color: #dc3545;">
            ARSIP DITOLAK ({{ count($arsipDitolak) }})
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 3%;">NO</th>
                    <th style="width: 9%;">KODE KLASIFIKASI</th>
                    <th style="width: 7%;">NO ITEM</th>
                    <th style="width: 18%;">URAIAN INFORMASI</th>
                    <th style="width: 10%;">UNIT PENGOLAH</th>
                    <th style="width: 8%;">TANGGAL</th>
                    <th style="width: 10%;">DITOLAK OLEH</th>
                    <th style="width: 8%;">TGL TOLAK</th>
                    <th style="width: 27%;">ALASAN PENOLAKAN</th>
                </tr>
            </thead>
            <tbody>
                @foreach($arsipDitolak as $index => $arsip)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                    <td>{{ $arsip->no_item_arsip ?? '-' }}</td>
                    <td>{{ Str::limit($arsip->uraian_informasi, 40) ?? '-' }}</td>
                    <td>{{ $arsip->unitPengolah->nama_unit ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $arsip->verifiedBy->name ?? $arsip->verifikasiOleh->name ?? '-' }}</td>
                    <td class="text-center">{{ $arsip->verified_at ? \Carbon\Carbon::parse($arsip->verified_at)->format('d/m/Y') : ($arsip->verifikasi_tanggal ? \Carbon\Carbon::parse($arsip->verifikasi_tanggal)->format('d/m/Y') : '-') }}</td>
                    <td style="color: #dc3545;">{{ $arsip->verification_notes ?? $arsip->verifikasi_keterangan ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @php
            $totalData = (isset($arsipPending) ? count($arsipPending) : 0) + 
                         (isset($arsipDiterima) ? count($arsipDiterima) : 0) + 
                         (isset($arsipDitolak) ? count($arsipDitolak) : 0);
        @endphp
        
        @if($totalData == 0)
        <div class="no-data">
            <p>Tidak ada data arsip yang ditemukan.</p>
        </div>
        @endif
    @endif

    <div class="footer">
        <table style="border: none; width: 100%;">
            <tr>
                <td style="border: none; text-align: left; width: 50%;">
                    Total Arsip: <strong>{{ $stats['total'] ?? 0 }}</strong>
                </td>
                <td style="border: none; text-align: right; width: 50%;">
                    Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i:s') }}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
