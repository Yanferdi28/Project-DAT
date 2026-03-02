import { Head, Link } from '@inertiajs/react';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="404 - Halaman Tidak Ditemukan" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
                <div className="w-full max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-amber-100 p-5 dark:bg-amber-900/30">
                            <SearchX className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>

                    <h1 className="mb-2 text-7xl font-bold text-gray-900 dark:text-white">404</h1>
                    <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="mb-8 text-gray-500 dark:text-gray-400">
                        Halaman yang Anda cari tidak ditemukan. Halaman mungkin telah dipindahkan, dihapus, atau URL
                        yang Anda masukkan salah.
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
