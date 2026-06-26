@php
    $creator = $reportCreator ?? auth()->user();
    $creatorName = $creator?->name ?? 'Pengguna Sistem';
    $creatorUnit = $creator?->unitPengolah?->nama_unit;
@endphp

<div style="margin-top: 24px; page-break-inside: avoid;">
    <table style="width: 100%; border: none; border-collapse: collapse;">
        <tr>
            <td style="width: 68%; border: none;"></td>
            <td style="width: 32%; border: none; text-align: center; vertical-align: top; font-size: 9pt;">
                <div>{{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</div>
                <div style="margin-top: 5px;">Dibuat oleh,</div>
                <div style="height: 55px;"></div>
                <div style="font-weight: bold; text-decoration: underline;">{{ $creatorName }}</div>
                @if($creatorUnit)
                    <div style="margin-top: 3px;">{{ $creatorUnit }}</div>
                @endif
            </td>
        </tr>
    </table>
</div>
