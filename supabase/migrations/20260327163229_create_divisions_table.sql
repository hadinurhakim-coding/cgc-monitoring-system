create table public.divisions (
    id uuid primary key,
    name text not null unique,
    created_at timestamptz default now()
);
