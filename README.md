# GCG Monitoring System

Aplikasi [SvelteKit](https://svelte.dev/docs/kit) untuk pemantauan tata kelola. Dependensi dan skrip CLI memakai **[Bun](https://bun.sh)** secara konsisten.

## Prasyarat

- [Bun](https://bun.sh/docs/installation) **1.3.x** (lihat `packageManager` di `package.json`)

## Memasang dependensi

```sh
bun install
```

## Pengembangan

```sh
bun run dev
```

Buka aplikasi (termasuk `/assessment-acgs`), biasanya di `http://localhost:5173`.

```sh
bun run dev -- --open
```

## Pemeriksaan tipe / Svelte

```sh
bun run check
```

## Build & pratinjau produksi

```sh
bun run build
bun run preview
```

## Proyek baru dengan `sv` (referensi)

```sh
bun x sv create
```

## Penerbitan paket npm (opsional)

Registri tetap npmjs.com; perintah lokal memakai Bun:

```sh
bun publish
```

---

Dokumentasi SvelteKit: [svelte.dev/docs/kit](https://svelte.dev/docs/kit). Adapter deployment: [adapters](https://svelte.dev/docs/kit/adapters).
