import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import * as usersRoutes from '@/routes/users';

interface Errors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: string;
}

interface Props {
    errors?: Errors;
}

export default function CreateUser({ errors }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(usersRoutes.store().url, formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Manajemen Pengguna', href: usersRoutes.index().url },
                { title: 'Tambah Pengguna', href: usersRoutes.create().url },
            ]}
        >
            <div>
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <Link href={usersRoutes.index().url}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Tambah Pengguna Baru
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Isi form di bawah untuk menambahkan pengguna baru
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Masukkan nama lengkap"
                                className={errors?.name ? 'border-red-500' : ''}
                                required
                            />
                            {errors?.name && <InputError message={errors.name} />}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@example.com"
                                className={errors?.email ? 'border-red-500' : ''}
                                required
                            />
                            {errors?.email && <InputError message={errors.email} />}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleSelectChange}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors?.role && <InputError message={errors.role} />}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                User: Akses terbatas | Admin: Akses penuh
                            </p>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimal 8 karakter"
                                    className={errors?.password ? 'border-red-500 pr-10' : 'pr-10'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors?.password && <InputError message={errors.password} />}
                        </div>

                        {/* Password Confirmation */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                    className={
                                        errors?.password_confirmation
                                            ? 'border-red-500 pr-10'
                                            : 'pr-10'
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordConfirmation(!showPasswordConfirmation)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors?.password_confirmation && (
                                <InputError message={errors.password_confirmation} />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                            <Link href={usersRoutes.index().url}>
                                <Button type="button" variant="outline" disabled={isSubmitting}>
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
