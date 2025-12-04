import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import * as usersRoutes from '@/routes/users';
import { useLanguage } from '@/contexts/LanguageContext';

interface Errors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: string;
    unit_pengolah_id?: string;
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface Props {
    errors?: Errors;
    unitPengolahs: UnitPengolah[];
}

export default function CreateUser({ errors, unitPengolahs }: Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        unit_pengolah_id: '',
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
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('nav.userManagement'), href: usersRoutes.index().url },
                { title: t('users.addUser'), href: usersRoutes.create().url },
            ]}
        >
            <div>
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <Link href={usersRoutes.index().url}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('users.form.back')}
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('users.createUser')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('users.fillForm')}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {t('users.form.fullName')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('users.form.enterName')}
                                className={errors?.name ? 'border-red-500' : ''}
                                required
                            />
                            {errors?.name && <InputError message={errors.name} />}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                {t('users.email')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('auth.emailPlaceholder')}
                                className={errors?.email ? 'border-red-500' : ''}
                                required
                            />
                            {errors?.email && <InputError message={errors.email} />}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                {t('users.role')} <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleSelectChange}
                                className="flex h-9 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-1 text-sm shadow-sm transition-colors text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                                required
                            >
                                <option value="user">{t('users.user')}</option>
                                <option value="operator">{t('users.operator')}</option>
                                <option value="management">{t('users.management')}</option>
                                <option value="admin">{t('users.admin')}</option>
                            </select>
                            {errors?.role && <InputError message={errors.role} />}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('users.form.roleDescription')}
                            </p>
                        </div>

                        {/* Unit Pengolah */}
                        <div className="space-y-2">
                            <Label htmlFor="unit_pengolah_id">
                                {t('users.unitPengolah')}
                            </Label>
                            <select
                                id="unit_pengolah_id"
                                name="unit_pengolah_id"
                                value={formData.unit_pengolah_id}
                                onChange={handleSelectChange}
                                className="flex h-9 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-1 text-sm shadow-sm transition-colors text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="">{t('users.selectUnitPengolah')}</option>
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                            {errors?.unit_pengolah_id && <InputError message={errors.unit_pengolah_id} />}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Unit pengolah tempat user bekerja (opsional)
                            </p>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t('users.form.password')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t('users.form.minChars')}
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
                                {t('users.form.confirmPassword')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder={t('users.form.repeatPassword')}
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
                                {isSubmitting ? t('users.form.saving') : t('users.form.saveUser')}
                            </Button>
                            <Link href={usersRoutes.index().url}>
                                <Button type="button" variant="outline" disabled={isSubmitting}>
                                    {t('users.form.cancel')}
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
