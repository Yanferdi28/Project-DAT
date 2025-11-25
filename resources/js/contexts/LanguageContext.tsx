import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    id: {
        // Dashboard
        'dashboard.welcome': 'Selamat Datang Kembali!',
        'dashboard.summary': 'Berikut adalah ringkasan aktivitas Anda hari ini',
        'dashboard.totalUsers': 'Total Pengguna',
        'dashboard.verified': 'Terverifikasi',
        'dashboard.administrator': 'Administrator',
        'dashboard.recentUsers': 'Pengguna Terbaru',
        'dashboard.noUsers': 'Belum ada pengguna terdaftar',
        'dashboard.thisMonth': 'user bulan ini',
        'dashboard.emailVerified': 'Email terverifikasi',
        'dashboard.roleAdmin': 'Role admin',
        'dashboard.monthlyStats': 'Statistik Bulanan',
        'dashboard.thisMonthBtn': 'Bulan Ini',
        'dashboard.chartPlaceholder': 'Grafik akan ditampilkan di sini',
        'dashboard.justNow': 'Baru saja',
        'dashboard.minutesAgo': 'menit yang lalu',
        'dashboard.hoursAgo': 'jam yang lalu',
        'dashboard.daysAgo': 'hari yang lalu',
        
        // Auth
        'auth.loginTitle': 'Masuk ke akun Anda',
        'auth.loginDesc': 'Masukkan email dan kata sandi Anda untuk masuk',
        'auth.registerTitle': 'Buat akun baru',
        'auth.registerDesc': 'Masukkan detail Anda untuk membuat akun',
        'auth.login': 'Masuk',
        'auth.register': 'Daftar',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'nama@example.com',
        'auth.password': 'Kata Sandi',
        'auth.passwordPlaceholder': 'Masukkan kata sandi Anda',
        'auth.confirmPassword': 'Konfirmasi Kata Sandi',
        'auth.confirmPasswordPlaceholder': 'Ulangi kata sandi Anda',
        'auth.rememberMe': 'Ingat saya',
        'auth.forgotPassword': 'Lupa kata sandi?',
        'auth.loggingIn': 'Masuk...',
        'auth.signingUp': 'Mendaftar...',
        'auth.noAccount': 'Belum punya akun?',
        'auth.haveAccount': 'Sudah punya akun?',
        'auth.loginHere': 'Masuk di sini',
        'auth.registerHere': 'Daftar di sini',
        'auth.fullName': 'Nama Lengkap',
        'auth.fullNamePlaceholder': 'Masukkan nama lengkap Anda',
        
        // User Management
        'users.title': 'Manajemen Pengguna',
        'users.addUser': 'Tambah Pengguna',
        'users.createUser': 'Tambah Pengguna Baru',
        'users.editUser': 'Edit Pengguna',
        'users.fillForm': 'Isi form di bawah untuk menambahkan pengguna baru',
        'users.updateInfo': 'Perbarui informasi pengguna',
        'users.search': 'Cari pengguna...',
        'users.searchPlaceholder': 'Cari nama atau email...',
        'users.showEntries': 'Tampilkan',
        'users.entries': 'data',
        'users.filter': 'Filter',
        'users.allStatus': 'Semua Status',
        'users.verified': 'Terverifikasi',
        'users.unverified': 'Belum Verifikasi',
        'users.no': 'No',
        'users.name': 'Nama',
        'users.email': 'Email',
        'users.role': 'Role',
        'users.status': 'Status',
        'users.registered': 'Terdaftar',
        'users.actions': 'Aksi',
        'users.noData': 'Tidak ada data pengguna',
        'users.verify': 'Verifikasi',
        'users.unverify': 'Batalkan Verifikasi',
        'users.edit': 'Edit',
        'users.delete': 'Hapus',
        'users.previous': 'Sebelumnya',
        'users.next': 'Selanjutnya',
        'users.showing': 'Menampilkan',
        'users.of': 'dari',
        'users.total': 'Total',
        'users.totalRegistered': 'pengguna terdaftar',
        'users.page': 'Halaman',
        'users.reset': 'Reset',
        'users.searchBtn': 'Cari',
        'users.admin': 'Admin',
        'users.user': 'User',
        'users.deleteTitle': 'Konfirmasi Hapus Pengguna',
        'users.deleteMessage': 'Apakah Anda yakin ingin menghapus pengguna',
        'users.deleteWarning': 'Tindakan ini tidak dapat dibatalkan.',
        'users.deleting': 'Menghapus...',
        'users.verifyTitle': 'Verifikasi Email Pengguna',
        'users.unverifyTitle': 'Batalkan Verifikasi Email',
        'users.verifyMessage': 'Apakah Anda yakin ingin memverifikasi email pengguna',
        'users.verifyNote': 'Pengguna akan ditandai sebagai terverifikasi.',
        'users.unverifyMessage': 'Apakah Anda yakin ingin membatalkan verifikasi email pengguna',
        'users.unverifyNote': 'Pengguna akan ditandai sebagai belum terverifikasi.',
        'users.processing': 'Memproses...',
        
        // User Form
        'users.form.fullName': 'Nama Lengkap',
        'users.form.enterName': 'Masukkan nama lengkap',
        'users.form.password': 'Password',
        'users.form.minChars': 'Minimal 8 karakter',
        'users.form.confirmPassword': 'Konfirmasi Password',
        'users.form.repeatPassword': 'Ulangi password',
        'users.form.newPassword': 'Password Baru',
        'users.form.leaveEmpty': 'Kosongkan jika tidak ingin mengubah',
        'users.form.confirmNewPassword': 'Konfirmasi Password Baru',
        'users.form.repeatNewPassword': 'Ulangi password baru',
        'users.form.minCharsNote': 'Minimal 8 karakter jika ingin mengubah password',
        'users.form.userInfo': 'Informasi Pengguna',
        'users.form.emailVerified': '✓ Email Terverifikasi',
        'users.form.notVerified': '⚠ Belum Verifikasi',
        'users.form.registeredOn': 'Terdaftar:',
        'users.form.roleUser': 'User',
        'users.form.roleAdmin': 'Admin',
        'users.form.roleDescription': 'User: Akses terbatas | Admin: Akses penuh',
        'users.form.saving': 'Menyimpan...',
        'users.form.saveUser': 'Simpan Pengguna',
        'users.form.saveChanges': 'Simpan Perubahan',
        'users.form.cancel': 'Batal',
        'users.form.back': 'Kembali',
        
        // Profile
        'profile.title': 'Profil Saya',
        'profile.editProfile': 'Edit Profil',
        'profile.updateInfo': 'Perbarui informasi profil dan foto Anda',
        'profile.avatar': 'Foto Profil',
        'profile.changePhoto': 'Ubah Foto',
        'profile.removePhoto': 'Hapus Foto',
        'profile.maxSize': 'Maksimal 2MB (JPG, PNG)',
        'profile.accountInfo': 'Informasi Akun',
        'profile.security': 'Keamanan',
        'profile.changePassword': 'Ubah Password',
        'profile.currentPassword': 'Password Saat Ini',
        'profile.enterCurrentPassword': 'Masukkan password saat ini',
        'profile.leaveEmpty': 'Kosongkan jika tidak ingin mengubah password',
        
        // Common
        'common.logout': 'Keluar',
        'common.loading': 'Memuat...',
        'common.save': 'Simpan',
        'common.cancel': 'Batal',
        'common.delete': 'Hapus',
        'common.edit': 'Edit',
        'common.close': 'Tutup',
        'common.confirm': 'Konfirmasi',
        'common.yes': 'Ya',
        'common.no': 'Tidak',
        
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.userManagement': 'Manajemen Pengguna',
        'nav.repository': 'Repositori',
        'nav.documentation': 'Dokumentasi',
    },
    en: {
        // Dashboard
        'dashboard.welcome': 'Welcome Back!',
        'dashboard.summary': 'Here is your activity summary for today',
        'dashboard.totalUsers': 'Total Users',
        'dashboard.verified': 'Verified',
        'dashboard.administrator': 'Administrator',
        'dashboard.recentUsers': 'Recent Users',
        'dashboard.noUsers': 'No users registered yet',
        'dashboard.thisMonth': 'users this month',
        'dashboard.emailVerified': 'Email verified',
        'dashboard.roleAdmin': 'Admin role',
        'dashboard.monthlyStats': 'Monthly Statistics',
        'dashboard.thisMonthBtn': 'This Month',
        'dashboard.chartPlaceholder': 'Chart will be displayed here',
        'dashboard.justNow': 'Just now',
        'dashboard.minutesAgo': 'minutes ago',
        'dashboard.hoursAgo': 'hours ago',
        'dashboard.daysAgo': 'days ago',
        
        // Auth
        'auth.loginTitle': 'Login to your account',
        'auth.loginDesc': 'Enter your email and password to login',
        'auth.registerTitle': 'Create new account',
        'auth.registerDesc': 'Enter your details to create an account',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'name@example.com',
        'auth.password': 'Password',
        'auth.passwordPlaceholder': 'Enter your password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.confirmPasswordPlaceholder': 'Repeat your password',
        'auth.rememberMe': 'Remember me',
        'auth.forgotPassword': 'Forgot password?',
        'auth.loggingIn': 'Logging in...',
        'auth.signingUp': 'Signing up...',
        'auth.noAccount': 'Don\'t have an account?',
        'auth.haveAccount': 'Already have an account?',
        'auth.loginHere': 'Login here',
        'auth.registerHere': 'Register here',
        'auth.fullName': 'Full Name',
        'auth.fullNamePlaceholder': 'Enter your full name',
        
        // User Management
        'users.title': 'User Management',
        'users.addUser': 'Add User',
        'users.createUser': 'Create New User',
        'users.editUser': 'Edit User',
        'users.fillForm': 'Fill the form below to add a new user',
        'users.updateInfo': 'Update user information',
        'users.search': 'Search users...',
        'users.searchPlaceholder': 'Search name or email...',
        'users.showEntries': 'Show',
        'users.entries': 'entries',
        'users.filter': 'Filter',
        'users.allStatus': 'All Status',
        'users.verified': 'Verified',
        'users.unverified': 'Unverified',
        'users.no': 'No',
        'users.name': 'Name',
        'users.email': 'Email',
        'users.role': 'Role',
        'users.status': 'Status',
        'users.registered': 'Registered',
        'users.actions': 'Actions',
        'users.noData': 'No user data',
        'users.verify': 'Verify',
        'users.unverify': 'Unverify',
        'users.edit': 'Edit',
        'users.delete': 'Delete',
        'users.previous': 'Previous',
        'users.next': 'Next',
        'users.showing': 'Showing',
        'users.of': 'of',
        'users.total': 'Total',
        'users.totalRegistered': 'registered users',
        'users.page': 'Page',
        'users.reset': 'Reset',
        'users.searchBtn': 'Search',
        'users.admin': 'Admin',
        'users.user': 'User',
        'users.deleteTitle': 'Confirm Delete User',
        'users.deleteMessage': 'Are you sure you want to delete user',
        'users.deleteWarning': 'This action cannot be undone.',
        'users.deleting': 'Deleting...',
        'users.verifyTitle': 'Verify User Email',
        'users.unverifyTitle': 'Unverify Email',
        'users.verifyMessage': 'Are you sure you want to verify email for user',
        'users.verifyNote': 'User will be marked as verified.',
        'users.unverifyMessage': 'Are you sure you want to unverify email for user',
        'users.unverifyNote': 'User will be marked as unverified.',
        'users.processing': 'Processing...',
        
        // User Form
        'users.form.fullName': 'Full Name',
        'users.form.enterName': 'Enter full name',
        'users.form.password': 'Password',
        'users.form.minChars': 'Minimum 8 characters',
        'users.form.confirmPassword': 'Confirm Password',
        'users.form.repeatPassword': 'Repeat password',
        'users.form.newPassword': 'New Password',
        'users.form.leaveEmpty': 'Leave empty if you don\'t want to change',
        'users.form.confirmNewPassword': 'Confirm New Password',
        'users.form.repeatNewPassword': 'Repeat new password',
        'users.form.minCharsNote': 'Minimum 8 characters if you want to change password',
        'users.form.userInfo': 'User Information',
        'users.form.emailVerified': '✓ Email Verified',
        'users.form.notVerified': '⚠ Not Verified',
        'users.form.registeredOn': 'Registered:',
        'users.form.roleUser': 'User',
        'users.form.roleAdmin': 'Admin',
        'users.form.roleDescription': 'User: Limited access | Admin: Full access',
        'users.form.saving': 'Saving...',
        'users.form.saveUser': 'Save User',
        'users.form.saveChanges': 'Save Changes',
        'users.form.cancel': 'Cancel',
        'users.form.back': 'Back',
        
        // Profile
        'profile.title': 'My Profile',
        'profile.editProfile': 'Edit Profile',
        'profile.updateInfo': 'Update your profile information and photo',
        'profile.avatar': 'Profile Photo',
        'profile.changePhoto': 'Change Photo',
        'profile.removePhoto': 'Remove Photo',
        'profile.maxSize': 'Max 2MB (JPG, PNG)',
        'profile.accountInfo': 'Account Information',
        'profile.security': 'Security',
        'profile.changePassword': 'Change Password',
        'profile.currentPassword': 'Current Password',
        'profile.enterCurrentPassword': 'Enter current password',
        'profile.leaveEmpty': 'Leave empty if you don\'t want to change password',
        
        // Common
        'common.logout': 'Logout',
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.userManagement': 'User Management',
        'nav.repository': 'Repository',
        'nav.documentation': 'Documentation',
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('language');
        return (stored === 'id' || stored === 'en') ? stored : 'id';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        const dict = translations[language] as Record<string, string>;
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
