@php
    $creator = $reportCreator ?? auth()->user();
    $creatorName = $creator?->name ?? 'Pengguna Sistem';
    $creatorUnit = $creator?->unitPengolah?->nama_unit;
    $signatureMarginTop = $signatureMarginTop ?? 8;
    $signatureSpacerHeight = $signatureSpacerHeight ?? 38;
@endphp

<div style="margin-top: {{ $signatureMarginTop }}px;">
    <div style="width: 32%; margin-left: 68%; text-align: center; font-size: 9pt; line-height: 1.2;">
        <div>{{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</div>
        <div style="margin-top: 4px;">Dibuat oleh,</div>
        <div style="height: {{ $signatureSpacerHeight }}px; line-height: {{ $signatureSpacerHeight }}px;">&nbsp;</div>
        <div style="font-weight: bold; text-decoration: underline;">{{ $creatorName }}</div>
        @if($creatorUnit)
            <div style="margin-top: 2px;">{{ $creatorUnit }}</div>
        @endif
    </div>
</div>
