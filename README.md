<div align="center">
  <h1>SplitCircle</h1>
  <p>Patungan dan utang circle pertemanan, beres dalam satu tempat.</p>

  <img src="https://img.shields.io/badge/framework-Next.js%2016-black.svg" alt="Next.js 16">
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/database-Neon%20Postgres-00E599.svg" alt="Neon Postgres">
</div>

---

SplitCircle adalah aplikasi pencatat pengeluaran dan utang-piutang untuk
circle pertemanan: nongkrong bareng, trip liburan, kontrakan patungan, atau
langganan yang dibayar bergantian. Setiap pengeluaran yang dicatat langsung
dipecah ke anggota yang ikut menanggung, dan mesin saldo menghitung siapa
berutang ke siapa dengan jumlah transaksi pelunasan seminimal mungkin —
bukan lagi hitung-hitungan manual di chat grup.

## Daftar Isi

- [Fitur](#fitur)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Running locally](#running-locally)
- [Trying the app](#trying-the-app)
- [Design notes](#design-notes)
- [Known gaps](#known-gaps)
- [Roadmap](#roadmap)
- [Dokumentasi produk (PRD)](#dokumentasi-produk-prd)

## Fitur

- **Autentikasi** — register & login dengan email/password, sesi disimpan
  sebagai JWT di httpOnly cookie (`sc_token`), input divalidasi dengan Zod.
- **Grup (circle)** — buat grup baru atau gabung ke grup lewat kode
  undangan 6 karakter.
- **Pengeluaran (expenses)** — catat siapa yang membayar, lalu bagi ke
  anggota dengan tiga metode: **rata**, **custom (nominal per orang)**,
  atau **persentase**.
- **Balances & Debt Engine** — saldo tiap anggota dihitung dari seluruh
  expense + settlement yang sudah dikonfirmasi, lalu disederhanakan jadi
  daftar transfer minimum lewat algoritma greedy debt-simplification.
- **Settlements** — anggota yang berutang mengajukan pembayaran, anggota
  yang menerima mengonfirmasi atau menolaknya.
- **Activity log** — riwayat aktivitas per grup (grup dibuat, anggota
  gabung, expense ditambah/dihapus, settlement diajukan/dikonfirmasi/ditolak).
- **Dashboard ringkasan** — total grup, total pengeluaran, jumlah transaksi,
  dan jumlah konfirmasi pembayaran yang masih menunggu, dirangkum lintas
  semua grup yang diikuti user.

## How it works

```mermaid
flowchart LR
  U["Anggota circle<br/>(pembayar)"] -->|"catat expense"| E["Expense record"]
  E -->|"dibagi ke peserta"| DE["Debt Engine"]
  DE -->|"hitung & sederhanakan"| B["Balances<br/>(siapa berutang ke siapa)"]
  B -->|"tandai lunas"| S["Settlement"]
  S -->|"update saldo"| B
  B --> A["Activity log"]
  S --> A
```

Setiap expense dicatat dengan pembayar dan daftar peserta yang menanggung
(`expense_shares`). Debt Engine (`src/lib/debtEngine.ts`) menjumlahkan
seluruh expense dan settlement yang sudah **confirmed** di dalam sebuah
grup menjadi saldo bersih per anggota, lalu memasangkan debitur terbesar
dengan kreditur terbesar secara greedy sampai semua saldo mendekati nol.
Ini bukan solusi matematis optimal untuk semua kasus (variannya adalah
masalah NP-hard secara umum), tapi untuk ukuran grup pertemanan/kos biasa
hasilnya sudah berupa daftar transfer yang sangat kecil dan cepat dihitung.
Saat sebuah utang diselesaikan lewat Settlement dan dikonfirmasi penerima,
saldo diperbarui dan tercatat di Activity log sehingga seluruh anggota
grup punya riwayat yang bisa diaudit.

## Tech stack

| Layer | Pilihan |
| --- | --- |
| Framework | Next.js 16 (App Router, route groups `(auth)` & `(dashboard)`) |
| Bahasa | TypeScript (strict) |
| Database | Neon Postgres (serverless, koneksi via HTTP driver `@neondatabase/serverless`) |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) + Drizzle Kit untuk migrasi |
| Auth | JWT (`jose`) di httpOnly cookie, hashing password dengan `bcryptjs`, validasi input dengan `zod` |
| Styling | Tailwind CSS v4, font [Poppins](https://fonts.google.com/specimen/Poppins) via `next/font/google` |
| Komponen UI | [shadcn/ui](https://ui.shadcn.com) (style `base-nova`, base color `neutral`) + ikon [Iconify](https://iconify.design) (set `solar`) dan `lucide-react` |
| Signature UI | `GlassSurface` (`src/components/ui/react-bits/GlassSurface.tsx`) — komponen glassmorphism custom berbasis SVG displacement filter |

## Repository layout

- `src/app/(auth)/login`, `src/app/(auth)/register` — halaman login & register
- `src/app/(dashboard)/page.tsx` — dashboard ringkasan (stat card + daftar grup)
- `src/app/(dashboard)/groups/[groupId]/page.tsx` — halaman detail grup (tab expenses, balances, settlements, activity)
- `src/app/api/auth` — register, login, logout, me
- `src/app/api/groups` — CRUD grup, join via kode undangan
- `src/app/api/groups/[groupId]/{expenses,balances,settlements,activity,export}` — data per grup
- `src/app/api/expenses/[expenseId]` — hapus expense
- `src/app/api/settlements/[settlementId]/{confirm,reject}` — konfirmasi/tolak pembayaran
- `src/app/api/dashboard/summary` — agregat ringkasan lintas grup
- `src/components/dashboard` — `DashboardShell` (sidebar + topbar), `StatCard`, `GroupActionsDialog`
- `src/components/expenses`, `src/components/balances`, `src/components/settlements`, `src/components/activity` — panel per fitur
- `src/components/ui` — komponen dasar shadcn/ui + `GlassSurface`
- `src/lib/schema.ts` — skema database (Drizzle ORM), lengkap dengan relations
- `src/lib/debtEngine.ts` — logika kalkulasi & penyederhanaan utang
- `src/lib/validators.ts` — skema validasi Zod untuk register/login
- `src/lib/auth.ts` — sign/verify JWT; `src/lib/session.ts` — baca sesi dari cookie
- `src/middleware.ts` — proteksi route (semua path privat kecuali `/login` & `/register`)
- `drizzle/` — migrasi database yang sudah di-generate
- `docs/PRD.md` — dokumen requirement produk (lihat [Dokumentasi produk](#dokumentasi-produk-prd))

## Running locally

```bash
git clone https://github.com/fijamushofaini77/splitcircle.git
cd splitcircle
npm install
cp .env.example .env.local   # isi DATABASE_URL & JWT_SECRET
npx drizzle-kit push         # sinkronkan skema ke database Neon
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> **Penting soal nama file env:** `drizzle.config.ts` secara eksplisit
> memuat `.env.local` (`config({ path: '.env.local' })`), sedangkan
> Next.js sendiri otomatis membaca `.env.local` juga. Jadi pastikan kamu
> menyalin `.env.example` ke **`.env.local`**, bukan `.env` — kalau salah
> nama file, `next dev` masih jalan (karena masih ada fallback env lain),
> tapi `drizzle-kit push` akan gagal menemukan `DATABASE_URL`.

Variabel yang dibutuhkan (lihat `.env.example`):

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Connection string Neon, contoh: `postgresql://user:password@ep-xxxx.neon.tech/splitcircle?sslmode=require` |
| `JWT_SECRET` | String acak & rahasia untuk menandatangani JWT sesi. Generate misalnya dengan `openssl rand -base64 48` |

## Trying the app

1. Buka halaman `/register` dan buat akun baru.
2. Dari dashboard (`/`), buat grup baru atau gabung ke grup yang sudah ada lewat tombol aksi grup + kode undangan.
3. Masuk ke halaman grup (`/groups/[groupId]`), catat expense pertama: pilih siapa yang membayar, metode split (rata/custom/persentase), dan siapa saja yang menanggung.
4. Buka tab Balances untuk melihat saldo utang-piutang yang sudah disederhanakan Debt Engine.
5. Ajukan pembayaran di tab Settlements; dari akun anggota penerima, konfirmasi atau tolak pembayaran tersebut.
6. Cek tab Activity untuk melihat seluruh riwayat perubahan di grup tersebut.

## Design notes

- **Debt Engine terpisah dari pencatatan mentah.** Expense dan settlement
  disimpan apa adanya; saldo dan saran pelunasan selalu dihitung ulang
  on-demand di `GET /api/groups/[groupId]/balances`. Artinya histori
  transaksi tetap utuh meski logika penyederhanaan utang berubah di
  kemudian hari, tapi juga berarti endpoint ini melakukan query berulang
  (expense + shares + settlement per grup) tiap kali dipanggil — cukup
  untuk skala grup pertemanan, namun layak dioptimalkan (mis. agregasi di
  level SQL) kalau jumlah expense per grup sudah besar.
- **Auth dipisah jadi dua layer.** `src/lib/auth.ts` murni urusan
  sign/verify JWT, `src/lib/session.ts` yang membaca cookie via
  `next/headers` dan expose `getSession()` / `requireSession()`. Proteksi
  route dilakukan sekali di `src/middleware.ts` dengan matcher yang
  meng-exclude `/login` dan `/register`, bukan diulang per halaman.
- **Skema database dari kode, bukan SQL manual.** `src/lib/schema.ts`
  mendefinisikan seluruh tabel (users, groups, group_members, expenses,
  expense_shares, settlements, activity_log) plus relations Drizzle,
  sehingga migrasi di `drizzle/` selalu bisa di-generate ulang dan direplay.
- **Validasi terpusat di Zod, tapi belum menyeluruh.** `registerSchema`
  dan `loginSchema` sudah dipakai di route auth. Endpoint lain (expenses,
  settlements, groups) saat ini masih melakukan pengecekan manual di
  dalam route handler, bukan lewat skema Zod — konsisten dengan pola auth
  akan jadi peningkatan yang wajar berikutnya.
- **Identitas visual: palet rose/maroon/gold + Poppins.** Warna dasar
  didefinisikan sebagai CSS variable (`--rose-400`, `--maroon-dark`,
  `--gold`, dst.) di atas token shadcn/ui standar (style `base-nova`,
  base color `neutral`), supaya tetap kompatibel dengan komponen shadcn
  generate-an tapi punya karakter warna sendiri. Ikon memakai dua sumber
  sekaligus: `lucide-react` (bawaan shadcn) untuk komponen dasar, dan
  Iconify set `solar` untuk ikon-ikon di halaman dashboard/expense/grup.
- **`GlassSurface` sebagai elemen visual pembeda.** Komponen ini bukan
  bagian dari shadcn/ui — ini implementasi glassmorphism custom (SVG
  `feDisplacementMap` + backdrop blur) yang dipasang di `DashboardShell`
  untuk memberi identitas visual yang tidak generik.

## Known gaps

Bagian ini ditulis jujur berdasarkan isi kode saat ini, supaya tidak
overclaim soal kesiapan produksi:

- Belum ada automated test (unit/integration) untuk `debtEngine.ts`
  maupun route API — penting terutama untuk debt engine karena kesalahan
  di sini langsung berarti saldo uang yang salah.
- Validasi Zod baru menutup register/login; endpoint expenses/groups/
  settlements masih validasi manual (lihat catatan di *Design notes*).
- `npx drizzle-kit push` dipakai untuk sinkronisasi skema, belum ada
  proses migrasi terversi (`drizzle-kit generate` + `migrate`) yang
  dijalankan otomatis — cocok untuk development, kurang cocok untuk
  pipeline deploy yang butuh riwayat migrasi yang bisa diaudit.
- Navigasi sidebar (`DashboardShell`) saat ini hanya berisi satu item
  ("Dashboard"); halaman grup diakses lewat kartu grup atau tautan
  langsung, bukan dari menu.
- Belum ada rate limiting di endpoint auth (register/login).

## Roadmap

- [ ] Automated test untuk debt engine & route API kritikal
- [ ] Validasi Zod menyeluruh di semua route (expenses, groups, settlements)
- [ ] Migrasi database terversi untuk pipeline deploy (bukan `drizzle-kit push` langsung)
- [ ] Notifikasi pengingat utang via email/WhatsApp
- [ ] Export laporan pengeluaran grup (PDF, selain CSV yang sudah ada)
- [ ] Dukungan multi-currency
- [ ] Integrasi payment gateway lokal untuk pelunasan langsung

## Dokumentasi produk (PRD)

Spesifikasi produk lengkap — project overview, user persona & user flow,
tabel functional requirements (ID Fitur/Nama/Deskripsi Perilaku/Status),
non-functional requirements (stack & keamanan), serta ERD database — ada
di **[`docs/PRD.md`](docs/PRD.md)**.

README ini menjelaskan *cara pakai & menjalankan* proyek; PRD menjelaskan
*apa yang seharusnya dibangun dan kenapa*. Kalau ada perbedaan antara
keduanya, anggap PRD sebagai rujukan requirement, dan README sebagai
rujukan operasional (cara install, run, dan struktur folder).