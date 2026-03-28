alter table public.divisions
    alter column id set default gen_random_uuid();

alter table public.divisions
    alter column name type varchar(100);
