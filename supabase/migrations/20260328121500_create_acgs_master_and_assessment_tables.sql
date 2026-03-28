create table public.acgs_parts (
    code varchar(10) primary key,
    title_en text not null,
    title_id text not null,
    sort_order integer not null unique,
    created_at timestamptz not null default now()
);

create table public.acgs_sections (
    id uuid primary key default gen_random_uuid(),
    part_code varchar(10) not null references public.acgs_parts(code) on delete restrict,
    code varchar(20) not null unique,
    title_en text not null,
    title_id text not null,
    sort_order integer not null,
    created_at timestamptz not null default now(),
    unique(part_code, sort_order)
);

create table public.acgs_questions (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references public.acgs_sections(id) on delete cascade,
    code varchar(20) not null unique,
    question_en text not null,
    question_id text not null,
    sort_order integer not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(section_id, sort_order)
);

create type public.acgs_yes_no_status as enum ('yes', 'no', 'na');

create table public.acgs_assessments (
    id uuid primary key default gen_random_uuid(),
    year integer not null check (year >= 2000 and year <= 2200),
    division_id uuid references public.divisions(id) on delete set null,
    status varchar(20) not null default 'draft' check (status in ('draft', 'submitted', 'approved')),
    created_by uuid references public.users(id) on delete set null,
    updated_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(year, division_id)
);

create table public.acgs_assessment_answers (
    id uuid primary key default gen_random_uuid(),
    assessment_id uuid not null references public.acgs_assessments(id) on delete cascade,
    question_id uuid not null references public.acgs_questions(id) on delete cascade,
    implementation text,
    evidence text,
    status public.acgs_yes_no_status,
    recommendation text,
    notes text,
    updated_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(assessment_id, question_id)
);

create index acgs_sections_part_code_idx on public.acgs_sections(part_code, sort_order);
create index acgs_questions_section_id_idx on public.acgs_questions(section_id, sort_order);
create index acgs_answers_assessment_id_idx on public.acgs_assessment_answers(assessment_id);
