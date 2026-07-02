# Plan Audit & Penanganan Keamanan

## Ringkasan
Audit statis mencakup auth, middleware, account, dashboard, assessment, AOI, monitoring AOI, storage API, migration/RLS, dan Supabase advisors. Prioritas utama: hilangkan auth bypass global, kunci akses service role, batasi data per role/divisi, dan amankan file evidence.

## Temuan & Penanganan
- **P0: Auth bypass aktif global** di `hooks.server.ts`.
  Ganti constant bypass menjadi dev-only/private env yang default `false`, atau hapus total sebelum deploy. Semua route dan API harus kembali memakai `resolveAuthFromCookies`.

- **P0: Service role dipakai luas tanpa scope user/divisi**.
  Tambahkan enforcement server-side untuk assessment, AOI, monitoring, dashboard, dan account: `admin` boleh global; `bpo/viewer` hanya divisinya; anonymous selalu ditolak.

- **P0: Evidence download/delete menerima arbitrary `path`**.
  Endpoint download/delete assessment dan AOI wajib memvalidasi path terhadap row database yang bisa diakses user. Jangan buat signed URL atau hapus object hanya berdasarkan input path.

- **P0: SECURITY DEFINER function bisa dieksekusi anon/authenticated**.
  Revoke execute dari `anon` dan `authenticated`, pindahkan function sensitif ke schema non-public bila perlu, set `search_path` aman, dan pastikan RPC tidak menerima `user_id/division_id` mentah dari client path.

- **P1: RLS remote bermasalah**.
  Tambahkan policy nyata untuk `public.acgs_assessments`; perketat policy AOI yang saat ini terlalu terbuka untuk `SELECT`; review storage policy `gcg-evidence` agar tidak semua authenticated bisa baca semua object.

- **P1: User nonaktif masih bisa mendapat cookie saat OTP callback/verify**.
  Tambahkan cek `users.is_active = true` sebelum `setAuthCookies` di login verify dan auth callback.

- **P1: Upload evidence hanya percaya MIME/ext dari client**.
  Validasi ukuran `> 0`, allowlist ekstensi tetap, dan lakukan verifikasi MIME/content setelah upload atau lewat server-side upload flow.

- **P2: Dashboard search memakai string filter raw**.
  Escape karakter filter Supabase dan batasi panjang query, atau ubah ke query builder yang tidak menyusun ekspresi `.or()` dari input mentah.

- **P2: Hardening database & deploy**.
  Perbaiki mutable `search_path`, tambahkan index FK yang dilaporkan Supabase advisor, optimalkan policy `auth.uid()` dengan `(select auth.uid())`, pulihkan `.env.example`, dan tambah whitelist redirect untuk halaman AOI/monitoring.

## Tahapan Implementasi
1. **Emergency lock-down**: matikan bypass, enforce auth di semua API, cek `is_active`, dan batasi signed URL/delete evidence.
2. **Database security migration**: tambah/perbaiki RLS policy, revoke function execute, amankan function search path, perketat storage policy, tambah FK indexes.
3. **Application authorization**: buat helper akses role/divisi terpusat, terapkan ke assessment, AOI, monitoring, dashboard, dan account actions.
4. **Deployment hardening**: update `.env.example`, pastikan env Vercel lengkap, jalankan Supabase advisors ulang, lalu validasi role matrix.

## Test Plan
- Jalankan `bun run check` dan `bun run build`.
- Uji anonymous tidak bisa akses halaman/API protected.
- Uji `admin` bisa global; `bpo/viewer` hanya data divisinya.
- Uji user nonaktif gagal login via PIN/magic link.
- Uji user tidak bisa download/delete evidence milik row lain.
- Jalankan Supabase security/performance advisors dan pastikan temuan P0/P1 selesai.

## Asumsi
- Mode tanpa login hanya untuk pengembangan lokal dan tidak boleh aktif di deployment.
- Data assessment, AOI, monitoring, dan evidence bersifat division-scoped untuk `bpo/viewer`.
- Bucket `gcg-evidence` tetap private; akses file lewat server yang memeriksa authorization.
