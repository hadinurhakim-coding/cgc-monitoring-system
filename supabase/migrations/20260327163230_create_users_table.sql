create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    full_name text,
    division_id uuid references public.divisions(id) on delete set null,
    role varchar(20) default 'bpo',                  -- 'admin', 'bpo', 'viewer'
    created_at timestamptz default now()
);
