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
│    │  │ • Print Preview │    │ • Print Preview │    │   Pengolah**    │           │     │
│    │  │ • Content Search│    │ • Add Arsip     │    │                 │           │     │
│    │  │   (OCR text)    │    │   Unit*         │    │ *Admin & User   │           │     │
│    │  │                 │    │ • Export        │    │  only           │           │     │
│    │  │ *Admin & User   │    │   Penyusutan   │    │ **Admin only    │           │     │
│    │  │  only           │    │                 │    │                 │           │     │
│    │  └─────────────────┘    └─────────────────┘    └─────────────────┘           │     │
│    │                                                                               │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │  VERIFIKASI     │    │     MASTER      │    │   OCR & AI     │           │     │
│    │  │ [Operator/Admin]│    │   [Admin Only]  │    │  [All Roles]   │           │     │
│    │  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘           │     │
│    │           │                      │                      │                     │     │
│    │           ▼                      ▼                      ▼                     │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │ • Update Status │    │ • Users CRUD    │    │ • Scan Document │           │     │
│    │  │   (pending/     │    │ • Kode          │    │ • View OCR      │           │     │
│    │  │   diterima/     │    │   Klasifikasi   │    │   Result        │           │     │
│    │  │   ditolak)      │    │ • Unit Pengolah │    │ • Retry OCR     │           │     │
│    │  │ • Update Publish│    │ • Kategori      │    │ • Accept/Reject │           │     │
│    │  │   Status        │    │ • Sub Kategori  │    │   AI Suggestion │           │     │
│    │  │                 │    │ • Verify/       │    │ • OCR Service   │           │     │
│    │  │                 │    │   Unverify User │    │   Status        │           │     │
│    │  └─────────────────┘    └─────────────────┘    └─────────────────┘           │     │
│    │                                                                               │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │  ASSIGN BERKAS  │    │  ACTIVITY LOG   │    │    BANTUAN      │           │     │
│    │  │ [User/Admin]    │    │  [Admin Only]   │    │  [All Roles]    │           │     │
│    │  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘           │     │
│    │           │                      │                      │                     │     │
│    │           ▼                      ▼                      ▼                     │     │
│    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐           │     │
│    │  │ • Assign Arsip  │    │ • View all logs │    │ • Halaman       │           │     │
│    │  │   Unit ke Berkas│    │ • Filter by     │    │   bantuan /     │           │     │
│    │  │   Arsip         │    │   action, user, │    │   panduan       │           │     │
│    │  │                 │    │   model, date   │    │   penggunaan    │           │     │
│    │  └─────────────────┘    └─────────────────┘    └─────────────────┘           │     │
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
│   ┌───────────────────┐       ┌───────────────────┐                                      │
│   │  STATUS: PENDING  │──────►│  BACKGROUND JOB   │                                      │
│   │  PUBLISH: DRAFT   │       │  ProcessOcrJob    │                                      │
│   │  OCR: PENDING     │       │  • Extract text   │                                      │
│   └─────────┬─────────┘       │  • via Python API │                                      │
│             │                 └─────────┬─────────┘                                      │
│             │                           │                                                │
│             │                           ▼                                                │
│             │                 ┌───────────────────┐                                      │
│             │                 │  ClassifyDocument  │                                      │
│             │                 │  Job               │                                      │
│             │                 │  • AI Suggestion   │                                      │
│             │                 │  • kode_klasifikasi│                                      │
│             │                 └───────────────────┘                                      │
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
│ │ Arsip*   │ │ User     │                                                                │
│ └────┬─────┘ └────┬─────┘  * User/Admin only                                            │
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
| **Profile (View/Edit/Avatar)** | ✅ | ✅ | ✅ |
| **Bantuan / Help** | ✅ | ✅ | ✅ |
| **Arsip Unit - View** | ✅ | ✅ | ✅ |
| **Arsip Unit - Create** | ✅ | ❌ | ✅ |
| **Arsip Unit - Edit** | ✅ | ❌ | ✅ |
| **Arsip Unit - Delete** | ✅ | ❌ | ✅ |
| **Arsip Unit - Export PDF** | ✅ | ✅ | ✅ |
| **Arsip Unit - Print Preview** | ✅ | ✅ | ✅ |
| **Arsip Unit - Content Search (OCR)** | ✅ | ✅ | ✅ |
| **Arsip Unit - Update Status** | ✅ | ✅ | ❌ |
| **Arsip Unit - Update Publish Status** | ✅ | ✅ | ❌ |
| **Arsip Unit - Assign to Berkas** | ✅ | ❌ | ✅ |
| **OCR - Scan Document** | ✅ | ✅ | ✅ |
| **OCR - Retry OCR** | ✅ | ✅ | ✅ |
| **OCR - Accept/Reject AI Suggestion** | ✅ | ✅ | ✅ |
| **OCR - View OCR Status** | ✅ | ✅ | ✅ |
| **Berkas Arsip - View** | ✅ | ✅ | ✅ |
| **Berkas Arsip - Create** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Edit** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Delete** | ✅ | ❌ | ✅ |
| **Berkas Arsip - Export PDF** | ✅ | ✅ | ✅ |
| **Berkas Arsip - Export Penyusutan** | ✅ | ✅ | ✅ |
| **Laporan - Penyusutan** | ✅ | ✅ | ✅ |
| **Laporan - Status Verifikasi** | ✅ | ✅ | ✅ |
| **Laporan - Berita Acara** | ✅ | ✅ | ✅ |
| **Laporan - Rekap Unit Pengolah** | ✅ | ❌ | ❌ |
| **Master - Users CRUD** | ✅ | ❌ | ❌ |
| **Master - Kode Klasifikasi** | ✅ | ❌ | ❌ |
| **Master - Unit Pengolah** | ✅ | ❌ | ❌ |
| **Master - Kategori** | ✅ | ❌ | ❌ |
| **Master - Sub Kategori** | ✅ | ❌ | ❌ |
| **Verify/Unverify User** | ✅ | ❌ | ❌ |
| **Activity Log** | ✅ | ❌ | ❌ |
| **Notifikasi Email (New User)** | ✅ | ❌ | ❌ |
| **Notifikasi Email (Account Verified)** | — | — | ✅ |

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

### Status OCR
```
                     ┌─────────────────┐
                     │     PENDING     │  (Status awal saat create)
                     └────────┬────────┘
                              │
                              ▼ (Background Job)
                     ┌─────────────────┐
                     │   PROCESSING    │
                     └────────┬────────┘
                              │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
    ┌─────────────┐                       ┌─────────────┐
    │  COMPLETED   │                       │   FAILED    │
    └─────────────┘                       └──────┬──────┘
                                                  │
                                                  ▼ (Retry)
                                          ┌─────────────┐
                                          │   PENDING    │
                                          └─────────────┘
```

### Status AI Suggestion
```
                     ┌─────────────────┐
                     │     PENDING     │  (Menunggu klasifikasi)
                     └────────┬────────┘
                              │
                              ▼ (ClassifyDocumentJob)
                     ┌─────────────────┐
                     │   SUGGESTED     │  (AI memberikan saran kode klasifikasi)
                     └────────┬────────┘
                              │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
    ┌─────────────┐                       ┌─────────────┐
    │  ACCEPTED    │                       │  REJECTED   │
    │  (User setuju│                       │  (User tolak│
    │   → apply)   │                       │   saran AI) │
    └─────────────┘                       └─────────────┘
```

---

## 🛡️ Middleware yang Digunakan

### 1. `AdminMiddleware`
- **Path**: `app/Http/Middleware/AdminMiddleware.php`
- **Fungsi**: Memastikan hanya admin yang dapat mengakses route
- **Digunakan untuk**:
  - Master Data (Users, Kode Klasifikasi, Unit Pengolah, Kategori, Sub Kategori)
  - Verify/Unverify User
  - Activity Log
  - Laporan Rekap Unit Pengolah

### 2. `RoleMiddleware`
- **Path**: `app/Http/Middleware/RoleMiddleware.php`
- **Fungsi**: Mengecek role pengguna untuk akses tertentu
- **Parameter**: `role:role1,role2,...`
- **Digunakan untuk**:
  - Update Status Arsip (`role:operator,admin`)
  - Update Publish Status (`role:operator,admin`)
  - Assign to Berkas (`role:user,admin`)
  - Create/Edit/Delete Arsip Unit (`role:user,admin`)
  - Create/Edit/Delete Berkas Arsip (`role:user,admin`)

### 3. `EnsureUserIsVerified`
- **Path**: `app/Http/Middleware/EnsureUserIsVerified.php`
- **Fungsi**: Memastikan user sudah diverifikasi oleh admin sebelum mengakses fitur
- **Catatan**: User yang belum diverifikasi diarahkan ke halaman `verification-pending`

### 4. `HandleAppearance`
- **Path**: `app/Http/Middleware/HandleAppearance.php`
- **Fungsi**: Mengelola preferensi tampilan (theme) user

### 5. `HandleInertiaRequests`
- **Path**: `app/Http/Middleware/HandleInertiaRequests.php`
- **Fungsi**: Middleware Inertia.js untuk sharing data (auth, flash messages) ke frontend Vue.js

---

## 📝 Catatan Penting

1. **Role Operator** tidak dapat:
   - Create, Edit, Delete Arsip Unit
   - Create, Edit, Delete Berkas Arsip
   - Assign arsip unit ke berkas arsip
   
2. **Role Operator & Admin** dapat:
   - Verifikasi arsip (update status: pending → diterima/ditolak)
   - Update publish status (draft → published → archived)

3. **Role User & Admin** dapat:
   - Create, Edit, Delete Arsip Unit
   - Create, Edit, Delete Berkas Arsip
   - Assign arsip unit ke berkas arsip

4. **Hanya Admin** yang dapat:
   - Mengelola semua master data
   - CRUD pengguna
   - Verify/Unverify user
   - Melihat Activity Log
   - Melihat Laporan Rekap Unit Pengolah
   - Menerima notifikasi email saat user baru mendaftar

5. **Semua Role** dapat:
   - Mengakses dashboard (termasuk statistik OCR)
   - Melihat arsip unit dan berkas arsip
   - Export laporan PDF
   - Mengelola profile sendiri (termasuk upload/hapus avatar)
   - Mengakses fitur OCR (scan dokumen, retry, terima/tolak saran AI)
   - Mengakses halaman bantuan
   - Melakukan pencarian konten OCR (content search)

6. **Fitur OCR & AI Classification**:
   - Saat arsip unit dibuat, `ProcessOcrJob` berjalan di background
   - Setelah OCR selesai, `ClassifyDocumentJob` berjalan untuk saran AI
   - User dapat scan ulang (retry) jika OCR gagal
   - User dapat menerima atau menolak saran kode klasifikasi dari AI
   - Python FastAPI service digunakan untuk OCR extraction dan ML classification

7. **Notifikasi Email**:
   - `NewUserRegistered` → dikirim ke admin saat user baru mendaftar
   - `AccountVerified` → dikirim ke user saat akun diverifikasi admin

8. **Activity Logging**:
   - Semua operasi CRUD dicatat otomatis via `LogsActivity` trait
   - Log mencatat: user, action, model, perubahan data (old/new values)

---

## 📅 Info Dokumen
- **Dibuat**: 2 Desember 2025
- **Diperbarui**: 3 Maret 2026
- **Versi**: 2.0
- **Project**: Project-DAT (Sistem Arsip Digital)
