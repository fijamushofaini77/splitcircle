<div align="center">

# 💸 SplitCircle

**Kelola patungan dan utang circle pertemananmu — tanpa drama, tanpa lupa siapa yang belum bayar.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000?style=flat-square)](https://ui.shadcn.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](#-lisensi)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Kunjungi_Sekarang-FF69B4?style=for-the-badge)](https://splitcircle.vercel.app)

</div>

---

> ⚠️ **Catatan:** ganti link demo di badge di atas dan di bagian [Demo](#-demo) dengan URL deployment kamu yang sebenarnya (misalnya dari Vercel), karena saat ini masih placeholder.

## 📑 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Demo](#-demo)
- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Memulai](#-memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Environment Variables](#environment-variables)
  - [Menjalankan Database](#menjalankan-database)
  - [Menjalankan Development Server](#menjalankan-development-server)
- [Skrip yang Tersedia](#-skrip-yang-tersedia)
- [Product Requirements Document (PRD)](#-product-requirements-document-prd)
  - [Latar Belakang & Masalah](#latar-belakang--masalah)
  - [Tujuan Produk](#tujuan-produk)
  - [Target Pengguna](#target-pengguna)
  - [User Stories](#user-stories)
  - [Fitur Inti (MVP)](#fitur-inti-mvp)
  - [Non-Functional Requirements](#non-functional-requirements)
  - [Out of Scope](#out-of-scope)
  - [Metrik Keberhasilan](#metrik-keberhasilan)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)
- [Kontak](#-kontak)

---

## 📖 Tentang Project

**SplitCircle** adalah aplikasi web untuk mengelola **patungan** dan **utang-piutang** di antara circle pertemanan — mulai dari nongkrong bareng, trip liburan, sampai kebutuhan sehari-hari yang dibayar bergantian. Dibangun dengan Next.js dan TailwindCSS, SplitCircle membantu setiap orang di dalam circle tahu dengan jelas: siapa berutang ke siapa, berapa jumlahnya, dan bagaimana cara menyelesaikannya dengan jumlah transaksi paling sedikit.

## 🎬 Demo

🔗 **Live App:** [splitcircle.vercel.app](https://splitcircle.vercel.app) *(ganti dengan URL demo kamu)*

| Halaman Login | Dashboard |
|---|---|
| Tampilan masuk dengan email & password | Ringkasan saldo dan aktivitas circle |

## ✨ Fitur

- 🔐 **Autentikasi** — daftar & masuk dengan email/password, sesi aman berbasis middleware
- 👥 **Circle Pertemanan** — buat grup/circle untuk mengelompokkan pengeluaran bersama teman
- 🧾 **Pencatatan Pengeluaran (Expenses)** — catat siapa membayar, untuk apa, dan siapa saja yang ikut menanggung
- ⚖️ **Kalkulasi Saldo (Balances)** — mesin penghitung utang otomatis yang menyederhanakan siapa-berutang-ke-siapa
- 🤝 **Penyelesaian Utang (Settlements)** — tandai utang sebagai lunas dan lacak riwayat pembayaran
- 📊 **Log Aktivitas** — riwayat transaksi dan perubahan di dalam circle
- 🎨 **UI Modern** — dibangun dengan shadcn/ui dan TailwindCSS, responsif di desktop & mobile

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Bahasa | [TypeScript](https://www.typescriptlang.org) |
| Styling | [TailwindCSS](https://tailwindcss.com) |
| Komponen UI | [shadcn/ui](https://ui.shadcn.com) |
| ORM & Database | [Drizzle ORM](https://orm.drizzle.team) |
| Autentikasi & Sesi | Custom (`lib/auth.ts`, `lib/session.ts`) + `middleware.ts` |
| Deployment | [Vercel](https://vercel.com) *(disarankan)* |

## 📁 Struktur Project

```
splitcircle/
├── drizzle/                # Migrasi & konfigurasi skema database
├── public/                 # Aset statis
├── src/
│   ├── app/
│   │   ├── (auth)/         # Route group: login, register
│   │   ├── (dashboard)/    # Route group: halaman utama setelah login
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── activity/       # Komponen log aktivitas
│   │   ├── balances/       # Komponen tampilan saldo
│   │   ├── brand/          # Logo & elemen brand
│   │   ├── dashboard/      # Komponen dashboard
│   │   ├── expenses/       # Komponen pengeluaran
│   │   ├── settlements/    # Komponen penyelesaian utang
│   │   └── ui/             # Komponen dasar (shadcn/ui)
│   ├── lib/
│   │   ├── auth.ts         # Logika autentikasi
│   │   ├── db.ts           # Koneksi database
│   │   ├── debtEngine.ts   # Mesin kalkulasi utang/saldo
│   │   ├── schema.ts       # Skema Drizzle ORM
│   │   ├── session.ts      # Manajemen sesi
│   │   └── validators.ts   # Validasi input (Zod, dsb.)
│   └── middleware.ts       # Proteksi route & auth guard
├── drizzle.config.ts
├── next.config.ts
├── components.json
├── tailwind config (via postcss.config.mjs)
├── tsconfig.json
└── package.json
```

## 🚀 Memulai

### Prasyarat

- [Node.js](https://nodejs.org) v18 atau lebih baru
- npm / yarn / pnpm / bun
- Database yang kompatibel dengan Drizzle ORM (lihat `drizzle.config.ts`)

### Instalasi

```bash
git clone https://github.com/fijamushofaini77/splitcircle.git
cd splitcircle
npm install
```

### Environment Variables

Salin `.env.example` menjadi `.env` dan isi sesuai konfigurasi kamu:

```bash
cp .env.example .env
```

### Menjalankan Database

```bash
npx drizzle-kit push
```

### Menjalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

## 📜 Skrip yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan linter |

---

## 📋 Product Requirements Document (PRD)

### Latar Belakang & Masalah

Dalam circle pertemanan, pengeluaran bersama (makan bareng, patungan trip, langganan streaming, dll.) sering dicatat secara manual lewat chat grup atau notes — rentan salah hitung, lupa, dan menimbulkan kecanggungan sosial saat menagih. **SplitCircle** hadir untuk memindahkan proses ini ke satu sumber kebenaran yang transparan dan otomatis.

### Tujuan Produk

1. Menyediakan cara cepat dan jelas untuk mencatat pengeluaran bersama dalam sebuah circle.
2. Menghitung saldo utang-piutang antar anggota secara otomatis dan akurat.
3. Meminimalkan jumlah transaksi yang dibutuhkan untuk melunasi seluruh utang dalam circle (debt simplification).
4. Mengurangi gesekan sosial dalam menagih/membayar utang antar teman.

### Target Pengguna

- Kelompok pertemanan yang sering melakukan aktivitas bersama (nongkrong, trip, kos bareng)
- Mahasiswa/pekerja muda yang berbagi biaya rutin (kontrakan, langganan, dsb.)
- Siapa pun yang butuh alternatif dari pencatatan manual via chat/spreadsheet

### User Stories

- **Sebagai pengguna baru**, saya ingin mendaftar dan membuat akun agar bisa mulai menggunakan aplikasi.
- **Sebagai anggota circle**, saya ingin membuat atau bergabung ke sebuah circle agar bisa mencatat pengeluaran bersama teman-teman saya.
- **Sebagai pembayar**, saya ingin mencatat pengeluaran dan menentukan siapa saja yang ikut menanggung, agar tercatat dengan adil.
- **Sebagai anggota circle**, saya ingin melihat ringkasan saldo saya (berutang/dipiutangi) agar tahu posisi keuangan saya di circle tersebut.
- **Sebagai anggota yang berutang**, saya ingin menandai pembayaran sebagai lunas agar saldo saya diperbarui.
- **Sebagai anggota circle**, saya ingin melihat log aktivitas agar tahu histori transaksi yang terjadi.

### Fitur Inti (MVP)

| # | Fitur | Prioritas |
|---|---|---|
| 1 | Autentikasi (register/login) | Must-have |
| 2 | Manajemen circle (buat/gabung circle) | Must-have |
| 3 | Pencatatan pengeluaran (expense) | Must-have |
| 4 | Kalkulasi saldo otomatis (debt engine) | Must-have |
| 5 | Penyelesaian/pelunasan utang | Must-have |
| 6 | Log aktivitas | Should-have |
| 7 | Notifikasi pengingat utang | Could-have |
| 8 | Export laporan (PDF/CSV) | Could-have |

### Non-Functional Requirements

- **Keamanan:** sesi pengguna terproteksi lewat middleware, password ter-hash, tidak ada data sensitif yang bocor ke client.
- **Performa:** waktu muat halaman dashboard < 2 detik pada koneksi standar.
- **Skalabilitas:** skema database dirancang mendukung banyak circle dan anggota tanpa perubahan struktural besar.
- **Usabilitas:** antarmuka dalam Bahasa Indonesia, sederhana, dan mobile-friendly.
- **Reliabilitas:** perhitungan saldo harus selalu konsisten dan dapat diaudit lewat log aktivitas.

### Out of Scope

- Integrasi pembayaran otomatis (payment gateway) pada fase awal
- Multi-currency (dukungan mata uang selain default)
- Aplikasi mobile native (fokus awal: web responsif)

### Metrik Keberhasilan

- Jumlah circle aktif yang dibuat per minggu
- Rata-rata waktu dari pencatatan pengeluaran hingga utang dilunasi
- Tingkat retensi pengguna (weekly active users)
- Jumlah transaksi settlement yang diselesaikan lewat aplikasi vs manual

---

## 🗺 Roadmap

- [ ] Notifikasi pengingat utang via email/WhatsApp
- [ ] Export laporan pengeluaran circle
- [ ] Dukungan multi-currency
- [ ] Split pengeluaran dengan persentase kustom (bukan hanya rata)
- [ ] Integrasi payment gateway lokal

## 🤝 Kontribusi

Kontribusi sangat terbuka! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan kamu (`git commit -m "feat: menambahkan fitur X"`)
4. Push ke branch kamu (`git push origin fitur/nama-fitur`)
5. Buka Pull Request

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat file `LICENSE` untuk detail lebih lanjut.

## 📬 Kontak

**Fija Mushofa** — [fijamushofaini77@gmail.com](mailto:fijamushofaini77@gmail.com)

Project Link: [github.com/fijamushofaini77/splitcircle](https://github.com/fijamushofaini77/splitcircle)

---

<div align="center">
Dibuat dengan ❤️ untuk circle pertemanan yang lebih transparan.
</div>