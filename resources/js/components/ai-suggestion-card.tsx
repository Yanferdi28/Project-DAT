import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Brain, Check, X, ArrowRight } from 'lucide-react';
import { AiStatusBadge } from '@/components/ocr-status-badge';
import { router } from '@inertiajs/react';

interface AiSuggestionCardProps {
    arsipUnitId: number;
    currentKodeKlasifikasi: string;
    suggestedKodeKlasifikasi?: { id: number; kode_klasifikasi: string; uraian: string } | null;
    aiConfidenceScore: number | null;
    aiSuggestionStatus: string | null;
}

export function AiSuggestionCard({
    arsipUnitId,
    currentKodeKlasifikasi,
    suggestedKodeKlasifikasi,
    aiConfidenceScore,
    aiSuggestionStatus,
}: AiSuggestionCardProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    if (!suggestedKodeKlasifikasi && !aiSuggestionStatus) return null;

    const handleAccept = () => {
        setIsAccepting(true);
        router.post(`/arsip-unit/${arsipUnitId}/ocr-accept`, {}, {
            preserveScroll: true,
            onFinish: () => setIsAccepting(false),
        });
    };

    const handleReject = () => {
        setIsRejecting(true);
        router.post(`/arsip-unit/${arsipUnitId}/ocr-reject`, {}, {
            preserveScroll: true,
            onFinish: () => setIsRejecting(false),
        });
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const isPending = aiSuggestionStatus === null || aiSuggestionStatus === 'pending';
    const isAccepted = aiSuggestionStatus === 'accepted';
    const isRejected = aiSuggestionStatus === 'rejected';
    const isCorrected = aiSuggestionStatus === 'corrected';

    return (
        <Card className={isPending ? 'border-purple-200 dark:border-purple-800' : ''}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Saran Klasifikasi AI
                    </CardTitle>
                    <AiStatusBadge status={(aiSuggestionStatus ?? 'pending') as 'pending' | 'accepted' | 'rejected' | 'corrected'} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Confidence Score */}
                {aiConfidenceScore !== null && (
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Tingkat Keyakinan AI</label>
                        <p className={`mt-1 text-lg font-bold ${getConfidenceColor(Number(aiConfidenceScore))}`}>
                            {Number(aiConfidenceScore).toFixed(1)}%
                        </p>
                    </div>
                )}

                <Separator />

                {/* Current vs Suggested comparison */}
                {suggestedKodeKlasifikasi && (
                    <div className="space-y-3">
                        {/* Kode Klasifikasi comparison */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Kode Klasifikasi</label>
                            <div className="mt-1 flex items-center gap-2 text-sm">
                                <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                                    {currentKodeKlasifikasi}
                                </span>
                                <ArrowRight className="h-4 w-4 text-purple-500" />
                                <span className="rounded bg-purple-100 px-2 py-1 font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    {suggestedKodeKlasifikasi.kode_klasifikasi} — {suggestedKodeKlasifikasi.uraian}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons (only if pending) */}
                {isPending && suggestedKodeKlasifikasi && (
                    <>
                        <Separator />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAccept}
                                disabled={isAccepting || isRejecting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                {isAccepting ? 'Menerima...' : 'Terima Saran'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                disabled={isAccepting || isRejecting}
                                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                                size="sm"
                            >
                                <X className="h-4 w-4 mr-1" />
                                {isRejecting ? 'Menolak...' : 'Tolak Saran'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Accepted message */}
                {isAccepted && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                        <p className="text-sm text-green-800 dark:text-green-300">
                            Saran klasifikasi AI telah diterima dan diterapkan.
                        </p>
                    </div>
                )}

                {/* Rejected message */}
                {isRejected && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm text-red-800 dark:text-red-300">
                            Saran klasifikasi AI telah ditolak.
                        </p>
                    </div>
                )}

                {/* Corrected message */}
                {isCorrected && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Kode klasifikasi telah dikoreksi manual dan akan ikut menjadi data training.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
