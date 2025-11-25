import { AppSidebar } from '@/components/app-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const { language, setLanguage } = useLanguage();
    
    const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => {
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'id' ? 'en' : 'id');
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar 
                isMobileOpen={isMobileOpen} 
                setIsMobileOpen={setIsMobileOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className={`flex-1 transition-all duration-300 w-full ${
                isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
            }`}>
                {/* Header with Theme Toggle */}
                <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
                        <div className="flex-1">
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    {breadcrumbs.map((crumb, index) => (
                                        <div key={index} className="flex items-center">
                                            {index > 0 && <span className="mx-1 md:mx-2">/</span>}
                                            <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : ''}>
                                                {crumb.title}
                                            </span>
                                        </div>
                                    ))}
                                </nav>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={toggleLanguage}
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 font-semibold"
                                title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                            >
                                {language === 'id' ? 'EN' : 'ID'}
                            </Button>
                            <Button
                                onClick={toggleTheme}
                                variant="outline"
                                size="sm"
                                className="rounded-full p-2 h-9 w-9"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
