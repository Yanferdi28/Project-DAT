import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Camera, Eye, EyeOff, Save, Trash2, User as UserIcon } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import * as myprofileRoutes from '@/routes/myprofile';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    user: User;
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EditProfile({ user, errors, flash }: Props) {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : null
    );
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        if (formData.password) {
            data.append('current_password', formData.current_password);
            data.append('password', formData.password);
            data.append('password_confirmation', formData.password_confirmation);
        }

        router.post(myprofileRoutes.update().url, data, {
            onFinish: () => {
                setIsSubmitting(false);
                setFormData({
                    ...formData,
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
        });
    };

    const handleDeleteAvatar = () => {
        if (confirm(t('profile.confirmDelete'))) {
            router.delete('/my-profile/avatar');
            setAvatarPreview(null);
            setAvatarFile(null);
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('profile.title'), href: myprofileRoutes.edit().url },
            ]}
        >
            <div>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('profile.title')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('profile.manageProfile')}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 shadow-lg transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('profile.maxSize')}
                                </p>
                                {avatarPreview && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeleteAvatar}
                                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {t('profile.removePhoto')}
                                    </Button>
                                )}
                            </div>
                            <InputError message={errors?.avatar} />
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.personalInfo')}
                            </h3>

                            <div>
                                <Label htmlFor="name">{t('users.form.fullName')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <InputError message={errors?.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">{t('users.email')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <InputError message={errors?.email} />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('profile.changePasswordOptional')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('profile.leaveEmpty')}
                            </p>

                            <div>
                                <Label htmlFor="current_password">{t('profile.currentPassword')}</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        name="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors?.current_password} />
                            </div>

                            <div>
                                <Label htmlFor="password">{t('users.form.newPassword')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors?.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">{t('users.form.confirmNewPassword')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('profile.accountInfo')}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                    <span className="font-medium">{t('users.status')}:</span>{' '}
                                    {user.email_verified_at ? (
                                        <span className="text-green-600 dark:text-green-400">{t('users.form.emailVerified')}</span>
                                    ) : (
                                        <span className="text-yellow-600 dark:text-yellow-400">{t('users.form.notVerified')}</span>
                                    )}
                                </p>
                                <p>
                                    <span className="font-medium">{t('users.form.registeredOn')}</span>{' '}
                                    {new Date(user.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? t('users.form.saving') : t('users.form.saveChanges')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
