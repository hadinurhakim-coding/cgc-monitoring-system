begin;

alter table public.aoi_followups
	add column if not exists target_waktu_penyelesaian date;

create index if not exists aoi_followups_target_waktu_idx
	on public.aoi_followups (target_waktu_penyelesaian);

commit;
