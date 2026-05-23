import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Eye,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    Minimize2,
    Image,
    FileText,
    FileIcon,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

interface DocumentPreviewProps {
    /** Path to the document relative to storage */
    dokumen: string | null;
    /** Whether the preview dialog is open */
    open?: boolean;
    /** Callback when dialog open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Show trigger button */
    showTrigger?: boolean;
    /** Inline preview mode (embedded in page) */
    inline?: boolean;
    /** Height for inline preview */
    inlineHeight?: string;
}

const isImage = (filename: string | null) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
};

const isPdf = (filename: string | null) => {
    if (!filename) return false;
    return filename.split('.').pop()?.toLowerCase() === 'pdf';
};

const getFileExtension = (filename: string | null) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toUpperCase() || '';
};

const getFileName = (path: string) => {
    return path.split('/').pop() || path;
};

export function DocumentPreview({
    dokumen,
    open: controlledOpen,
    onOpenChange,
    showTrigger = true,
    inline = false,
    inlineHeight = 'h-[500px]',
}: DocumentPreviewProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const handleZoomIn = useCallback(() => setZoom((p) => Math.min(p + 0.25, 5)), []);
    const handleZoomOut = useCallback(() => setZoom((p) => Math.max(p - 0.25, 0.25)), []);
    const handleRotate = useCallback(() => setRotation((p) => (p + 90) % 360), []);
    const handleReset = useCallback(() => {
        setZoom(1);
        setRotation(0);
        setTranslate({ x: 0, y: 0 });
    }, []);

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) handleZoomIn();
                else handleZoomOut();
            }
        },
        [handleZoomIn, handleZoomOut],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (zoom > 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
            }
        },
        [zoom, translate],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isDragging) {
                setTranslate({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        },
        [isDragging, dragStart],
    );

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            handleReset();
        }
    }, [isOpen, handleReset]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    handleRotate();
                    break;
                case '0':
                    e.preventDefault();
                    handleReset();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        setIsFullscreen(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, handleZoomIn, handleZoomOut, handleRotate, handleReset]);

    if (!dokumen) return null;

    const previewUrl = `/file/preview/${dokumen}`;
    const storageUrl = `/storage/${dokumen}`;
    const fileName = getFileName(dokumen);
    const fileExt = getFileExtension(dokumen);

    // Inline preview mode
    if (inline) {
        return (
            <div className="space-y-3">
                {isImage(dokumen) ? (
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                        onClick={() => setIsOpen(true)}
                    >
                        <img
                            src={storageUrl}
                            alt="Preview Dokumen"
                            className={'w-full object-cover transition-transform group-hover:scale-105 ' + inlineHeight}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-full bg-white/90 p-3 dark:bg-gray-800/90">
                                <Eye className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                            </div>
                        </div>
                    </div>
                ) : isPdf(dokumen) ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <iframe
                            src={`${storageUrl}#view=FitH`}
                            className="w-full min-h-[300px]"
                            title="PDF Preview"
                            style={{ border: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex-shrink-0 rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                            <FileIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Format: {fileExt}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{fileName}</span>
                    </div>
                    <div className="flex gap-2">
                        {(isImage(dokumen) || isPdf(dokumen)) && (
                            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                                <Eye className="mr-1 h-4 w-4" />
                                {isImage(dokumen) ? 'Lihat' : 'Fullscreen'}
                            </Button>
                        )}
                        <a href={storageUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                <Download className="mr-1 h-4 w-4" />
                                Unduh
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Dialog for image or PDF fullscreen */}
                <PreviewDialog
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    dokumen={dokumen}
                    fileName={fileName}
                    zoom={zoom}
                    rotation={rotation}
                    isFullscreen={isFullscreen}
                    translate={translate}
                    isDragging={isDragging}
                    containerRef={containerRef}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onRotate={handleRotate}
                    onReset={handleReset}
                    onFullscreen={() => setIsFullscreen(!isFullscreen)}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
            </div>
        );
    }

    // Trigger button mode
    return (
        <>
            {showTrigger && (
                <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                    <Eye className="mr-1.5 h-4 w-4" />
                    Preview
                </Button>
            )}

            <PreviewDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                dokumen={dokumen}
                fileName={fileName}
                zoom={zoom}
                rotation={rotation}
                isFullscreen={isFullscreen}
                translate={translate}
                isDragging={isDragging}
                containerRef={containerRef}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onRotate={handleRotate}
                onReset={handleReset}
                onFullscreen={() => setIsFullscreen(!isFullscreen)}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </>
    );
}

interface PreviewDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    dokumen: string;
    fileName: string;
    zoom: number;
    rotation: number;
    isFullscreen: boolean;
    translate: { x: number; y: number };
    isDragging: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
    onReset: () => void;
    onFullscreen: () => void;
    onWheel: (e: React.WheelEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
}

function PreviewDialog({
    isOpen,
    setIsOpen,
    dokumen,
    fileName,
    zoom,
    rotation,
    isFullscreen,
    translate,
    isDragging,
    containerRef,
    onZoomIn,
    onZoomOut,
    onRotate,
    onReset,
    onFullscreen,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: PreviewDialogProps) {
    const previewUrl = `/file/preview/${dokumen}`;
    const storageUrl = `/storage/${dokumen}`;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
            }}
        >
            <DialogContent
                className={
                    'flex flex-col p-0 [&>button]:hidden ' +
                    (isFullscreen
                        ? 'h-screen max-h-screen w-screen max-w-none rounded-none'
                        : 'h-[90vh] w-full sm:max-w-6xl')
                }
            >
                {/* Toolbar */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        {isImage(dokumen) ? (
                            <Image className="h-5 w-5 text-gray-500" />
                        ) : (
                            <FileText className="h-5 w-5 text-gray-500" />
                        )}
                        <span className="max-w-[200px] truncate text-sm font-medium text-gray-900 md:max-w-[400px] dark:text-white">
                            {fileName}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {isImage(dokumen) && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onZoomOut}
                                    disabled={zoom <= 0.25}
                                    className="h-8 w-8 p-0"
                                    title="Perkecil (−)"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="min-w-[50px] text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onZoomIn}
                                    disabled={zoom >= 5}
                                    className="h-8 w-8 p-0"
                                    title="Perbesar (+)"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRotate}
                                    className="h-8 w-8 p-0"
                                    title="Putar (R)"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onReset}
                                    className="h-8 px-2 text-xs"
                                    title="Reset (0)"
                                >
                                    Reset
                                </Button>
                                <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onFullscreen}
                            className="h-8 w-8 p-0"
                            title="Fullscreen"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>
                        <a href={storageUrl} download>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Unduh">
                                <Download className="h-4 w-4" />
                            </Button>
                        </a>
                        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            title="Tutup"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Preview Area */}
                <div
                    ref={containerRef}
                    className={
                        'flex flex-1 items-center justify-center overflow-auto bg-gray-100 dark:bg-gray-900 ' +
                        (isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : '')
                    }
                    onWheel={onWheel}
                    onMouseDown={isImage(dokumen) ? onMouseDown : undefined}
                    onMouseMove={isImage(dokumen) ? onMouseMove : undefined}
                    onMouseUp={isImage(dokumen) ? onMouseUp : undefined}
                    onMouseLeave={isImage(dokumen) ? onMouseUp : undefined}
                >
                    {isImage(dokumen) ? (
                        <img
                            src={storageUrl}
                            alt="Preview Dokumen"
                            className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                            style={{
                                transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                            draggable={false}
                        />
                    ) : isPdf(dokumen) ? (
                        <iframe
                            src={`${previewUrl}#view=FitH`}
                            className="h-full w-full"
                            title="PDF Preview"
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 p-8 text-center text-gray-500">
                            <FileIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                            <div>
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    Preview tidak tersedia
                                </p>
                                <p className="mt-1 text-sm">
                                    Format {getFileExtension(dokumen)} tidak dapat ditampilkan secara langsung
                                </p>
                            </div>
                            <a href={storageUrl} download>
                                <Button>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download File
                                </Button>
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer with keyboard shortcuts hint */}
                {isImage(dokumen) && (
                    <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-1.5 dark:border-gray-800 dark:bg-gray-900/50">
                        <p className="text-center text-[11px] text-gray-400">
                            <kbd className="rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-800">
                                +
                            </kbd>{' '}
                            /{' '}
                            <kbd className="rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-800">
                                −
                            </kbd>{' '}
                            Zoom{' · '}
                            <kbd className="rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-800">
                                R
                            </kbd>{' '}
                            Putar{' · '}
                            <kbd className="rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-800">
                                0
                            </kbd>{' '}
                            Reset{' · '}
                            Scroll + Ctrl untuk zoom{' · '}
                            Drag untuk geser
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
