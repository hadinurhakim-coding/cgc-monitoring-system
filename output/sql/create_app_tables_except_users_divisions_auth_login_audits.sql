-- Create ulang table aplikasi, KECUALI:
-- public.users, public.divisions, public.auth_login_audits
-- Jalankan di Supabase SQL Editor setelah table lain dihapus.

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

-- =============================================================
-- ACGS flat table yang dipakai halaman /assessment-acgs
-- =============================================================
create table if not exists public.acgs_assessments (
  uid uuid primary key default gen_random_uuid(),
  id uuid unique default gen_random_uuid(),
  type text,
  sort_order integer,
  year integer not null check (year >= 2000 and year <= 2200),
  division_id uuid references public.divisions(id) on delete set null,

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

  implementation text not null default '',
  evidence text not null default '',
  status text not null default '',
  recommendation text not null default '',
  notes text,

  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  search_vector tsvector generated always as (
    case
      when lower(coalesce(type, '')) in ('question', 'acgs') then
        setweight(to_tsvector('simple', coalesce(item_id, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(question_en, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(question_id, '')), 'B')
      else ''::tsvector
    end
  ) stored
);

create index if not exists idx_acgs_assessments_year_sort
  on public.acgs_assessments (year, sort_order nulls last);
create index if not exists idx_acgs_assessments_year_item
  on public.acgs_assessments (year, item_id);
create index if not exists idx_acgs_assessments_division_id
  on public.acgs_assessments (division_id);
create index if not exists acgs_assessments_search_vector_gin
  on public.acgs_assessments using gin (search_vector);

drop trigger if exists update_acgs_assessments_updated_at on public.acgs_assessments;
create trigger update_acgs_assessments_updated_at
before update on public.acgs_assessments
for each row execute function public.update_updated_at();

alter table public.acgs_assessments enable row level security;

drop policy if exists "acgs_assessments_select_registered_users" on public.acgs_assessments;
create policy "acgs_assessments_select_registered_users"
on public.acgs_assessments
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

revoke insert, update, delete on table public.acgs_assessments from anon, authenticated;

-- =============================================================
-- Optional legacy/master ACGS tables dari migration lama
-- Aman dibuat jika ada kode lama/migration lama yang masih referensi.
-- =============================================================
create table if not exists public.acgs_parts (
  code varchar(10) primary key,
  title_en text not null,
  title_id text not null,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.acgs_sections (
  id uuid primary key default gen_random_uuid(),
  part_code varchar(10) not null references public.acgs_parts(code) on delete restrict,
  code varchar(20) not null unique,
  title_en text not null,
  title_id text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique(part_code, sort_order)
);

create table if not exists public.acgs_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.acgs_sections(id) on delete cascade,
  code varchar(20) not null unique,
  question_en text not null,
  question_id text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(section_id, sort_order)
);

do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'acgs_yes_no_status') then
    create type public.acgs_yes_no_status as enum ('yes', 'no', 'na');
  end if;
end $$;

create table if not exists public.acgs_assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.acgs_assessments(id) on delete cascade,
  question_id uuid references public.acgs_questions(id) on delete cascade,
  implementation text,
  evidence text,
  status public.acgs_yes_no_status,
  recommendation text,
  notes text,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(assessment_id, question_id)
);

create index if not exists acgs_sections_part_code_idx on public.acgs_sections(part_code, sort_order);
create index if not exists acgs_questions_section_id_idx on public.acgs_questions(section_id, sort_order);
create index if not exists acgs_answers_assessment_id_idx on public.acgs_assessment_answers(assessment_id);

alter table public.acgs_parts enable row level security;
alter table public.acgs_sections enable row level security;
alter table public.acgs_questions enable row level security;
alter table public.acgs_assessment_answers enable row level security;

drop policy if exists acgs_parts_select_auth on public.acgs_parts;
create policy acgs_parts_select_auth on public.acgs_parts for select to authenticated using (true);
drop policy if exists acgs_sections_select_auth on public.acgs_sections;
create policy acgs_sections_select_auth on public.acgs_sections for select to authenticated using (true);
drop policy if exists acgs_questions_select_auth on public.acgs_questions;
create policy acgs_questions_select_auth on public.acgs_questions for select to authenticated using (true);

-- =============================================================
-- Summary score table
-- =============================================================
create table if not exists public.acgs_year_summaries (
  year integer primary key,
  question_count integer not null,
  points_sum integer not null,
  score_pct numeric(8, 2) not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.acgs_year_summaries enable row level security;
drop policy if exists "read acgs year summaries authenticated" on public.acgs_year_summaries;
create policy "read acgs year summaries authenticated"
on public.acgs_year_summaries
for select
to authenticated
using (true);

-- =============================================================
-- Audit log assessment
-- =============================================================
create table if not exists public.assessment_change_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,
  user_email text not null,
  division_id uuid references public.divisions(id) on delete set null,
  assessment_uid uuid not null references public.acgs_assessments(uid) on delete cascade,
  year integer not null,
  item_id text,
  field text not null,
  old_value text,
  new_value text
);

create index if not exists idx_assessment_change_logs_created_at
  on public.assessment_change_logs (created_at desc);
create index if not exists idx_assessment_change_logs_year_created_at
  on public.assessment_change_logs (year, created_at desc);
create index if not exists idx_assessment_change_logs_division_created_at
  on public.assessment_change_logs (division_id, created_at desc);
create index if not exists idx_assessment_change_logs_user_id_created_at
  on public.assessment_change_logs (user_id, created_at desc);
create index if not exists idx_assessment_change_logs_assessment_uid
  on public.assessment_change_logs (assessment_uid);

alter table public.assessment_change_logs enable row level security;

drop policy if exists "read assessment change logs by role" on public.assessment_change_logs;
create policy "read assessment change logs by role"
on public.assessment_change_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and coalesce(u.is_active, true)
      and (
        u.role = 'admin'
        or (u.division_id is not null and public.assessment_change_logs.division_id = u.division_id)
      )
  )
);

drop policy if exists "insert assessment change logs by role" on public.assessment_change_logs;
create policy "insert assessment change logs by role"
on public.assessment_change_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and coalesce(u.is_active, true)
      and (
        u.role = 'admin'
        or (u.division_id is not null and public.assessment_change_logs.division_id = u.division_id)
      )
  )
);

-- =============================================================
-- Audit function + RPC update assessment field
-- =============================================================
create or replace function public.acgs_assessments_audit_fn()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_email text;
  v_division uuid;
  v_field text;
  v_old text;
  v_new text;
begin
  v_user_id := nullif(current_setting('app.audit_user_id', true), '')::uuid;

  if v_user_id is null then
    return new;
  end if;

  select u.email, u.division_id
  into v_email, v_division
  from public.users u
  where u.id = v_user_id
    and coalesce(u.is_active, true);

  if v_email is null then
    return new;
  end if;

  foreach v_field in array array['status', 'evidence', 'implementation', 'recommendation'] loop
    case v_field
      when 'status' then
        v_old := old.status;
        v_new := new.status;
      when 'evidence' then
        v_old := old.evidence;
        v_new := new.evidence;
      when 'implementation' then
        v_old := old.implementation;
        v_new := new.implementation;
      when 'recommendation' then
        v_old := old.recommendation;
        v_new := new.recommendation;
    end case;

    if v_old is distinct from v_new then
      insert into public.assessment_change_logs (
        user_id, user_email, division_id, assessment_uid, year, item_id, field, old_value, new_value
      ) values (
        v_user_id, v_email, v_division, new.uid, new.year, new.item_id, v_field, v_old, v_new
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists acgs_assessments_audit on public.acgs_assessments;
create trigger acgs_assessments_audit
after update on public.acgs_assessments
for each row execute function public.acgs_assessments_audit_fn();

create or replace function public.save_acgs_assessment_field(
  p_row_uid uuid,
  p_field text,
  p_value text,
  p_user_id uuid,
  p_user_email text,
  p_division_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_email text;
  v_actor_role text;
begin
  if p_field not in ('status', 'evidence', 'implementation', 'recommendation') then
    raise exception 'Field tidak valid: %', p_field;
  end if;

  select u.email, u.role
  into v_actor_email, v_actor_role
  from public.users u
  where u.id = p_user_id
    and coalesce(u.is_active, true);

  if v_actor_email is null then
    raise exception 'User tidak aktif atau tidak ditemukan';
  end if;

  if v_actor_role not in ('admin', 'bpo') then
    raise exception 'Izin ditolak';
  end if;

  perform set_config('app.audit_user_id', p_user_id::text, true);

  update public.acgs_assessments
  set
    status = case when p_field = 'status' then lower(p_value) else status end,
    evidence = case when p_field = 'evidence' then p_value else evidence end,
    implementation = case when p_field = 'implementation' then p_value else implementation end,
    recommendation = case when p_field = 'recommendation' then p_value else recommendation end,
    updated_at = now()
  where uid = p_row_uid;

  if not found then
    raise exception 'Row tidak ditemukan: %', p_row_uid;
  end if;
end;
$$;

-- =============================================================
-- AOI tables untuk /area-of-improvement dan /monitoring-aoi
-- =============================================================
create table if not exists public.aoi_items (
  uid uuid primary key default gen_random_uuid(),
  year integer not null,
  sort_order integer,
  division_id uuid references public.divisions(id) on delete set null,
  level_label text not null default '',
  part_id text not null default '',
  section_id text not null default '',
  standar_label text not null default '',
  fakta_temuan text not null default '',
  rekomendasi text not null default '',
  pic text not null default '',
  status_rekomendasi text not null default 'Belum ditindak-lanjuti'
    check (status_rekomendasi in (
      'Selesai ditindak-lanjuti',
      'On Progress',
      'Tidak dapat ditindak-lanjuti 100%',
      'Belum ditindak-lanjuti'
    )),
  eviden text not null default '',
  aoi_code text not null default '',
  area_of_improvement text not null default '',
  tindak_lanjut_rekomendasi text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_aoi_items_year_sort
  on public.aoi_items (year, sort_order nulls last);
create index if not exists idx_aoi_items_year_section
  on public.aoi_items (year, section_id);
create index if not exists idx_aoi_items_year_aoi_code
  on public.aoi_items (year, aoi_code);
create index if not exists idx_aoi_items_created_by
  on public.aoi_items (created_by);
create index if not exists idx_aoi_items_division_id
  on public.aoi_items (division_id);
create index if not exists idx_aoi_items_updated_by
  on public.aoi_items (updated_by);

drop trigger if exists aoi_items_set_updated_at on public.aoi_items;
create trigger aoi_items_set_updated_at
before update on public.aoi_items
for each row execute function public.update_updated_at();

alter table public.aoi_items enable row level security;

drop policy if exists "aoi_items_select_authenticated" on public.aoi_items;
drop policy if exists "aoi_items_select_by_role" on public.aoi_items;
create policy "aoi_items_select_by_role"
on public.aoi_items
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and coalesce(u.is_active, true)
      and (
        u.role = 'admin'
        or (
          u.role in ('bpo', 'viewer')
          and u.division_id is not null
          and public.aoi_items.division_id = u.division_id
        )
      )
  )
);

revoke insert, update, delete on table public.aoi_items from anon, authenticated;

create table if not exists public.aoi_monitoring_keterangan (
  id bigserial primary key,
  year integer not null,
  part_id text not null,
  keterangan text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (year, part_id)
);

create index if not exists idx_aoi_monitoring_keterangan_year
  on public.aoi_monitoring_keterangan (year);
create index if not exists idx_aoi_monitoring_keterangan_updated_by
  on public.aoi_monitoring_keterangan (updated_by);

drop trigger if exists aoi_monitoring_keterangan_set_updated_at on public.aoi_monitoring_keterangan;
create trigger aoi_monitoring_keterangan_set_updated_at
before update on public.aoi_monitoring_keterangan
for each row execute function public.update_updated_at();

alter table public.aoi_monitoring_keterangan enable row level security;

drop policy if exists "aoi_monitoring_keterangan_select_authenticated" on public.aoi_monitoring_keterangan;
drop policy if exists "aoi_monitoring_keterangan_select_active_authenticated" on public.aoi_monitoring_keterangan;
create policy "aoi_monitoring_keterangan_select_active_authenticated"
on public.aoi_monitoring_keterangan
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

revoke insert, update, delete on table public.aoi_monitoring_keterangan from anon, authenticated;

commit;

-- Verifikasi table yang dibuat:
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'acgs_assessments',
    'acgs_parts',
    'acgs_sections',
    'acgs_questions',
    'acgs_assessment_answers',
    'acgs_year_summaries',
    'assessment_change_logs',
    'aoi_items',
    'aoi_monitoring_keterangan'
  )
order by table_name;
