create table if not exists public.auth_login_audits (
    user_id uuid primary key references public.users(id) on delete cascade,
    email text not null,
    provider varchar(30) not null default 'magic_link',
    last_login_at timestamptz not null default now(),
    ip_address inet,
    user_agent text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.auth_login_audits enable row level security;

drop policy if exists "read own login audit" on public.auth_login_audits;
create policy "read own login audit"
on public.auth_login_audits
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "read own profile" on public.users;
create policy "read own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "read divisions for authenticated" on public.divisions;
create policy "read divisions for authenticated"
on public.divisions
for select
to authenticated
using (true);

drop policy if exists "read acgs parts for authenticated" on public.acgs_parts;
create policy "read acgs parts for authenticated"
on public.acgs_parts
for select
to authenticated
using (true);

drop policy if exists "read acgs sections for authenticated" on public.acgs_sections;
create policy "read acgs sections for authenticated"
on public.acgs_sections
for select
to authenticated
using (true);

drop policy if exists "read acgs questions for authenticated" on public.acgs_questions;
create policy "read acgs questions for authenticated"
on public.acgs_questions
for select
to authenticated
using (true);

drop policy if exists "read own assessments" on public.acgs_assessments;
create policy "read own assessments"
on public.acgs_assessments
for select
to authenticated
using (
    division_id is null
    or division_id in (
        select u.division_id
        from public.users u
        where u.id = auth.uid()
    )
);

drop policy if exists "insert own assessments" on public.acgs_assessments;
create policy "insert own assessments"
on public.acgs_assessments
for insert
to authenticated
with check (
    division_id in (
        select u.division_id
        from public.users u
        where u.id = auth.uid()
    )
);

drop policy if exists "update own assessments" on public.acgs_assessments;
create policy "update own assessments"
on public.acgs_assessments
for update
to authenticated
using (
    division_id in (
        select u.division_id
        from public.users u
        where u.id = auth.uid()
    )
)
with check (
    division_id in (
        select u.division_id
        from public.users u
        where u.id = auth.uid()
    )
);

drop policy if exists "read own assessment answers" on public.acgs_assessment_answers;
create policy "read own assessment answers"
on public.acgs_assessment_answers
for select
to authenticated
using (
    exists (
        select 1
        from public.acgs_assessments a
        join public.users u on u.id = auth.uid()
        where a.id = acgs_assessment_answers.assessment_id
          and (a.division_id = u.division_id or a.division_id is null)
    )
);

drop policy if exists "insert own assessment answers" on public.acgs_assessment_answers;
create policy "insert own assessment answers"
on public.acgs_assessment_answers
for insert
to authenticated
with check (
    exists (
        select 1
        from public.acgs_assessments a
        join public.users u on u.id = auth.uid()
        where a.id = acgs_assessment_answers.assessment_id
          and a.division_id = u.division_id
    )
);

drop policy if exists "update own assessment answers" on public.acgs_assessment_answers;
create policy "update own assessment answers"
on public.acgs_assessment_answers
for update
to authenticated
using (
    exists (
        select 1
        from public.acgs_assessments a
        join public.users u on u.id = auth.uid()
        where a.id = acgs_assessment_answers.assessment_id
          and a.division_id = u.division_id
    )
)
with check (
    exists (
        select 1
        from public.acgs_assessments a
        join public.users u on u.id = auth.uid()
        where a.id = acgs_assessment_answers.assessment_id
          and a.division_id = u.division_id
    )
);
