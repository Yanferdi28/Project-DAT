# User Roles and Default Accounts

Sistem memiliki 3 level role pengguna:

## Roles

1. **Admin** - Full access ke semua fitur sistem
2. **Operator** - Akses untuk operasional data entry dan verifikasi
3. **User** - Akses terbatas untuk pengguna umum

## Default Accounts

Setelah menjalankan seeder, akun-akun berikut tersedia:

### 1. Administrator
- **Email**: admin@example.com
- **Password**: password
- **Role**: admin
- **Access**: Full system access

### 2. Operator
- **Email**: operator@example.com
- **Password**: password
- **Role**: operator
- **Access**: Data entry and operational access

### 3. Regular User
- **Email**: user@example.com
- **Password**: password
- **Role**: user
- **Access**: Basic user access

## Migration

Role enum sudah ditambahkan di migration:
```php
enum('role', ['admin', 'operator', 'user'])->default('user')
```

## Seeder

Untuk membuat ulang user accounts, jalankan:
```bash
php artisan db:seed --class=UserSeeder
```

Atau untuk fresh migration dengan semua seeders:
```bash
php artisan migrate:fresh --seed
```

## Security Note

⚠️ **PENTING**: Ganti semua password default sebelum deployment ke production!
