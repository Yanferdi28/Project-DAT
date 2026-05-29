import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, MinusCircle, Brain } from 'lucide-react';

type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | null;

interface OcrStatusBadgeProps {
    status: OcrStatus;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: {
        label: 'OCR Menunggu',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: <Clock className="h-3 w-3" />,
    },
    processing: {
        label: 'OCR Diproses',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    completed: {
        label: 'OCR Selesai',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
    },
    failed: {
        label: 'OCR Gagal',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <XCircle className="h-3 w-3" />,
    },
    skipped: {
        label: 'OCR Dilewati',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
        icon: <MinusCircle className="h-3 w-3" />,
    },
};

export function OcrStatusBadge({ status, className = '' }: OcrStatusBadgeProps) {
    if (!status) return null;

    const config = statusConfig[status];
    if (!config) return null;

    return (
        <Badge variant="outline" className={`${config.className} ${className}`}>
            {config.icon}
            {config.label}
        </Badge>
    );
}

type AiSuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'corrected' | null;

interface AiStatusBadgeProps {
    status: AiSuggestionStatus;
    className?: string;
}

const aiStatusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Saran AI Menunggu',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        icon: <Brain className="h-3 w-3" />,
    },
    accepted: {
        label: 'Saran AI Diterima',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
    },
    rejected: {
        label: 'Saran AI Ditolak',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <XCircle className="h-3 w-3" />,
    },
    corrected: {
        label: 'Dikoreksi Manual',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: <CheckCircle className="h-3 w-3" />,
    },
};

export function AiStatusBadge({ status, className = '' }: AiStatusBadgeProps) {
    if (!status) return null;

    const config = aiStatusConfig[status];
    if (!config) return null;

    return (
        <Badge variant="outline" className={`${config.className} ${className}`}>
            {config.icon}
            {config.label}
        </Badge>
    );
}
