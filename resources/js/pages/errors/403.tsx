import { Head, Link } from '@inertiajs/react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function Error403() {
    return (
        <>
            <Head title="403 - Akses Ditolak" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
                <div className="w-full max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-red-100 p-5 dark:bg-red-900/30">
                            <ShieldX className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <h1 className="mb-2 text-7xl font-bold text-gray-900 dark:text-white">403</h1>
                    <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Akses Ditolak
                    </h2>
                    <p className="mb-8 text-gray-500 dark:text-gray-400">
                        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda
                        merasa ini adalah kesalahan.
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
