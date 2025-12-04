import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store as loginStore } from '@/routes/login';
import { store as registerStore } from '@/routes/register';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import TextLink from '@/components/text-link';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/contexts/LanguageContext';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    defaultMode?: 'login' | 'register';
}

export default function Auth({
    status,
    canResetPassword,
    canRegister,
    defaultMode = 'login',
}: AuthProps) {
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        // Reset password visibility when switching modes
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const toggleTheme = () => {
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const isLogin = mode === 'login';
    const isRegister = mode === 'register';
    const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <AuthLayout
            title={isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            description={
                isLogin
                    ? t('auth.loginDesc')
                    : t('auth.registerDesc')
            }
        >
            <Head title={isLogin ? t('auth.login') : t('auth.register')} />

            {/* Theme Toggle Button */}
            <div className="mb-4 flex justify-end">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="group rounded-xl border border-gray-200/50 bg-white/50 p-2.5 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:border-purple-300 hover:bg-white/80 hover:shadow-purple-200/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-gray-800/80 dark:hover:shadow-purple-900/30"
                    aria-label="Toggle theme"
                >
                    <AnimatePresence mode="wait">
                        {isDarkMode ? (
                            <motion.div
                                key="sun"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sun className="h-5 w-5 text-amber-500 transition-transform group-hover:scale-110" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="moon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Moon className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Toggle Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl border border-gray-200/50 bg-gray-50/50 p-1.5 shadow-inner dark:border-gray-700/50 dark:bg-gray-800/50">
                <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        isLogin
                            ? 'bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/30'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {t('auth.login')}
                </button>
                <button
                    type="button"
                    onClick={() => setMode('register')}
                    disabled={!canRegister}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        isRegister
                            ? 'bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/30'
                            : 'text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {t('auth.register')}
                </button>
            </div>

            <div className="relative min-h-[420px] overflow-hidden">
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <Form
                                {...loginStore.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    {t('auth.email')}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder={t('auth.emailPlaceholder')}
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">
                                                        {t('auth.password')}
                                                    </Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-sm"
                                                            tabIndex={5}
                                                        >
                                                            {t('auth.forgotPassword')}
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        required
                                                        tabIndex={2}
                                                        autoComplete="current-password"
                                                        placeholder={t('auth.passwordPlaceholder')}
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                />
                                                <Label htmlFor="remember">
                                                    {t('auth.rememberMe')}
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-4 w-full bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/50 transition-all hover:bg-[#0055AA] hover:shadow-xl hover:shadow-[#0066CC]/50 hover:scale-[1.02] active:scale-[0.98]"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                {processing ? t('auth.loggingIn') : t('auth.login')}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>

                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700 shadow-sm dark:border-green-800/50 dark:bg-green-900/30 dark:text-green-400"
                                >
                                    {status}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <Form
                                {...registerStore.form()}
                                resetOnSuccess={['password', 'password_confirmation']}
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">{t('auth.fullName')}</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    name="name"
                                                    placeholder={t('auth.fullNamePlaceholder')}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    {t('auth.email')}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder={t('auth.emailPlaceholder')}
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">
                                                    {t('auth.password')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        tabIndex={3}
                                                        autoComplete="new-password"
                                                        name="password"
                                                        placeholder={t('auth.passwordPlaceholder')}
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">
                                                    {t('auth.confirmPassword')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        required
                                                        tabIndex={4}
                                                        autoComplete="new-password"
                                                        name="password_confirmation"
                                                        placeholder={t('auth.confirmPasswordPlaceholder')}
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.password_confirmation
                                                    }
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-2 w-full bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/50 transition-all hover:bg-[#0055AA] hover:shadow-xl hover:shadow-[#0066CC]/50 hover:scale-[1.02] active:scale-[0.98]"
                                                tabIndex={5}
                                                data-test="register-user-button"
                                            >
                                                {processing && <Spinner />}
                                                {processing ? t('auth.signingUp') : t('auth.register')}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
