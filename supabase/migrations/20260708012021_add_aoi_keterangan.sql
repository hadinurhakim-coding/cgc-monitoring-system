begin;

alter table public.aoi_followups
	add column if not exists keterangan text not null default '';

commit;
