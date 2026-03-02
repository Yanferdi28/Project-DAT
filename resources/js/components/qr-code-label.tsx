import { QRCodeSVG } from 'qrcode.react';
import { Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useRef } from 'react';

interface BerkasArsipData {
    nomor_berkas: number;
    nama_berkas: string;
    kode_klasifikasi?: {
        kode_klasifikasi: string;
        uraian: string;
    } | null;
    unit_pengolah?: {
        nama_unit: string;
    } | null;
    lokasi_fisik?: string | null;
    retensi_aktif?: number | null;
    retensi_inaktif?: number | null;
    uraian?: string | null;
}

interface QrCodeLabelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    berkas: BerkasArsipData | BerkasArsipData[];
    baseUrl: string;
}

function SingleLabel({ berkas, baseUrl }: { berkas: BerkasArsipData; baseUrl: string }) {
    const url = `${baseUrl}/berkas-arsip/${berkas.nomor_berkas}`;
    const kodeKlasifikasi = berkas.kode_klasifikasi
        ? `${berkas.kode_klasifikasi.kode_klasifikasi} - ${berkas.kode_klasifikasi.uraian}`
        : '-';

    return (
        <div className="flex gap-4 rounded-lg border-2 border-black bg-white p-4">
            {/* QR Code */}
            <div className="flex-shrink-0">
                <QRCodeSVG
                    value={url}
                    size={120}
                    level="M"
                    marginSize={1}
                />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 text-black">
                <p className="text-sm font-bold leading-tight">{kodeKlasifikasi}</p>
                <p className="mt-0.5 text-xs leading-tight text-gray-700">{berkas.nama_berkas}</p>
                {berkas.uraian && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-gray-500">{berkas.uraian}</p>
                )}

                <div className="mt-2 space-y-0.5 text-[11px] text-gray-600">
                    <div className="flex">
                        <span className="w-16 flex-shrink-0 font-medium text-black">Unit</span>
                        <span className="truncate">: {berkas.unit_pengolah?.nama_unit || '-'}</span>
                    </div>
                    {berkas.lokasi_fisik && (
                        <div className="flex">
                            <span className="w-16 flex-shrink-0 font-medium text-black">Lokasi</span>
                            <span className="truncate">: {berkas.lokasi_fisik}</span>
                        </div>
                    )}
                    {(berkas.retensi_aktif || berkas.retensi_inaktif) && (
                        <div className="flex">
                            <span className="w-16 flex-shrink-0 font-medium text-black">Retensi</span>
                            <span>: {berkas.retensi_aktif || '-'}A / {berkas.retensi_inaktif || '-'}I</span>
                        </div>
                    )}
                </div>

                <div className="mt-2 border-t border-gray-300 pt-1 font-mono text-[10px] text-gray-500">
                    No. Berkas: {berkas.nomor_berkas}
                </div>
            </div>
        </div>
    );
}

export function QrCodeLabelDialog({ open, onOpenChange, berkas, baseUrl }: QrCodeLabelDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const items = Array.isArray(berkas) ? berkas : [berkas];

    const handlePrint = () => {
        if (!printRef.current) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Label - Berkas Arsip</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 10mm; }
                    .label-grid { display: flex; flex-wrap: wrap; gap: 12px; }
                    .label-item { break-inside: avoid; }
                    .label-card {
                        display: flex; gap: 16px; border: 2px solid black;
                        border-radius: 8px; padding: 16px; background: white;
                        width: 380px;
                    }
                    .qr-code { flex-shrink: 0; }
                    .info { min-width: 0; flex: 1; color: black; }
                    .info .title { font-size: 13px; font-weight: bold; line-height: 1.2; }
                    .info .name { font-size: 11px; color: #374151; margin-top: 2px; }
                    .info .uraian { font-size: 10px; color: #6B7280; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                    .info .details { margin-top: 8px; font-size: 10px; color: #4B5563; }
                    .info .details .row { display: flex; margin-bottom: 2px; }
                    .info .details .lbl { width: 60px; flex-shrink: 0; font-weight: 500; color: black; }
                    .info .footer { margin-top: 8px; padding-top: 4px; border-top: 1px solid #D1D5DB; font-family: monospace; font-size: 9px; color: #6B7280; }
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="label-grid">
                    ${items.map((item) => {
                        const url = `${baseUrl}/berkas-arsip/${item.nomor_berkas}`;
                        const kode = item.kode_klasifikasi
                            ? `${item.kode_klasifikasi.kode_klasifikasi} - ${item.kode_klasifikasi.uraian}`
                            : '-';
                        // Escape HTML entities
                        const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                        return `<div class="label-item"><div class="label-card">
                            <div class="qr-code">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}" width="120" height="120" />
                            </div>
                            <div class="info">
                                <div class="title">${esc(kode)}</div>
                                <div class="name">${esc(item.nama_berkas)}</div>
                                ${item.uraian ? `<div class="uraian">${esc(item.uraian)}</div>` : ''}
                                <div class="details">
                                    <div class="row"><span class="lbl">Unit</span>: ${esc(item.unit_pengolah?.nama_unit || '-')}</div>
                                    ${item.lokasi_fisik ? `<div class="row"><span class="lbl">Lokasi</span>: ${esc(item.lokasi_fisik)}</div>` : ''}
                                    ${(item.retensi_aktif || item.retensi_inaktif) ? `<div class="row"><span class="lbl">Retensi</span>: ${item.retensi_aktif || '-'}A / ${item.retensi_inaktif || '-'}I</div>` : ''}
                                </div>
                                <div class="footer">No. Berkas: ${item.nomor_berkas}</div>
                            </div>
                        </div></div>`;
                    }).join('')}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            QR Code Label {items.length > 1 ? `(${items.length})` : ''}
                        </DialogTitle>
                        <Button
                            size="sm"
                            onClick={handlePrint}
                            className="mr-6"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={printRef} className="space-y-3">
                    {items.map((item) => (
                        <SingleLabel key={item.nomor_berkas} berkas={item} baseUrl={baseUrl} />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
