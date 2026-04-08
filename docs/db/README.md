# Database docs (agent-friendly)

Folder ini adalah **ringkasan desain database terbaru** agar mudah dipahami (untuk developer dan agent).

## Sumber kebenaran
- **DDL & RLS policy**: `supabase/migrations/*.sql` (urut sesuai waktu).

## Snapshot skema terbaru (generated)
- File: `docs/db/schema.snapshot.sql`
- Cara regenerate (recommended):

```bash
# Pastikan Supabase CLI terpasang dan project sudah di-link
supabase db dump --schema public --local > docs/db/schema.snapshot.sql
```

> Catatan: jika Anda dump dari remote, gunakan `--db-url` sesuai kebutuhan.

## ERD & data dictionary
- ERD (Mermaid): `docs/db/erd.mmd`
- Data dictionary ringkas: `docs/db/tables.md`

