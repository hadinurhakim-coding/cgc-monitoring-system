# GCG Monitoring System — Panduan Kerja Claude

Dokumen ini adalah aturan baku yang wajib diikuti di setiap sesi kerja pada proyek ini.

---

## Stack

- **Framework**: SvelteKit 2 dengan **Svelte 5 (Runes mode WAJIB)**
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Komponen UI**: `bits-ui`, `tailwind-variants`, `lucide-svelte`
- **Backend & Database**: Supabase (PostgreSQL) via `@supabase/supabase-js` dan `pg`
- **Package manager**: `bun`
- **Deployment**: `@sveltejs/adapter-vercel`, Node `>=22`

---

## 1. TypeScript — No `any`

- **Dilarang**: `any`, `as any`, `// @ts-ignore`, `// @ts-expect-error` tanpa alasan eksplisit
- Gunakan `unknown` lalu narrow dengan type guard jika tipe tidak diketahui
- Gunakan `Record<string, unknown>` bukan `Record<string, any>`
- Semua fungsi harus punya return type yang eksplisit jika tidak trivial

---

## 2. Environment Variables

| Jenis variabel | Module import | Boleh dipakai di |
|---|---|---|
| `PUBLIC_*` | `$env/static/public` | Mana saja (client + server) |
| Secret / private | `$env/static/private` | Server only |

- Gunakan `$env/static/public` — Vite inline saat build, lebih efisien
- Hindari `$env/dynamic/public` kecuali nilainya memang berubah per-request
- Setiap variabel baru di `.env` **wajib juga ditambahkan di Vercel dashboard**

### Variabel yang wajib ada di Vercel:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Server vs Client Boundary

- File `*.server.ts` → **server only**, tidak boleh diimport dari komponen Svelte atau file tanpa `.server`
- `+page.server.ts`, `+server.ts`, `+layout.server.ts` → server only
- Supabase service role client (`createAdminServerClient`) → **hanya boleh dipanggil dari server**
- Modul `pg`, `dotenv`, `$env/static/private` → server only

---

## 4. Struktur Folder

```
src/routes/(app)/<nama-fitur>/
  ├── +page.svelte              → UI utama
  ├── +page.server.ts           → load() + actions, server only
  ├── _components/              → komponen UI spesifik fitur ini
  ├── _lib/                     → logic/utilities (boleh shared atau server)
  │   └── *.server.ts           → jika hanya untuk server
  ├── _services/                → data fetching & business logic server
  ├── _data/                    → static/master data
  └── api/                      → +server.ts endpoints (REST-style)

src/lib/
  ├── components/ui/            → komponen UI reusable (shadcn/bits-ui pattern)
  ├── server/                   → utilities server only
  │   ├── auth/                 → Supabase client factories, session
  │   └── *.ts                  → server utilities lainnya
  └── utils.ts                  → utilities umum (client-safe)
```

Logika khusus fitur letakkan di folder routing terkait, bukan di `$lib` global, kecuali akan digunakan di banyak halaman.

---

## 5. Svelte 5 Runes — Wajib

Semua komponen `.svelte` harus menggunakan Runes mode:

- **State & Derived**: Gunakan `$state()`, `$derived()`, `$derived.by()`. Jangan `$:`.
- **Props**: Gunakan `$props()`. Jangan `export let`.
- **Effects**: Gunakan `$effect()` untuk side effects.
- **Event Handling**: `onclick={handler}`, bukan `on:click`.
- **Slots**: Gunakan `{@render children()}`, bukan `<slot />`.

---

## 6. Import Rules

- Selalu gunakan alias `$lib/` — jangan relative path lebih dari 1 level
- Urutan import: external packages → `$lib/` → relative (jika perlu)
- Gunakan `tailwind-merge` + `clsx` (via `cn()` dari `$lib/utils.ts`) untuk class dinamis

---

## 7. Naming Conventions

| Hal | Konvensi |
|---|---|
| File | `kebab-case.ts` / `kebab-case.svelte` |
| Komponen Svelte | `PascalCase` dalam kode, `kebab-case` nama file |
| Fungsi / Variabel | `camelCase` |
| Tipe / Interface | `PascalCase` |
| Konstanta | `SCREAMING_SNAKE_CASE` untuk env, `camelCase` untuk lainnya |
| Server-only file | akhiran `.server.ts` |

---

## 8. Tailwind CSS — Gunakan Utility Class Bawaan

- **Dilarang**: arbitrary value seperti `w-[32px]`, `min-w-[700px]`, `p-[12px]` jika Tailwind sudah punya utility class setara
- Selalu cek skala default Tailwind sebelum menulis arbitrary value
- Contoh: gunakan `min-w-175` bukan `min-w-[700px]`, `w-8` bukan `w-[32px]`
- Jika linter menampilkan warning `suggestCanonicalClasses` → wajib diperbaiki sebelum commit

---

## 9. Database Migration & RLS (Supabase)

- Setiap tabel baru **wajib** memiliki file migrasi SQL di `supabase/migrations/`
- Tabel baru wajib mengaktifkan RLS: `ALTER TABLE nama_tabel ENABLE ROW LEVEL SECURITY;`
- Rancang policy berdasarkan `auth.uid()` atau `TO authenticated USING (true)` sesuai kebutuhan
- Gunakan `CREATE OR REPLACE FUNCTION` agar fungsi trigger bersifat idempotent
- Trigger `updated_at` menggunakan fungsi `public.update_updated_at()`

---

## 10. Checklist Sebelum Commit / Deploy

- [ ] `bun run check` tidak ada error dan tidak ada warning
- [ ] Tidak ada `any` baru yang ditambahkan
- [ ] Setiap `PUBLIC_*` variabel baru sudah ditambahkan di Vercel dashboard
- [ ] Tidak ada import server module dari komponen client
- [ ] Tidak ada syntax Svelte 4 (`$:`, `export let`, `on:click`, `<slot />`)
- [ ] Tidak ada arbitrary Tailwind values jika utility bawaan tersedia
