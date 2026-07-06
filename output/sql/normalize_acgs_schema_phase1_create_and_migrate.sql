-- PHASE 1: Buat schema ACGS normalized dan migrasi data dari public.acgs_assessments.
-- Aman dijalankan dulu karena public.acgs_assessments lama TIDAK dihapus.

begin;

create extension if not exists pgcrypto;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.acgs_items (
  uid uuid primary key default gen_random_uuid(),
  master_key text not null unique,
  type text,
  sort_order integer,
  level_label text,
  part_id text,
  section_id text,
  item_id text,
  label text,
  name_en text,
  name_id text,
  full_name_en text,
  full_name_id text,
  question_en text,
  question_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists acgs_items_item_id_unique
  on public.acgs_items (item_id)
  where item_id is not null and item_id <> '';

create index if not exists idx_acgs_items_sort_order
  on public.acgs_items (sort_order nulls last);

drop trigger if exists update_acgs_items_updated_at on public.acgs_items;
create trigger update_acgs_items_updated_at
before update on public.acgs_items
for each row execute function public.update_updated_at();

create table if not exists public.acgs_item_answers (
  uid uuid primary key default gen_random_uuid(),
  year integer not null check (year >= 2000 and year <= 2200),
  item_uid uuid not null references public.acgs_items(uid) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  implementation text not null default '',
  evidence text not null default '',
  status text not null default '',
  recommendation text not null default '',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (year, item_uid, division_id)
);

create index if not exists idx_acgs_item_answers_year
  on public.acgs_item_answers (year);
create index if not exists idx_acgs_item_answers_item_uid
  on public.acgs_item_answers (item_uid);
create index if not exists idx_acgs_item_answers_division_id
  on public.acgs_item_answers (division_id);

drop trigger if exists update_acgs_item_answers_updated_at on public.acgs_item_answers;
create trigger update_acgs_item_answers_updated_at
before update on public.acgs_item_answers
for each row execute function public.update_updated_at();

alter table public.acgs_items enable row level security;
alter table public.acgs_item_answers enable row level security;

drop policy if exists "read acgs items authenticated" on public.acgs_items;
create policy "read acgs items authenticated"
on public.acgs_items
for select
to authenticated
using (true);

drop policy if exists "read acgs item answers registered users" on public.acgs_item_answers;
create policy "read acgs item answers registered users"
on public.acgs_item_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and coalesce(u.is_active, true)
      and u.role in ('admin', 'bpo', 'viewer')
  )
);

create table if not exists public.backup_acgs_assessments_flat_20260706
as table public.acgs_assessments;

with src as (
  select
    *,
    coalesce(nullif(item_id, ''), 'sort:' || coalesce(sort_order::text, uid::text) || ':' || coalesce(type, '')) as master_key
  from public.acgs_assessments
),
ranked as (
  select *, row_number() over (partition by master_key order by year desc, sort_order nulls last, updated_at desc) as rn
  from src
)
insert into public.acgs_items (
  master_key, type, sort_order, level_label, part_id, section_id, item_id, label,
  name_en, name_id, full_name_en, full_name_id, question_en, question_id
)
select
  master_key, type, sort_order, level_label, part_id, section_id, item_id, label,
  name_en, name_id, full_name_en, full_name_id, question_en, question_id
from ranked
where rn = 1
on conflict (master_key) do update set
  type = excluded.type,
  sort_order = excluded.sort_order,
  level_label = excluded.level_label,
  part_id = excluded.part_id,
  section_id = excluded.section_id,
  item_id = excluded.item_id,
  label = excluded.label,
  name_en = excluded.name_en,
  name_id = excluded.name_id,
  full_name_en = excluded.full_name_en,
  full_name_id = excluded.full_name_id,
  question_en = excluded.question_en,
  question_id = excluded.question_id,
  updated_at = now();

with src as (
  select
    *,
    coalesce(nullif(item_id, ''), 'sort:' || coalesce(sort_order::text, uid::text) || ':' || coalesce(type, '')) as master_key
  from public.acgs_assessments
  where lower(coalesce(type, '')) in ('question', 'acgs')
)
insert into public.acgs_item_answers (
  year, item_uid, division_id, implementation, evidence, status, recommendation,
  notes, created_by, updated_by, created_at, updated_at
)
select
  s.year,
  i.uid,
  s.division_id,
  coalesce(s.implementation, ''),
  coalesce(s.evidence, ''),
  coalesce(s.status, ''),
  coalesce(s.recommendation, ''),
  s.notes,
  s.created_by,
  s.updated_by,
  s.created_at,
  s.updated_at
from src s
join public.acgs_items i on i.master_key = s.master_key
on conflict (year, item_uid, division_id) do update set
  implementation = excluded.implementation,
  evidence = excluded.evidence,
  status = excluded.status,
  recommendation = excluded.recommendation,
  notes = excluded.notes,
  updated_by = excluded.updated_by,
  updated_at = excluded.updated_at;

create or replace view public.v_acgs_assessment_rows as
select
  ans.uid as row_uid,
  i.uid as item_uid,
  i.type,
  i.sort_order,
  ans.year,
  ans.division_id,
  i.level_label,
  i.part_id,
  i.section_id,
  i.item_id,
  i.label,
  i.name_en,
  i.name_id,
  i.full_name_en,
  i.full_name_id,
  i.question_en,
  i.question_id,
  ans.implementation,
  ans.evidence,
  ans.status,
  ans.recommendation,
  ans.notes,
  ans.created_at,
  ans.updated_at
from public.acgs_items i
left join public.acgs_item_answers ans on ans.item_uid = i.uid
where i.is_active = true;

commit;

select 'acgs_items' as table_name, count(*) as total_rows from public.acgs_items
union all
select 'acgs_item_answers' as table_name, count(*) as total_rows from public.acgs_item_answers;

select year, count(*) as total_answers
from public.acgs_item_answers
group by year
order by year;
