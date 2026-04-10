# GCG Monitoring System — Panduan Kerja Claude

Dokumen ini adalah aturan baku yang wajib diikuti di setiap sesi kerja pada proyek ini.

---

## Stack

- **SvelteKit 5** (Runes mode wajib)
- **TypeScript** — `strict: true`, tidak ada pengecualian
- **Supabase** — database + auth
- **Tailwind CSS v4**
- **Adapter**: `@sveltejs/adapter-vercel`
- **Package manager**: `bun`
- **Node**: `>=24 <25` — harus cocok dengan konfigurasi Vercel

---

## 1. TypeScript — No `any`

- **Dilarang**: `any`, `as any`, `// @ts-ignore`, `// @ts-expect-error` tanpa alasan eksplisit
- Gunakan `unknown` lalu narrow dengan type guard jika tipe tidak diketahui
- Gunakan `Record<string, unknown>` bukan `Record<string, any>`
- Semua fungsi harus punya return type yang eksplisit jika tidak trivial

```ts
// SALAH
function process(data: any) { ... }

// BENAR
function process(data: unknown) {
  if (typeof data !== "object" || data === null) return;
  ...
}
```

---

## 2. Environment Variables

| Jenis variabel | Module import | Boleh dipakai di |
|---|---|---|
| `PUBLIC_*` | `$env/static/public` | Mana saja (client + server) |
| Secret / private | `$env/static/private` | Server only |

- **Jangan pakai** `$env/dynamic/public` kecuali nilainya memang berubah per-request (sangat jarang)
- `$env/static/public` → Vite inline saat build, lebih efisien dan bisa divalidasi Vercel saat build
- Setiap variabel baru yang ditambahkan di `.env` **wajib juga ditambahkan di Vercel dashboard** (Settings → Environment Variables) sebelum deploy

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

```ts
// SALAH — import server module dari komponen
import { createAdminServerClient } from "$lib/server/auth/clients";

// BENAR — gunakan data dari load() atau API endpoint
```

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
  ├── components/ui/            → komponen UI reusable (shadcn-style)
  ├── server/                   → utilities server only
  │   ├── auth/                 → Supabase client factories, session
  │   └── *.ts                  → server utilities lainnya
  └── utils.ts                  → utilities umum (client-safe)
```

---

## 5. Svelte 5 Runes — Wajib

Semua komponen `.svelte` harus menggunakan Runes mode:

```svelte
<!-- BENAR -->
<script lang="ts">
  let count = $state(0);
  let double = $derived(count * 2);
  let { title }: { title: string } = $props();
</script>

<!-- SALAH — syntax Svelte 4, jangan dipakai -->
<script lang="ts">
  export let title: string;
  let count = 0;
  $: double = count * 2;
</script>
```

---

## 6. Import Rules

- Selalu gunakan alias `$lib/` — jangan relative path lebih dari 1 level
- Jangan campur dynamic import `import()` dan static import dari module yang sama dalam satu file
- Urutan import: external packages → `$lib/` → relative (jika perlu)

```ts
// BENAR
import { createClient } from "@supabase/supabase-js";
import { createAnonServerClient } from "$lib/server/auth/clients.js";
import { gcgQuestionPoint } from "./scoring.js";

// SALAH
import { something } from "../../../lib/server/auth/clients";
```

---

## 7. Naming Conventions

| Hal | Konvensi |
|---|---|
| File | `kebab-case.ts` / `kebab-case.svelte` |
| Komponen Svelte | `PascalCase` dalam kode, `kebab-case` nama file |
| Fungsi | `camelCase` |
| Tipe / Interface | `PascalCase` |
| Konstanta | `SCREAMING_SNAKE_CASE` untuk env, `camelCase` untuk yang lain |
| Server-only file | akhiran `.server.ts` |

---

## 8. Checklist Sebelum Commit / Deploy

- [ ] `bun run check` tidak ada error
- [ ] Tidak ada `any` baru yang ditambahkan
- [ ] Setiap `PUBLIC_*` variabel baru sudah ditambahkan di Vercel dashboard
- [ ] Tidak ada import server module dari komponen client
- [ ] Tidak ada syntax Svelte 4 (reactive `$:`, `export let`)
