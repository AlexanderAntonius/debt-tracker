# BebasHutang - Debt Tracker & Smart Payoff Engine

Aplikasi web modern untuk mencatat kewajiban tagihan bulanan, menghitung estimasi bunga pinjaman secara akurat, dan merencanakan strategi pelunasan hutang cerdas (**Debt Snowball** vs **Debt Avalanche** vs **Kustom**).

Dibangun dengan arsitektur **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Supabase (PostgreSQL + Auth)**, siap di-deploy secara instan ke **Vercel**.

---

## 🌟 Fitur Utama

1. **Dashboard & Indikator Kebebasan Hutang**:
   - Total sisa pokok hutang aktif.
   - Total tagihan minimum wajib bulan ini.
   - Total perkiraan bunga berjalan yang ditanggung bulan ini.
   - Estimasi tanggal bebas hutang & progress bar persentase pelunasan.

2. **Pelacak Tagihan Bulanan (Monthly Bill Tracker)**:
   - Kalender & checklist tagihan jatuh tempo bulan berjalan (1 - 31).
   - Indikator status otomatis: *Lunas Bulan Ini*, *Mendekati Jatuh Tempo*, *Terlambat (Overdue)*.
   - Tombol **"Catat Pembayaran"**: Otomatis mengurangi sisa pokok dan mencatat riwayat transaksi.
   - Log histori pembayaran per akun hutang.

3. **Multi-Model Perhitungan Suku Bunga**:
   - **Bunga Efektif / Anuitas (Saldo Menurun)**: Untuk KPR & Pinjaman Bank.
   - **Bunga Flat (Pokok Tetap)**: Untuk Pinjol, Paylater, & KTA.
   - **Kartu Kredit (Revolving Compound)**: Bunga harian/bulanan atas sisa tagihan berjalan.

4. **Kalkulator Strategi Pelunasan (Debt Payoff Engine)**:
   - **Debt Snowball**: Prioritas saldo terkecil lebih dulu (Dave Ramsey method) untuk momentum psikologis.
   - **Debt Avalanche**: Prioritas suku bunga tertinggi lebih dulu (secara matematis menghemat total bunga maksimal).
   - **Urutan Kustom**: Bebas atur prioritas secara manual (naik/turun).
   - **Tabel Perbandingan Berdampingan (Side-by-Side)**: Membandingkan langsung tanggal lunas, total bunga, dan jutaan rupiah yang berhasil dihemat vs hanya bayar cicilan minimum.
   - **Grafik Interaktif (Recharts)**: Proyeksi kurva saldo turun ke Rp 0.
   - **Jadwal Amortisasi Bulanan**: Rincian pembayaran pokok dan bunga per bulan hingga lunas.

5. **Penyimpanan Data Cloud Multi-Perangkat (Supabase + Vercel)**:
   - Mendukung login akun (Email & Password).
   - Keamanan *Row Level Security (RLS)* di database PostgreSQL Supabase.
   - **Graceful Local Fallback**: Tetap bisa dipakai offline atau diuji coba langsung di browser sebelum setup akun.
   - Fitur Ekspor & Impor file backup JSON.

---

## 🚀 Panduan Menjalankan di Komputer Lokal

Pastikan Anda telah menginstal Node.js (v18 atau lebih baru).

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka browser di
http://localhost:3000
```

---

## ☁️ Panduan Deploy ke Vercel

1. **Push Proyek ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: inisialisasi aplikasi bebas-hutang"
   git branch -M main
   git remote add origin <URL_REPO_GITHUB_ANDA>
   git push -u origin main
   ```

2. **Buat Database Gratis di Supabase**:
   - Kunjungi [supabase.com](https://supabase.com) dan buat project baru.
   - Buka menu **SQL Editor** > **New Query**.
   - Buka file `supabase/schema.sql` di repositori ini, salin seluruh isinya, dan klik **Run**.
   - Buka menu **Project Settings > API**, salin:
     - `Project URL`
     - `Project API Key (anon public)`

3. **Deploy di Vercel**:
   - Buka [vercel.com](https://vercel.com) dan pilih **Add New Project** > **Import** repositori GitHub Anda.
   - Pada bagian **Environment Variables**, tambahkan:
     - `NEXT_PUBLIC_SUPABASE_URL` = (Project URL Supabase Anda)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Anon Key Supabase Anda)
   - Klik **Deploy**. Selesai! Web app Anda telah online dan tersinkronisasi di cloud.

---

## 📐 Rumus Matematis yang Digunakan

### 1. Bunga Efektif / Anuitas
$$\text{Bunga Bulanan} = \text{Saldo Sisa Pokok} \times \frac{\text{APR}}{1200}$$

### 2. Bunga Flat
$$\text{Bunga Bulanan} = \text{Plafon Pokok Awal} \times \frac{\text{APR}}{1200}$$

### 3. Rollover Efek Snowball / Avalanche
Saat sebuah hutang lunas, cicilan minimumnya tidak disimpan, melainkan otomatis dialihkan ke alokasi ekstra untuk menembak hutang prioritas berikutnya:
$$\text{Uang Ekstra Bulan Ini} = \text{Budget Ekstra Pengguna} + \sum \text{Cicilan Minimum Hutang yang Telah Lunas}$$
