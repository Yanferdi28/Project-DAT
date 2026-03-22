import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import {
    FileText,
    Folder,
    BarChart3,
    Users,
    Shield,
    Eye,
    PenLine,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Upload,
    Download,
    HelpCircle,
    Brain,
    Printer,
    QrCode,
    Search,
    Filter,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bantuan', href: '/bantuan' },
];

interface RoleFeature {
    feature: string;
    admin: boolean;
    operator: boolean;
    user: boolean;
}

const roleFeatures: RoleFeature[] = [
    { feature: 'Melihat Dashboard & Statistik', admin: true, operator: true, user: true },
    { feature: 'Melihat Arsip Unit', admin: true, operator: true, user: true },
    { feature: 'Membuat Arsip Unit', admin: true, operator: false, user: true },
    { feature: 'Mengedit Arsip Unit', admin: true, operator: false, user: true },
    { feature: 'Menghapus Arsip Unit', admin: true, operator: false, user: false },
    { feature: 'Verifikasi Arsip (Terima/Tolak)', admin: true, operator: true, user: false },
    { feature: 'Publish/Unpublish Arsip', admin: true, operator: true, user: false },
    { feature: 'Melihat Berkas Arsip', admin: true, operator: true, user: true },
    { feature: 'Membuat Berkas Arsip', admin: true, operator: false, user: true },
    { feature: 'Mengedit Berkas Arsip', admin: true, operator: false, user: true },
    { feature: 'Menghapus Berkas Arsip', admin: true, operator: false, user: true },
    { feature: 'Export PDF Arsip & Berkas', admin: true, operator: true, user: true },
    { feature: 'Melihat Laporan', admin: true, operator: true, user: true },
    { feature: 'Rekap Unit Pengolah', admin: true, operator: false, user: false },
    { feature: 'Berita Acara Penyerahan', admin: true, operator: true, user: true },
    { feature: 'Manajemen Pengguna', admin: true, operator: false, user: false },
    { feature: 'Master Data (Klasifikasi, dll)', admin: true, operator: false, user: false },
    { feature: 'Activity Log', admin: true, operator: false, user: false },
    { feature: 'OCR & AI Suggestion', admin: true, operator: true, user: true },
];

export default function BantuanIndex() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role ?? 'user';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bantuan" />
            <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                        <HelpCircle className="h-7 w-7 text-blue-600" />
                        Panduan Penggunaan Sistem
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Sistem Pengelolaan Arsip Digital — LPP RRI Banjarmasin
                    </p>
                </div>

                {/* Quick Start */}
                <section className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
                    <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-200">
                        Selamat datang, {auth.user?.name}!
                    </h2>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Anda masuk sebagai <strong className="capitalize">{userRole}</strong>. Berikut adalah panduan
                        singkat untuk membantu Anda menggunakan sistem ini secara efektif.
                    </p>
                </section>

                {/* Alur Kerja */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Alur Kerja Pengelolaan Arsip
                    </h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <StepCard
                            step={1}
                            icon={<Upload className="h-6 w-6" />}
                            title="Input Arsip Unit"
                            description="Admin atau User membuat arsip unit baru. Unggah dokumen dan isi metadata."
                            color="blue"
                        />
                        <StepCard
                            step={2}
                            icon={<CheckCircle className="h-6 w-6" />}
                            title="Verifikasi"
                            description="Operator atau Admin memverifikasi arsip: menerima, menolak, atau menunggu."
                            color="amber"
                        />
                        <StepCard
                            step={3}
                            icon={<Folder className="h-6 w-6" />}
                            title="Kelola Berkas"
                            description="Arsip unit yang sudah diterima dapat dikelompokkan ke dalam Berkas Arsip."
                            color="green"
                        />
                        <StepCard
                            step={4}
                            icon={<Download className="h-6 w-6" />}
                            title="Laporan & Export"
                            description="Cetak laporan, export PDF, dan buat berita acara penyerahan."
                            color="purple"
                        />
                    </div>
                </section>

                {/* Fitur Utama */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Fitur Utama
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FeatureCard
                            icon={<FileText className="h-5 w-5 text-blue-600" />}
                            title="Arsip Unit"
                            items={[
                                'Kelola data arsip unit lengkap dengan metadata',
                                'Unggah dokumen digital (PDF, gambar, dll)',
                                'Filter berdasarkan status, klasifikasi, unit pengolah',
                                'Export ke PDF dan cetak label QR Code',
                            ]}
                        />
                        <FeatureCard
                            icon={<Folder className="h-5 w-5 text-green-600" />}
                            title="Berkas Arsip"
                            items={[
                                'Kelompokkan arsip unit ke dalam berkas',
                                'Kelola kode klasifikasi dan retensi',
                                'Tambah/hapus arsip unit dari berkas',
                                'Export daftar berkas ke PDF',
                            ]}
                        />
                        <FeatureCard
                            icon={<Brain className="h-5 w-5 text-purple-600" />}
                            title="OCR & AI"
                            items={[
                                'Scan dokumen otomatis dengan OCR',
                                'AI menyarankan kategori & sub kategori',
                                'Terima atau tolak saran AI',
                                'Lihat tingkat kepercayaan (confidence) hasil OCR',
                            ]}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-5 w-5 text-amber-600" />}
                            title="Dashboard & Laporan"
                            items={[
                                'Statistik total arsip, berkas, dan pengguna',
                                'Grafik tren bulanan dan distribusi status',
                                'Laporan penyusutan dan status verifikasi',
                                'Berita Acara Penyerahan arsip antar unit',
                            ]}
                        />
                    </div>
                </section>

                {/* Status Arsip */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Status Arsip Unit
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatusCard
                            icon={<Clock className="h-5 w-5 text-amber-500" />}
                            title="Pending"
                            description="Arsip baru dibuat dan menunggu verifikasi dari Operator/Admin."
                            color="amber"
                        />
                        <StatusCard
                            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                            title="Diterima"
                            description="Arsip telah diverifikasi dan diterima. Dapat dikelompokkan ke berkas."
                            color="green"
                        />
                        <StatusCard
                            icon={<XCircle className="h-5 w-5 text-red-500" />}
                            title="Ditolak"
                            description="Arsip ditolak oleh verifikator. Perlu diperbaiki dan disubmit ulang."
                            color="red"
                        />
                    </div>
                </section>

                {/* Role Access Matrix */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Hak Akses Berdasarkan Role
                    </h2>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                        Fitur
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                                        <span className="inline-flex items-center gap-1">
                                            <Shield className="h-3.5 w-3.5" /> Admin
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" /> Operator
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                                        <span className="inline-flex items-center gap-1">
                                            <Eye className="h-3.5 w-3.5" /> User
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {roleFeatures.map((rf, i) => (
                                    <tr
                                        key={i}
                                        className={
                                            i % 2 === 0
                                                ? 'bg-white dark:bg-gray-900'
                                                : 'bg-gray-50/50 dark:bg-gray-800/30'
                                        }
                                    >
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                            {rf.feature}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <AccessBadge allowed={rf.admin} />
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <AccessBadge allowed={rf.operator} />
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            <AccessBadge allowed={rf.user} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Tips */}
                <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                        Tips Penggunaan
                    </h2>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <Search className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            Gunakan kolom pencarian untuk menemukan arsip berdasarkan uraian informasi, indeks, atau keterangan.
                        </li>
                        <li className="flex items-start gap-2">
                            <Filter className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            Manfaatkan filter status, unit pengolah, dan tanggal untuk mempersempit hasil pencarian.
                        </li>
                        <li className="flex items-start gap-2">
                            <QrCode className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            Cetak label QR Code dari halaman detail arsip unit untuk pelabelan fisik.
                        </li>
                        <li className="flex items-start gap-2">
                            <Printer className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            Gunakan fitur Print Preview sebelum export PDF untuk melihat tampilan cetakan.
                        </li>
                        <li className="flex items-start gap-2">
                            <Brain className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            Unggah dokumen saat membuat arsip — sistem akan otomatis melakukan OCR dan memberikan saran kategori.
                        </li>
                    </ul>
                </section>
            </div>
        </AppLayout>
    );
}

/* ─── Sub-components ──────────────────────────────────── */

function StepCard({
    step,
    icon,
    title,
    description,
    color,
}: {
    step: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
        amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
        green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
        purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30',
    };
    const iconColors: Record<string, string> = {
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        green: 'text-green-600 dark:text-green-400',
        purple: 'text-purple-600 dark:text-purple-400',
    };

    return (
        <div className={`relative rounded-xl border p-4 ${colors[color]}`}>
            <div className="absolute -top-3 left-3 rounded-full bg-white px-2 text-xs font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Langkah {step}
            </div>
            <div className={`mb-2 ${iconColors[color]}`}>{icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}

function FeatureCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2">
                {icon}
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function StatusCard({
    icon,
    title,
    description,
    color,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        amber: 'border-amber-200 dark:border-amber-800',
        green: 'border-green-200 dark:border-green-800',
        red: 'border-red-200 dark:border-red-800',
    };

    return (
        <div className={`rounded-xl border bg-white p-4 dark:bg-gray-900 ${colors[color]}`}>
            <div className="mb-2 flex items-center gap-2">
                {icon}
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}

function AccessBadge({ allowed }: { allowed: boolean }) {
    return allowed ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            —
        </span>
    );
}
