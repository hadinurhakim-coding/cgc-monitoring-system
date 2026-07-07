begin;

create table if not exists public.aoi_monitoring_keterangan (
	uid uuid primary key default gen_random_uuid(),
	year integer not null check (year >= 2000 and year <= 2200),
	part_id text not null,
	keterangan text not null default '',
	updated_by uuid references public.users(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint aoi_monitoring_keterangan_year_part_unique unique (year, part_id)
);

create index if not exists acgs_assessment_answers_year_division_item_idx
	on public.acgs_assessment_answers (year, division_id, item_uid);

create index if not exists acgs_assessment_answers_recommendation_aoi_idx
	on public.acgs_assessment_answers (year, division_id, item_uid)
	where recommendation is not null and recommendation <> '';

create index if not exists aoi_items_active_year_division_sort_idx
	on public.aoi_items (year, division_id, sort_order)
	where is_active;

create index if not exists aoi_followups_item_status_idx
	on public.aoi_followups (aoi_item_uid, status_rekomendasi);

create index if not exists aoi_monitoring_keterangan_year_part_idx
	on public.aoi_monitoring_keterangan (year, part_id);

do $$
begin
	if not exists (
		select 1
		from pg_trigger
		where tgname = 'update_aoi_monitoring_keterangan_updated_at'
	) then
		create trigger update_aoi_monitoring_keterangan_updated_at
		before update on public.aoi_monitoring_keterangan
		for each row execute function public.update_updated_at();
	end if;
end;
$$;

alter table public.aoi_monitoring_keterangan enable row level security;

drop policy if exists "read aoi monitoring keterangan authenticated"
	on public.aoi_monitoring_keterangan;

create policy "read aoi monitoring keterangan authenticated"
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
