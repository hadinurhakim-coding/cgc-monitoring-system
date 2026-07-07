begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create table public.aoi_items (
	uid uuid primary key default gen_random_uuid(),
	year integer not null check (year >= 2000 and year <= 2200),
	item_uid uuid not null references public.acgs_items(uid) on delete cascade,
	assessment_answer_uid uuid not null references public.acgs_assessment_answers(uid) on delete cascade,
	division_id uuid references public.divisions(id) on delete set null,
	sort_order integer,
	area_of_improvement_override text not null default '',
	is_active boolean not null default true,
	created_by uuid references public.users(id) on delete set null,
	updated_by uuid references public.users(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique nulls not distinct (year, item_uid, division_id)
);

create index aoi_items_year_sort_idx
	on public.aoi_items (year, sort_order);

create index aoi_items_item_uid_idx
	on public.aoi_items (item_uid);

create index aoi_items_assessment_answer_uid_idx
	on public.aoi_items (assessment_answer_uid);

create index aoi_items_division_id_idx
	on public.aoi_items (division_id);

create trigger update_aoi_items_updated_at
before update on public.aoi_items
for each row execute function public.update_updated_at();

create table public.aoi_followups (
	uid uuid primary key default gen_random_uuid(),
	aoi_item_uid uuid not null references public.aoi_items(uid) on delete cascade,
	fakta_temuan_override text not null default '',
	tindak_lanjut_rekomendasi text not null default '',
	pic text not null default '',
	status_rekomendasi text not null default 'Belum ditindaklanjuti',
	eviden text not null default '',
	created_by uuid references public.users(id) on delete set null,
	updated_by uuid references public.users(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint aoi_followups_item_unique unique (aoi_item_uid),
	constraint aoi_followups_status_check check (
		status_rekomendasi in (
			'Telah ditindaklanjuti 100%',
			'On Progress',
			'Tidak dapat ditindaklanjuti 100%',
			'Belum ditindaklanjuti'
		)
	)
);

create index aoi_followups_status_idx
	on public.aoi_followups (status_rekomendasi);

create trigger update_aoi_followups_updated_at
before update on public.aoi_followups
for each row execute function public.update_updated_at();

alter table public.aoi_items enable row level security;
alter table public.aoi_followups enable row level security;

create policy "read aoi items authenticated"
on public.aoi_items
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

create policy "read aoi followups authenticated"
on public.aoi_followups
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

revoke insert, update, delete on table public.aoi_items from anon, authenticated;
revoke insert, update, delete on table public.aoi_followups from anon, authenticated;

commit;
