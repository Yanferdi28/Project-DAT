// Components
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { Head } from '@inertiajs/react';
import { Clock, Mail, ShieldCheck } from 'lucide-react';

export default function VerificationPending() {
    return (
        <AuthLayout
            title="Menunggu Verifikasi"
            description="Akun Anda sedang menunggu verifikasi dari administrator."
        >
            <Head title="Menunggu Verifikasi" />

            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
                        <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Pendaftaran Berhasil!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Akun Anda telah berhasil dibuat. Silakan tunggu hingga administrator memverifikasi akun Anda.
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Proses Verifikasi
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                Administrator akan meninjau dan memverifikasi akun Anda. Proses ini biasanya memakan waktu 1-2 hari kerja.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notifikasi
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Anda akan menerima notifikasi melalui email setelah akun Anda diverifikasi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <TextLink
                        href={logout()}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Keluar dan kembali ke halaman login
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
