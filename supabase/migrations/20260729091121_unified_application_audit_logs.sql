begin;

create table if not exists public.application_audit_logs (
	id bigint generated always as identity primary key,
	created_at timestamptz not null default now(),
	actor_user_id uuid references public.users(id) on delete set null,
	actor_email text not null default '',
	actor_role text,
	division_id uuid references public.divisions(id) on delete set null,
	page_path text not null,
	action text not null,
	entity_type text not null,
	entity_id text not null,
	entity_label text,
	year integer not null check (year >= 2000 and year <= 2200),
	field text not null,
	old_value text,
	new_value text,
	metadata jsonb not null default '{}'::jsonb,
	constraint application_audit_logs_page_path_check check (
		page_path in ('/assessment-acgs', '/area-of-improvement', '/monitoring-aoi')
	),
	constraint application_audit_logs_action_check check (action in ('create', 'update', 'delete'))
);

create index if not exists application_audit_logs_year_created_idx
	on public.application_audit_logs (year, created_at desc);

create index if not exists application_audit_logs_division_year_created_idx
	on public.application_audit_logs (division_id, year, created_at desc);

create index if not exists application_audit_logs_actor_user_id_idx
	on public.application_audit_logs (actor_user_id);

alter table public.acgs_assessment_answers
	add column if not exists audit_field text;

alter table public.aoi_followups
	add column if not exists audit_field text;

alter table public.aoi_monitoring_keterangan
	add column if not exists audit_field text;

create or replace function public.capture_assessment_answer_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
	v_actor_user_id uuid;
	v_actor_email text := '';
	v_actor_role text;
	v_actor_division_id uuid;
	v_item_id text;
	v_old_value text;
	v_new_value text;
	v_action text;
begin
	if new.audit_field is null
		or new.audit_field not in ('implementation', 'evidence', 'status', 'recommendation') then
		return new;
	end if;

	v_actor_user_id := coalesce(new.updated_by, new.created_by);
	select u.email, u.role, u.division_id
	into v_actor_email, v_actor_role, v_actor_division_id
	from public.users u
	where u.id = v_actor_user_id;

	select i.item_id
	into v_item_id
	from public.acgs_items i
	where i.uid = new.item_uid;

	v_new_value := to_jsonb(new) ->> new.audit_field;
	v_action := case when tg_op = 'INSERT' then 'create' else 'update' end;

	if tg_op = 'UPDATE' then
		v_old_value := to_jsonb(old) ->> new.audit_field;
		if v_new_value is not distinct from v_old_value then
			return new;
		end if;
	end if;

	insert into public.application_audit_logs (
		actor_user_id,
		actor_email,
		actor_role,
		division_id,
		page_path,
		action,
		entity_type,
		entity_id,
		entity_label,
		year,
		field,
		old_value,
		new_value,
		metadata
	)
	values (
		v_actor_user_id,
		coalesce(v_actor_email, ''),
		v_actor_role,
		coalesce(new.division_id, v_actor_division_id),
		'/assessment-acgs',
		v_action,
		'assessment_answer',
		new.uid::text,
		v_item_id,
		new.year,
		new.audit_field,
		v_old_value,
		v_new_value,
		jsonb_build_object('item_uid', new.item_uid, 'change_origin', 'user')
	);

	if tg_op = 'UPDATE'
		and new.audit_field = 'status'
		and new.recommendation is distinct from old.recommendation then
		insert into public.application_audit_logs (
			actor_user_id,
			actor_email,
			actor_role,
			division_id,
			page_path,
			action,
			entity_type,
			entity_id,
			entity_label,
			year,
			field,
			old_value,
			new_value,
			metadata
		)
		values (
			v_actor_user_id,
			coalesce(v_actor_email, ''),
			v_actor_role,
			coalesce(new.division_id, v_actor_division_id),
			'/assessment-acgs',
			'update',
			'assessment_answer',
			new.uid::text,
			v_item_id,
			new.year,
			'recommendation',
			old.recommendation,
			new.recommendation,
			jsonb_build_object('item_uid', new.item_uid, 'change_origin', 'status_rule')
		);
	end if;

	return new;
end;
$$;

create or replace function public.capture_aoi_followup_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
	v_actor_user_id uuid;
	v_actor_email text := '';
	v_actor_role text;
	v_actor_division_id uuid;
	v_year integer;
	v_division_id uuid;
	v_item_id text;
	v_column text;
	v_old_value text;
	v_new_value text;
	v_action text;
begin
	v_column := case new.audit_field
		when 'fakta_temuan' then 'fakta_temuan_override'
		when 'tindak_lanjut_rekomendasi' then 'tindak_lanjut_rekomendasi'
		when 'pic' then 'pic'
		when 'target_waktu_penyelesaian' then 'target_waktu_penyelesaian'
		when 'status_rekomendasi' then 'status_rekomendasi'
		when 'eviden' then 'eviden'
		when 'keterangan' then 'keterangan'
		else null
	end;

	if v_column is null then
		return new;
	end if;

	v_actor_user_id := coalesce(new.updated_by, new.created_by);
	select u.email, u.role, u.division_id
	into v_actor_email, v_actor_role, v_actor_division_id
	from public.users u
	where u.id = v_actor_user_id;

	select ai.year, ai.division_id, i.item_id
	into v_year, v_division_id, v_item_id
	from public.aoi_items ai
	join public.acgs_items i on i.uid = ai.item_uid
	where ai.uid = new.aoi_item_uid;

	v_new_value := to_jsonb(new) ->> v_column;
	v_action := case when tg_op = 'INSERT' then 'create' else 'update' end;

	if tg_op = 'UPDATE' then
		v_old_value := to_jsonb(old) ->> v_column;
		if v_new_value is not distinct from v_old_value then
			return new;
		end if;
	end if;

	insert into public.application_audit_logs (
		actor_user_id,
		actor_email,
		actor_role,
		division_id,
		page_path,
		action,
		entity_type,
		entity_id,
		entity_label,
		year,
		field,
		old_value,
		new_value,
		metadata
	)
	values (
		v_actor_user_id,
		coalesce(v_actor_email, ''),
		v_actor_role,
		coalesce(v_division_id, v_actor_division_id),
		'/area-of-improvement',
		v_action,
		'aoi_followup',
		new.aoi_item_uid::text,
		v_item_id,
		v_year,
		new.audit_field,
		v_old_value,
		v_new_value,
		jsonb_build_object('followup_uid', new.uid, 'change_origin', 'user')
	);

	return new;
end;
$$;

create or replace function public.capture_monitoring_aoi_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
	v_actor_email text := '';
	v_actor_role text;
	v_actor_division_id uuid;
	v_old_value text;
	v_action text;
begin
	if new.audit_field is distinct from 'keterangan' then
		return new;
	end if;

	select u.email, u.role, u.division_id
	into v_actor_email, v_actor_role, v_actor_division_id
	from public.users u
	where u.id = new.updated_by;

	v_action := case when tg_op = 'INSERT' then 'create' else 'update' end;
	if tg_op = 'UPDATE' then
		v_old_value := old.keterangan;
		if new.keterangan is not distinct from old.keterangan then
			return new;
		end if;
	end if;

	insert into public.application_audit_logs (
		actor_user_id,
		actor_email,
		actor_role,
		division_id,
		page_path,
		action,
		entity_type,
		entity_id,
		entity_label,
		year,
		field,
		old_value,
		new_value,
		metadata
	)
	values (
		new.updated_by,
		coalesce(v_actor_email, ''),
		v_actor_role,
		v_actor_division_id,
		'/monitoring-aoi',
		v_action,
		'aoi_monitoring',
		new.uid::text,
		new.part_id,
		new.year,
		'keterangan',
		v_old_value,
		new.keterangan,
		jsonb_build_object('part_id', new.part_id, 'change_origin', 'user')
	);

	return new;
end;
$$;

drop trigger if exists capture_assessment_answer_audit on public.acgs_assessment_answers;
create trigger capture_assessment_answer_audit
after insert or update on public.acgs_assessment_answers
for each row execute function public.capture_assessment_answer_audit();

drop trigger if exists capture_aoi_followup_audit on public.aoi_followups;
create trigger capture_aoi_followup_audit
after insert or update on public.aoi_followups
for each row execute function public.capture_aoi_followup_audit();

drop trigger if exists capture_monitoring_aoi_audit on public.aoi_monitoring_keterangan;
create trigger capture_monitoring_aoi_audit
after insert or update on public.aoi_monitoring_keterangan
for each row execute function public.capture_monitoring_aoi_audit();

revoke execute on function public.capture_assessment_answer_audit() from public, anon, authenticated;
revoke execute on function public.capture_aoi_followup_audit() from public, anon, authenticated;
revoke execute on function public.capture_monitoring_aoi_audit() from public, anon, authenticated;

alter table public.application_audit_logs enable row level security;

drop policy if exists "read application audit logs by scope" on public.application_audit_logs;
create policy "read application audit logs by scope"
on public.application_audit_logs
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
				and u.division_id = application_audit_logs.division_id
			)
		  )
	)
);

revoke all on table public.application_audit_logs from anon;
revoke insert, update, delete, truncate, references, trigger on table public.application_audit_logs from authenticated;
grant select on table public.application_audit_logs to authenticated;

do $$
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
		and not exists (
			select 1
			from pg_publication_tables
			where pubname = 'supabase_realtime'
			  and schemaname = 'public'
			  and tablename = 'application_audit_logs'
		) then
		alter publication supabase_realtime add table public.application_audit_logs;
	end if;
end;
$$;

do $$
begin
	if to_regclass('public.assessment_change_logs') is not null then
		execute $backfill$
			insert into public.application_audit_logs (
				created_at,
				actor_user_id,
				actor_email,
				actor_role,
				division_id,
				page_path,
				action,
				entity_type,
				entity_id,
				entity_label,
				year,
				field,
				old_value,
				new_value,
				metadata
			)
			select
				legacy.created_at,
				legacy.user_id,
				coalesce(legacy.user_email, ''),
				u.role,
				legacy.division_id,
				'/assessment-acgs',
				'update',
				'assessment_answer',
				legacy.assessment_uid::text,
				legacy.item_id,
				legacy.year,
				legacy.field,
				legacy.old_value,
				legacy.new_value,
				jsonb_build_object('legacy_assessment_change_log_id', legacy.id)
			from public.assessment_change_logs legacy
			left join public.users u on u.id = legacy.user_id
			where not exists (
				select 1
				from public.application_audit_logs existing
				where existing.metadata ->> 'legacy_assessment_change_log_id' = legacy.id::text
			)
		$backfill$;
	end if;
end;
$$;

commit;
