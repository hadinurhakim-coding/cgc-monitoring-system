-- PHASE 2: Cleanup setelah aplikasi sudah diubah memakai:
-- public.acgs_items + public.acgs_item_answers.
-- JANGAN jalankan file ini sebelum kode app selesai diubah dan dites.

begin;

-- Backup final sebelum cleanup.
create table if not exists public.backup_acgs_assessments_before_drop_20260706
as table public.acgs_assessments;

-- Drop tabel/model legacy ACGS yang tidak dipakai lagi.
drop table if exists public.acgs_assessment_answers cascade;
drop table if exists public.acgs_questions cascade;
drop table if exists public.acgs_sections cascade;
drop table if exists public.acgs_parts cascade;
drop type if exists public.acgs_yes_no_status cascade;

-- Pilihan aman: rename tabel flat lama dulu, jangan langsung drop.
alter table if exists public.acgs_assessments
rename to acgs_assessments_flat_legacy;

commit;

select
  to_regclass('public.acgs_items') as acgs_items,
  to_regclass('public.acgs_item_answers') as acgs_item_answers,
  to_regclass('public.acgs_assessments_flat_legacy') as old_flat_backup_table,
  to_regclass('public.acgs_assessment_answers') as old_legacy_answers,
  to_regclass('public.acgs_questions') as old_questions,
  to_regclass('public.acgs_sections') as old_sections,
  to_regclass('public.acgs_parts') as old_parts;
