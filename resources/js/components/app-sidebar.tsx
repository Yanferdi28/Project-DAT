import { dashboard } from '@/routes';
import * as usersRoutes from '@/routes/users';
import * as myprofileRoutes from '@/routes/myprofile';
import { type NavItem } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronRight, Folder, LayoutGrid, LogOut, User, Users, UserCog, FileText, ClipboardList, CalendarClock, FileCheck, FileSignature, Building2 } from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLogoIcon from './app-logo-icon';

interface AppSidebarProps {
    isMobileOpen?: boolean;
    setIsMobileOpen?: (open: boolean) => void;
    isCollapsed?: boolean;
    setIsCollapsed?: (collapsed: boolean) => void;
}

export function AppSidebar({ 
    isMobileOpen: externalMobileOpen, 
    setIsMobileOpen: externalSetMobileOpen,
    isCollapsed: externalIsCollapsed,
    setIsCollapsed: externalSetIsCollapsed
}: AppSidebarProps = {}) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const { t } = useLanguage();
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [internalMobileOpen, setInternalMobileOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMasterOpen, setIsMasterOpen] = useState(false);
    const [isLaporanOpen, setIsLaporanOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const mainNavItems: NavItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('nav.arsipUnit'),
            href: '/arsip-unit',
            icon: FileText,
        },
        {
            title: t('nav.berkasArsip'),
            href: '/berkas-arsip',
            icon: Folder,
        },
    ];

    const masterSubItems = [
        {
            title: t('nav.userManagement'),
            href: usersRoutes.index().url,
        },
        {
            title: t('nav.kodeKlasifikasi'),
            href: '/kode-klasifikasi',
        },
        {
            title: t('nav.unitPengolah'),
            href: '/unit-pengolah',
        },
        {
            title: t('nav.kategori'),
            href: '/kategori',
        },
        {
            title: t('nav.subKategori'),
            href: '/sub-kategori',
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('nav.repository'),
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: t('nav.documentation'),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    const isMobileOpen = externalMobileOpen ?? internalMobileOpen;
    const setIsMobileOpen = externalSetMobileOpen ?? setInternalMobileOpen;
    const isCollapsed = externalIsCollapsed ?? internalCollapsed;
    const setIsCollapsed = externalSetIsCollapsed ?? setInternalCollapsed;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (href: string) => {
        return page.url.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed left-4 top-4 z-50 rounded-xl bg-blue-600 p-2.5 text-white shadow-xl transition-all hover:bg-blue-700 md:hidden"
                aria-label="Toggle menu"
            >
                <svg className="h-6 w-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Overlay for mobile */}
            <div
                className={'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ' + (isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <aside className={'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out ' + (isCollapsed ? 'w-16' : 'w-64') + ' ' + (isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0') + ' bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800'}>
                {/* Removed gradient overlay */}
            
            <div className="relative flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200/50 px-4 dark:border-gray-800/50">
                    <Link 
                        href={dashboard()} 
                        className="flex items-center gap-3 transition-transform hover:scale-105"
                    >
                        <div className="flex items-center justify-center">
                            <AppLogoIcon className={isCollapsed ? 'h-8 w-auto object-contain' : 'h-10 w-auto object-contain'} />
                        </div>
                    </Link>
                    
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-lg p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <svg
                            className={'h-4 w-4 transition-transform ' + (isCollapsed ? 'rotate-180' : '')}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        <p className={'mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 ' + (isCollapsed ? 'text-center' : 'px-3')}>
                            {isCollapsed ? '•' : 'Menu'}
                        </p>
                        {mainNavItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className={'group flex items-center gap-3 rounded-lg px-3 py-2 transition-all ' + (active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800') + ' ' + (isCollapsed ? 'justify-center' : '')}
                                    >
                                        {item.icon && (
                                            <item.icon className={'h-5 w-5 transition-transform group-hover:scale-110 ' + (active ? 'text-white' : '')} />
                                        )}
                                        {!isCollapsed && (
                                            <span className={'font-medium ' + (active ? 'text-white' : '')}>
                                                {item.title}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        
                        {/* Master Menu (Admin Only) */}
                        {auth.user?.role === 'admin' && (
                            <div>
                                <button
                                    onClick={() => setIsMasterOpen(!isMasterOpen)}
                                    className={'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ' + (isCollapsed ? 'justify-center' : '')}
                                >
                                    <FileText className="h-5 w-5 transition-transform group-hover:scale-110" />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 font-medium text-left">{t('nav.master')}</span>
                                            <ChevronRight className={'h-4 w-4 transition-transform ' + (isMasterOpen ? 'rotate-90' : '')} />
                                        </>
                                    )}
                                </button>
                                
                                {/* Submenu */}
                                {!isCollapsed && isMasterOpen && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {masterSubItems.map((subItem) => {
                                            const active = isActive(subItem.href);
                                            return (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.href}
                                                    className={'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ' + (active ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {subItem.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Laporan Menu */}
                        <div>
                            <button
                                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                                className={'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ' + (isCollapsed ? 'justify-center' : '')}
                            >
                                <ClipboardList className="h-5 w-5 transition-transform group-hover:scale-110" />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 font-medium text-left">{t('nav.laporan')}</span>
                                        <ChevronRight className={'h-4 w-4 transition-transform ' + (isLaporanOpen ? 'rotate-90' : '')} />
                                    </>
                                )}
                            </button>
                            
                            {/* Laporan Submenu */}
                            {!isCollapsed && isLaporanOpen && (
                                <div className="ml-8 mt-1 space-y-1">
                                    <Link
                                        href="/laporan/rekap-unit-pengolah"
                                        className={'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ' + (isActive('/laporan/rekap-unit-pengolah') ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}
                                    >
                                        <Building2 className="h-3.5 w-3.5" />
                                        {t('nav.rekapUnitPengolah')}
                                    </Link>
                                    <Link
                                        href="/laporan/penyusutan"
                                        className={'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ' + (isActive('/laporan/penyusutan') ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}
                                    >
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        {t('nav.penyusutan')}
                                    </Link>
                                    <Link
                                        href="/laporan/status-verifikasi"
                                        className={'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ' + (isActive('/laporan/status-verifikasi') ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}
                                    >
                                        <FileCheck className="h-3.5 w-3.5" />
                                        {t('nav.statusVerifikasi')}
                                    </Link>
                                    <Link
                                        href="/laporan/berita-acara-penyerahan"
                                        className={'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ' + (isActive('/laporan/berita-acara-penyerahan') ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')}
                                    >
                                        <FileSignature className="h-3.5 w-3.5" />
                                        {t('nav.beritaAcaraPenyerahan')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200/50 p-3 dark:border-gray-800/50">
                    {/* Footer Links */}
                    <div className="mb-3 space-y-1">
                        {footerNavItems.map((item) => (
                            <a
                                key={item.title}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ' + (isCollapsed ? 'justify-center' : '')}
                            >
                                {item.icon && (
                                    <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                )}
                                {!isCollapsed && <span>{item.title}</span>}
                            </a>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className={'w-full rounded-lg bg-white/40 p-2 backdrop-blur-sm dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors ' + (isCollapsed ? 'flex justify-center' : '')}
                        >
                            <div className="flex items-center gap-2">
                                {auth.user?.avatar ? (
                                    <img
                                        src={`/storage/${auth.user.avatar}`}
                                        alt={auth.user.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {auth.user?.name || 'Pengguna'}
                                            </p>
                                            <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                                                {auth.user?.email}
                                            </p>
                                        </div>
                                        <ChevronDown className={'h-4 w-4 text-gray-500 transition-transform ' + (isProfileMenuOpen ? 'rotate-180' : '')} />
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && !isCollapsed && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <Link
                                    href={myprofileRoutes.edit().url}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <UserCog className="h-4 w-4" />
                                    <span>{t('profile.editProfile')}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>{t('common.logout')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
}
