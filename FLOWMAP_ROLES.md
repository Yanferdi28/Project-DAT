# Flowmap Role - Sistem Arsip Digital (Project-DAT)

Dokumen ini menjelaskan alur kerja (flowmap) berdasarkan role pengguna dalam sistem manajemen arsip digital.

---

## 📊 Diagram Hierarki Role

```
                    ┌─────────────────┐
                    │      ADMIN      │
                    │ (Full Access)   │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
    ┌───────────────┐                 ┌───────────────┐
    │   OPERATOR    │                 │     USER      │
    │ (Data Entry)  │                 │(Basic Access) │
    └───────────────┘                 └───────────────┘
```

---

## 🔐 Deskripsi Role

### 1. **ADMIN** (Administrator)
- **Level**: Tertinggi
- **Akses**: Full system access
- **Email Default**: admin@example.com

### 2. **OPERATOR** (Operator)
- **Level**: Menengah
- **Akses**: Data entry & operasional
- **Email Default**: operator@example.com

### 3. **USER** (Pengguna Umum)
- **Level**: Dasar
- **Akses**: Basic access (create & view arsip)
- **Email Default**: user@example.com

---

## 📋 Flowmap Akses Fitur Berdasarkan Role

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              FLOWMAP AKSES SISTEM                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│    ┌──────────────┐                                                                      │
│    │    LOGIN     │                                                                      │
│    └──────┬───────┘                                                                      │
│           │                                                                              │
│           ▼                                                                              │
│    ┌──────────────┐                                                                      │
│    │  DASHBOARD   │ ◄─────── Semua Role                                                 │
│    └──────┬───────┘                                                                      │
│           │                                                                              │
│           ▼                                                                              │
│    ┌──────────────────────────────────────────────────────────────────────────────┐     │
│    │                         MENU UTAMA                                            │     │
│    ├──────────────────────────────────────────────────────────────────────────────┤     │
│    │                                                                               │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │   ARSIP UNIT    │    │  BERKAS ARSIP   │    │    LAPORAN      │           │     │
│    │  │ [All Roles]     │    │ [All Roles]     │    │  [All Roles]    │           │     │
│    │  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘           │     │
│    │           │                      │                      │                     │     │
│    │           ▼                      ▼                      ▼                     │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │ • View          │    │ • View          │    │ • Penyusutan    │           │     │
│    │  │ • Create*       │    │ • Create*       │    │ • Status        │           │     │
│    │  │ • Edit*         │    │ • Edit*         │    │   Verifikasi    │           │     │
│    │  │ • Delete*       │    │ • Delete*       │    │ • Berita Acara  │           │     │
│    │  │ • Export PDF    │    │ • Export PDF    │    │ • Rekap Unit    │           │     │
│    │  │                 │    │ • Add Arsip     │    │   Pengolah      │           │     │
│    │  │ *Admin & User   │    │   Unit*         │    │                 │           │     │
│    │  │  only           │    │                 │    │                 │           │     │
│    │  └─────────────────┘    └─────────────────┘    └─────────────────┘           │     │
│    │                                                                               │     │
│    │  ┌─────────────────┐    ┌─────────────────┐                                  │     │
│    │  │  VERIFIKASI     │    │     MASTER      │                                  │     │
│    │  │ [Operator/Admin]│    │   [Admin Only]  │                                  │     │
│    │  └────────┬────────┘    └────────┬────────┘                                  │     │
│    │           │                      │                                            │     │
│    │           ▼                      ▼                                            │     │
│    │  ┌─────────────────┐    ┌─────────────────┐                                  │     │
│    │  │ • Update Status │    │ • Users CRUD    │                                  │     │
│    │  │   (pending/     │    │ • Kode          │                                  │     │
│    │  │   diterima/     │    │   Klasifikasi   │                                  │     │
│    │  │   ditolak)      │    │ • Unit Pengolah │                                  │     │
│    │  │ • Update Publish│    │ • Kategori      │                                  │     │
│    │  │   Status        │    │ • Sub Kategori  │                                  │     │
│    │  │ • Assign to     │    │ • Verify/       │                                  │     │
│    │  │   Berkas        │    │   Unverify User │                                  │     │
│    │  └─────────────────┘    └─────────────────┘                                  │     │
│    │                                                                               │     │
│    │  ┌─────────────────┐                                                         │     │
│    │  │    PROFILE      │                                                         │     │
│    │  │  [All Roles]    │                                                         │     │
│    │  └────────┬────────┘                                                         │     │
│    │           │                                                                   │     │
│    │           ▼                                                                   │     │
│    │  ┌─────────────────┐                                                         │     │
│    │  │ • View Profile  │                                                         │     │
│    │  │ • Edit Profile  │                                                         │     │
│    │  │ • Delete Avatar │                                                         │     │
│    │  └─────────────────┘                                                         │     │
│    └──────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flowmap Proses Arsip Unit

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         ALUR PROSES ARSIP UNIT                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌───────────┐                                                                          │
│   │   USER    │                                                                          │
│   │  / ADMIN  │                                                                          │
│   └─────┬─────┘                                                                          │
│         │                                                                                │
│         ▼                                                                                │
│   ┌───────────────────┐                                                                  │
│   │  CREATE ARSIP     │                                                                  │
│   │  UNIT             │                                                                  │
│   │  • Upload Dokumen │                                                                  │
│   │  • Input Data     │                                                                  │
│   └─────────┬─────────┘                                                                  │
│             │                                                                            │
│             ▼                                                                            │
│   ┌───────────────────┐                                                                  │
│   │  STATUS: PENDING  │                                                                  │
│   │  PUBLISH: DRAFT   │                                                                  │
│   └─────────┬─────────┘                                                                  │
│             │                                                                            │
│             ▼                                                                            │
│   ┌───────────────────┐                                                                  │
│   │   OPERATOR/ADMIN  │                                                                  │
│   │   VERIFIKASI      │                                                                  │
│   └─────────┬─────────┘                                                                  │
│             │                                                                            │
│       ┌─────┴─────┐                                                                      │
│       ▼           ▼                                                                      │
│ ┌──────────┐ ┌──────────┐                                                                │
│ │ DITERIMA │ │ DITOLAK  │                                                                │
│ └────┬─────┘ └────┬─────┘                                                                │
│      │            │                                                                      │
│      ▼            ▼                                                                      │
│ ┌──────────┐ ┌──────────┐                                                                │
│ │ Assign   │ │ Revisi   │                                                                │
│ │ ke Berkas│ │ oleh     │                                                                │
│ │ Arsip    │ │ User     │                                                                │
│ └────┬─────┘ └────┬─────┘                                                                │
│      │            │                                                                      │
│      ▼            └───────────────────────────┐                                          │
│ ┌──────────┐                                  │                                          │
│ │ Update   │                                  │                                          │
│ │ Publish  │                                  │                                          │
│ │ Status   │                                  ▼                                          │
│ └────┬─────┘                          ┌──────────────┐                                   │
│      │                                │  RE-SUBMIT   │                                   │
│      ├──────────────┐                 │  ARSIP UNIT  │                                   │
│      ▼              ▼                 └──────────────┘                                   │
│ ┌──────────┐  ┌──────────┐                                                               │
│ │PUBLISHED │  │ ARCHIVED │                                                               │
│ └──────────┘  └──────────┘                                                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Matriks Akses Role

| Fitur | Admin | Operator | User |
|-------|:-----:|:--------:|:----:|
| **Dashboard** | ✅ | ✅ | ✅ |
| **Profile (View/Edit)** | ✅ | ✅ | ✅ |
| **Arsip Unit - View** | ✅ | ✅ | ✅ |
| **Arsip Unit - Create** | ✅ | ❌ | ✅ |
| **Arsip Unit - Edit** | ✅ | ❌ | ✅ |
| **Arsip Unit - Delete** | ✅ | ❌ | ✅ |
| **Arsip Unit - Export PDF** | ✅ | ✅ | ✅ |
| **Arsip Unit - Update Status** | ✅ | ✅ | ❌ |
| **Arsip Unit - Update Publish Status** | ✅ | ✅ | ❌ |
| **Arsip Unit - Assign to Berkas** | ✅ | ✅ | ❌ |
| **Berkas Arsip - View** | ✅ | ✅ | ✅ |
| **Berkas Arsip - Create** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Edit** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Delete** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Export PDF** | ✅ | ✅ | ✅ |
| **Laporan - Penyusutan** | ✅ | ✅ | ✅ |
| **Laporan - Status Verifikasi** | ✅ | ✅ | ✅ |
| **Laporan - Berita Acara** | ✅ | ✅ | ✅ |
| **Laporan - Rekap Unit Pengolah** | ✅ | ✅ | ✅ |
| **Master - Users CRUD** | ✅ | ❌ | ❌ |
| **Master - Kode Klasifikasi** | ✅ | ❌ | ❌ |
| **Master - Unit Pengolah** | ✅ | ❌ | ❌ |
| **Master - Kategori** | ✅ | ❌ | ❌ |
| **Master - Sub Kategori** | ✅ | ❌ | ❌ |
| **Verify/Unverify User** | ✅ | ❌ | ❌ |

---

## 🔄 Flowmap Status Arsip

### Status Verifikasi
```
                     ┌─────────────────┐
                     │     PENDING     │  (Status awal saat create)
                     └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              │         VERIFIKASI            │
              │    (Operator/Admin only)      │
              └───────────────┬───────────────┘
                              │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
    ┌─────────────┐                       ┌─────────────┐
    │  DITERIMA   │                       │   DITOLAK   │
    └─────────────┘                       └─────────────┘
```

### Status Publish
```
                     ┌─────────────────┐
                     │      DRAFT      │  (Status awal saat create)
                     └────────┬────────┘
                              │
                              ▼ (Operator/Admin)
                     ┌─────────────────┐
                     │   PUBLISHED     │
                     └────────┬────────┘
                              │
                              ▼ (Operator/Admin)
                     ┌─────────────────┐
                     │    ARCHIVED     │
                     └─────────────────┘
```

---

## 🛡️ Middleware yang Digunakan

### 1. `AdminMiddleware`
- **Path**: `app/Http/Middleware/AdminMiddleware.php`
- **Fungsi**: Memastikan hanya admin yang dapat mengakses route
- **Digunakan untuk**:
  - Master Data (Users, Kode Klasifikasi, Unit Pengolah, Kategori, Sub Kategori)
  - Verify/Unverify User

### 2. `RoleMiddleware`
- **Path**: `app/Http/Middleware/RoleMiddleware.php`
- **Fungsi**: Mengecek role pengguna untuk akses tertentu
- **Digunakan untuk**:
  - Update Status Arsip (operator, admin)
  - Update Publish Status (operator, admin)
  - Assign to Berkas (operator, admin)

---

## 📝 Catatan Penting

1. **Role Operator** tidak dapat:
   - Create, Edit, Delete Arsip Unit
   - Create, Edit, Delete Berkas Arsip
   
2. **Role Operator & Admin** dapat:
   - Verifikasi arsip (update status: pending → diterima/ditolak)
   - Update publish status (draft → published → archived)
   - Assign arsip unit ke berkas arsip

3. **Hanya Admin** yang dapat:
   - Mengelola semua master data
   - CRUD pengguna
   - Verify/Unverify user

4. **Semua Role** dapat:
   - Mengakses dashboard
   - Melihat arsip unit dan berkas arsip
   - Export laporan PDF
   - Mengelola profile sendiri

---

## 📅 Dibuat pada
- **Tanggal**: 2 Desember 2025
- **Project**: Project-DAT (Sistem Arsip Digital)
