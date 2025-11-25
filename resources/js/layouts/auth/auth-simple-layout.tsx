import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
                {/* Animated orbs */}
                <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-400/30 blur-3xl dark:from-blue-600/20 dark:to-indigo-600/20" />
                <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl delay-1000 dark:from-purple-600/20 dark:to-pink-600/20" />
                <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl delay-500 dark:from-indigo-600/15 dark:to-purple-600/15" />
            </div>

            <div className="w-full max-w-4xl">
                {/* Single Card with Logo and Form Side by Side */}
                <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl lg:flex-row dark:border-white/10 dark:bg-gray-900/80 dark:shadow-purple-900/20">
                    {/* Logo Section - Left Side */}
                    <div className="flex items-center justify-center border-b border-gray-200/50 bg-gradient-to-br from-blue-500/5 to-purple-600/5 p-8 lg:w-2/5 lg:border-b-0 lg:border-r dark:border-gray-700/50 dark:from-blue-900/20 dark:to-purple-900/20">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-4 transition-transform hover:scale-105"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 dark:shadow-purple-500/30">
                                <AppLogoIcon className="size-12 fill-current text-white" />
                            </div>
                            <div className="text-center">
                                <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                                    Selamat Datang
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Akses akun Anda
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Form Section - Right Side */}
                    <div className="flex flex-col gap-6 p-8 lg:flex-1">
                        <div className="space-y-2 text-center">
                            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                                {title}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
