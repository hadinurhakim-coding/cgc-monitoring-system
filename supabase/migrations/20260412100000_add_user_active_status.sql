alter table public.users
	add column if not exists is_active boolean not null default true,
	add column if not exists updated_at timestamptz not null default now();

do $$
begin
	if exists (
		select 1
		from pg_proc p
		join pg_namespace n on n.oid = p.pronamespace
		where n.nspname = 'public'
			and p.proname = 'update_updated_at'
	) then
		drop trigger if exists update_users_updated_at on public.users;
		create trigger update_users_updated_at
			before update on public.users
			for each row
			execute function public.update_updated_at();
	end if;
end $$;
