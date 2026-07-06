-- Reset Level 2 (Bonus/Penalti) Assessment ACGS tahun 2024 agar kembali nol.
-- Level 1 tidak disentuh.

begin;

update public.acgs_assessments
set
  implementation = '',
  evidence = '',
  status = '',
  recommendation = '',
  notes = null,
  updated_at = now()
where year = 2024
  and (
    item_id like '(B)%'
    or item_id like '(P)%'
    or part_id like 'PART (B)%'
    or part_id like 'PART (P)%'
  );

delete from public.aoi_items
where year = 2024
  and (
    section_id like '(B)%'
    or section_id like '(P)%'
    or part_id like 'PART (B)%'
    or part_id like 'PART (P)%'
    or level_label ilike '%LEVEL 2%'
  );

delete from public.acgs_year_summaries
where year = 2024;

commit;

-- Verifikasi Level 2 sudah nol/kosong:
select
  count(*) as total_level_2,
  count(*) filter (where lower(coalesce(status, '')) in ('yes', 'y')) as ya,
  count(*) filter (where lower(coalesce(status, '')) in ('no', 'n')) as tidak,
  count(*) filter (where lower(coalesce(status, '')) = 'na') as na
from public.acgs_assessments
where year = 2024
  and (
    item_id like '(B)%'
    or item_id like '(P)%'
    or part_id like 'PART (B)%'
    or part_id like 'PART (P)%'
  );
