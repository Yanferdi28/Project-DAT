<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Berita Acara Penyerahan Arsip</title>
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 15mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
        }
        .header h2 {
            margin: 5px 0;
            font-size: 16pt;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .header h3 {
            margin: 5px 0;
            font-size: 14pt;
            font-weight: bold;
        }
        .nomor-ba {
            margin: 15px 0;
            font-size: 12pt;
        }
        .content {
            margin: 20px 0;
            text-align: justify;
        }
        .content p {
            margin: 10px 0;
            text-indent: 40px;
        }
        .pihak-info {
            margin: 15px 0;
        }
        .pihak-info table {
            width: 100%;
            border: none;
        }
        .pihak-info td {
            padding: 3px 0;
            vertical-align: top;
            border: none;
        }
        .pihak-info .label {
            width: 150px;
        }
        .pihak-info .separator {
            width: 20px;
            text-align: center;
        }
        table.arsip-list {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table.arsip-list th,
        table.arsip-list td {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: top;
        }
        table.arsip-list th {
            background-color: #e9ecef;
            font-weight: bold;
            text-align: center;
        }
        table.arsip-list td.text-center {
            text-align: center;
        }
        .keterangan {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #333;
        }
        .keterangan-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .signatures {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        .signatures table {
            width: 100%;
            border: none;
        }
        .signatures td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 10px;
            border: none;
        }
        .sign-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .sign-name {
            margin-top: 80px;
            font-weight: bold;
            text-decoration: underline;
        }
        .sign-jabatan {
            font-size: 11pt;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .timestamp {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
        }
        .summary-box {
            background-color: #f0f7ff;
            border: 1px solid #0066cc;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .summary-box h4 {
            margin: 0 0 10px 0;
            color: #0066cc;
        }
        .summary-box table {
            border: none;
        }
        .summary-box td {
            border: none;
            padding: 3px 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>BERITA ACARA</h2>
        <h3>PENYERAHAN ARSIP</h3>
        <div class="nomor-ba">
            Nomor: <strong>{{ $beritaAcara->nomor_berita_acara }}</strong>
        </div>
    </div>

    <div class="content">
        <p>
            Pada hari ini, {{ \Carbon\Carbon::parse($beritaAcara->tanggal_penyerahan)->translatedFormat('l') }}, 
            tanggal {{ \Carbon\Carbon::parse($beritaAcara->tanggal_penyerahan)->translatedFormat('d F Y') }}, 
            bertempat di Kantor, telah dilaksanakan serah terima arsip antara:
        </p>

        <div class="pihak-info">
            <p><strong>PIHAK PERTAMA (Yang Menyerahkan):</strong></p>
            <table>
                <tr>
                    <td class="label">Unit Pengolah</td>
                    <td class="separator">:</td>
                    <td><strong>{{ $beritaAcara->unitPengolahAsal->nama_unit ?? '-' }}</strong></td>
                </tr>
            </table>
        </div>

        <div class="pihak-info">
            <p><strong>PIHAK KEDUA (Yang Menerima):</strong></p>
            <table>
                @if($beritaAcara->unitPengolahTujuan)
                <tr>
                    <td class="label">Unit Pengolah</td>
                    <td class="separator">:</td>
                    <td><strong>{{ $beritaAcara->unitPengolahTujuan->nama_unit }}</strong></td>
                </tr>
                @else
                <tr>
                    <td class="label">Nama</td>
                    <td class="separator">:</td>
                    <td><strong>{{ $beritaAcara->penerima_nama ?? '-' }}</strong></td>
                </tr>
                <tr>
                    <td class="label">Jabatan</td>
                    <td class="separator">:</td>
                    <td>{{ $beritaAcara->penerima_jabatan ?? '-' }}</td>
                </tr>
                @endif
            </table>
        </div>

        <p>
            Dengan ini menyatakan bahwa PIHAK PERTAMA telah menyerahkan arsip kepada PIHAK KEDUA 
            dengan rincian sebagai berikut:
        </p>
    </div>

    <div class="summary-box">
        <h4>RINGKASAN PENYERAHAN</h4>
        <table>
            <tr>
                <td>Total Arsip Diserahkan</td>
                <td>:</td>
                <td><strong>{{ $beritaAcara->arsipUnits->count() }} item</strong></td>
            </tr>
            <tr>
                <td>Tanggal Penyerahan</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($beritaAcara->tanggal_penyerahan)->translatedFormat('d F Y') }}</td>
            </tr>
        </table>
    </div>

    <h4>DAFTAR ARSIP YANG DISERAHKAN:</h4>
    <table class="arsip-list">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 15%;">Kode Klasifikasi</th>
                <th style="width: 12%;">No. Item</th>
                <th style="width: 38%;">Uraian Informasi</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 15%;">Lokasi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($beritaAcara->arsipUnits as $index => $arsip)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-' }}</td>
                <td>{{ $arsip->no_item_arsip ?? '-' }}</td>
                <td>{{ $arsip->uraian_informasi ?? '-' }}</td>
                <td class="text-center">{{ $arsip->tanggal ? \Carbon\Carbon::parse($arsip->tanggal)->format('d/m/Y') : '-' }}</td>
                <td>
                    @if($arsip->ruangan)
                        {{ $arsip->ruangan }}
                        @if($arsip->no_box) / Box {{ $arsip->no_box }} @endif
                    @else
                        -
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($beritaAcara->keterangan)
    <div class="keterangan">
        <div class="keterangan-title">KETERANGAN:</div>
        <p style="margin: 0; text-indent: 0;">{{ $beritaAcara->keterangan }}</p>
    </div>
    @endif

    <div class="content">
        <p>
            Demikian Berita Acara Penyerahan Arsip ini dibuat dengan sebenarnya untuk dapat 
            dipergunakan sebagaimana mestinya.
        </p>
    </div>

    <div class="signatures">
        <table>
            <tr>
                <td>
                    <div class="sign-title">PIHAK PERTAMA</div>
                    <div class="sign-title">Yang Menyerahkan</div>
                    <div class="sign-name">
                        (.................................................)
                    </div>
                    <div class="sign-jabatan">{{ $beritaAcara->unitPengolahAsal->nama_unit ?? '' }}</div>
                </td>
                <td>
                    <div class="sign-title">PIHAK KEDUA</div>
                    <div class="sign-title">Yang Menerima</div>
                    <div class="sign-name">
                        @if($beritaAcara->penerima_nama)
                            {{ $beritaAcara->penerima_nama }}
                        @else
                            (.................................................)
                        @endif
                    </div>
                    <div class="sign-jabatan">
                        @if($beritaAcara->unitPengolahTujuan)
                            {{ $beritaAcara->unitPengolahTujuan->nama_unit }}
                        @elseif($beritaAcara->penerima_jabatan)
                            {{ $beritaAcara->penerima_jabatan }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah.</p>
        <div class="timestamp">
            Dibuat oleh: {{ $beritaAcara->dibuatOleh->name ?? 'System' }} | 
            Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i:s') }}
        </div>
    </div>
</body>
</html>
