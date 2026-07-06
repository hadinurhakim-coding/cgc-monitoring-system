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

create table public.acgs_items (
	uid uuid primary key default gen_random_uuid(),
	type text not null,
	sort_order integer not null,
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
	updated_at timestamptz not null default now(),
	search_vector tsvector generated always as (
		case
			when lower(coalesce(type, '')) in ('question', 'acgs') then
				setweight(to_tsvector('simple', coalesce(item_id, '')), 'A') ||
				setweight(to_tsvector('simple', coalesce(question_en, '')), 'B') ||
				setweight(to_tsvector('simple', coalesce(question_id, '')), 'B')
			else ''::tsvector
		end
	) stored,
	constraint acgs_items_type_check check (
		type in ('level', 'part', 'section', 'subtitle', 'question', 'acgs')
	)
);

create unique index acgs_items_sort_order_key
	on public.acgs_items (sort_order);

create unique index acgs_items_question_item_id_key
	on public.acgs_items (item_id)
	where item_id is not null
	  and item_id <> ''
	  and lower(type) in ('question', 'acgs');

create index acgs_items_type_sort_idx
	on public.acgs_items (type, sort_order);

create index acgs_items_search_vector_gin
	on public.acgs_items using gin (search_vector);

create trigger update_acgs_items_updated_at
before update on public.acgs_items
for each row execute function public.update_updated_at();

create table public.acgs_assessment_answers (
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
	constraint acgs_assessment_answers_status_check check (status in ('', 'YES', 'NO', 'NA')),
	unique nulls not distinct (year, item_uid, division_id)
);

create index acgs_assessment_answers_year_idx
	on public.acgs_assessment_answers (year);

create index acgs_assessment_answers_item_uid_idx
	on public.acgs_assessment_answers (item_uid);

create index acgs_assessment_answers_division_id_idx
	on public.acgs_assessment_answers (division_id);

create trigger update_acgs_assessment_answers_updated_at
before update on public.acgs_assessment_answers
for each row execute function public.update_updated_at();

create table public.acgs_year_summaries (
	year integer primary key,
	question_count integer not null,
	points_sum integer not null,
	score_pct numeric(8, 2) not null,
	payload jsonb not null default '{}'::jsonb,
	updated_at timestamptz not null default now()
);

create trigger update_acgs_year_summaries_updated_at
before update on public.acgs_year_summaries
for each row execute function public.update_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'gcg-evidence',
	'gcg-evidence',
	false,
	15728640,
	array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
	public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

alter table public.acgs_items enable row level security;
alter table public.acgs_assessment_answers enable row level security;
alter table public.acgs_year_summaries enable row level security;

create policy "read acgs items authenticated"
on public.acgs_items
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

create policy "read acgs answers authenticated"
on public.acgs_assessment_answers
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

create policy "read acgs summaries authenticated"
on public.acgs_year_summaries
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

revoke insert, update, delete on table public.acgs_items from anon, authenticated;
revoke insert, update, delete on table public.acgs_assessment_answers from anon, authenticated;
revoke insert, update, delete on table public.acgs_year_summaries from anon, authenticated;

drop policy if exists "authenticated evidence download" on storage.objects;
create policy "authenticated evidence download"
on storage.objects
for select
to authenticated
using (bucket_id = 'gcg-evidence');

commit;
