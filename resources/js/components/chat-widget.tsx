import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, FileText, Loader2, Database, Sparkles } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatSource[];
    timestamp: Date;
}

interface ChatSource {
    arsip_id: string;
    indeks: string;
    uraian_informasi: string;
    tanggal: string;
    kategori: string;
    unit_pengolah: string;
    similarity: number;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Halo! Saya adalah asisten AI untuk Sistem Arsip Digital. Tanyakan apa saja tentang dokumen arsip Anda. 📄',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isIndexing, setIsIndexing] = useState(false);
    const [status, setStatus] = useState<{ documents_indexed: number; gemini_available: boolean } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !status) {
            fetchStatus();
        }
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/chat/status');
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch {
            // silently fail
        }
    };

    const handleSend = async () => {
        const query = input.trim();
        if (!query || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ query, top_k: 5 }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer || 'Maaf, saya tidak dapat memproses pertanyaan Anda.',
                sources: data.sources || [],
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Pastikan layanan OCR sedang berjalan.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIndexAll = async () => {
        setIsIndexing(true);

        const indexMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '⏳ Sedang mengindeks semua dokumen arsip... Ini mungkin memakan waktu beberapa menit.',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, indexMessage]);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/chat/index-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });

            const data = await response.json();

            const resultMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.success
                    ? `✅ Berhasil mengindeks ${data.indexed_count} dokumen arsip! Sekarang Anda bisa bertanya tentang isi dokumen-dokumen tersebut.`
                    : `❌ Gagal mengindeks: ${data.error || 'Unknown error'}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, resultMessage]);
            fetchStatus();
        } catch {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Gagal mengindeks. Pastikan layanan OCR sedang berjalan.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsIndexing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-shadow hover:shadow-xl hover:shadow-purple-500/30"
                        aria-label="Buka AI Assistant"
                    >
                        <Sparkles className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed right-4 bottom-4 z-50 flex h-[560px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:right-6 sm:bottom-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                                    <p className="text-xs text-purple-100">
                                        {status ? `${status.documents_indexed} dokumen terindeks` : 'Sistem Arsip Digital'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                aria-label="Tutup chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Index Banner */}
                        {status && status.documents_indexed === 0 && (
                            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="mb-1.5 text-xs text-amber-800 dark:text-amber-300">
                                    Belum ada dokumen terindeks. Indeks semua arsip untuk memulai.
                                </p>
                                <button
                                    onClick={handleIndexAll}
                                    disabled={isIndexing}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                                >
                                    <Database className="h-3.5 w-3.5" />
                                    {isIndexing ? 'Mengindeks...' : 'Indeks Semua Arsip'}
                                </button>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'rounded-br-md bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                                                    : 'rounded-bl-md border border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                            }`}
                                        >
                                            <div className="whitespace-pre-wrap">{msg.content}</div>

                                            {/* Source references */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-2 dark:border-gray-600">
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        📎 Sumber ({msg.sources.length} arsip):
                                                    </p>
                                                    {msg.sources.map((source, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={`/arsip-unit/${source.arsip_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-start gap-1.5 rounded-lg bg-white/80 p-2 text-xs transition-colors hover:bg-white dark:bg-gray-700/50 dark:hover:bg-gray-700"
                                                        >
                                                            <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                    {source.indeks || 'N/A'}
                                                                </p>
                                                                {source.uraian_informasi && (
                                                                    <p className="truncate text-gray-500 dark:text-gray-400">
                                                                        {source.uraian_informasi}
                                                                    </p>
                                                                )}
                                                                <span className="text-purple-500">
                                                                    Relevansi: {Math.round(source.similarity * 100)}%
                                                                </span>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Sedang berpikir...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Tanyakan tentang arsip..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-purple-400 dark:focus:bg-gray-800"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-40 disabled:shadow-none"
                                    aria-label="Kirim pesan"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
