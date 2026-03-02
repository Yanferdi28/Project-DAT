import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileSearch, X } from 'lucide-react';

interface ContentSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    onClear: () => void;
    placeholder?: string;
}

export function ContentSearch({
    value,
    onChange,
    onSearch,
    onClear,
    placeholder = 'Cari dalam isi dokumen (OCR)...',
}: ContentSearchProps) {
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
        }
    }, [onSearch]);

    return (
        <div className="relative flex gap-2">
            <div className="relative flex-1">
                <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 dark:text-purple-500" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500/20"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => { onChange(''); onClear(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
