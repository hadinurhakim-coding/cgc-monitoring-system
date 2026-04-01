-- Level 2 BONUS: part/subsection labels and (B)A.1 descriptor before (B)A.1.1.
-- Safe to re-run: skips insert if (B)A.1 already exists.

update public.acgs_parts
set
	title_en = 'LEVEL 2 (BONUS ITEMS)',
	title_id = 'LEVEL 2 (ITEM BONUS)'
where code = 'BONUS';

update public.acgs_sections
set
	title_en = 'RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS',
	title_id = 'HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM'
where part_code = 'BONUS' and code = '(B)A';

update public.acgs_sections
set title_id = 'BONUS - Pengungkapan dan Transparansi'
where part_code = 'BONUS' and code = '(B)C';

update public.acgs_questions
set sort_order = 3
where code = '(B)A.2.1';

update public.acgs_questions
set sort_order = 2
where code = '(B)A.1.1';

insert into public.acgs_questions (section_id, code, question_en, question_id, sort_order, is_active)
select
	s.id,
	'(B)A.1',
	'Right to participate effectively in and vote in general shareholders meeting and should be informed of the rules, including voting procedures, that govern general shareholders meeting.',
	'Hak untuk berpartisipasi secara efektif dan memberikan suara dalam Rapat Umum Pemegang Saham dan harus diberitahu terkait aturan, termasuk prosedur pemungutan suara, yang mengatur Rapat Umum Pemegang Saham.',
	1,
	true
from public.acgs_sections s
where s.part_code = 'BONUS' and s.code = '(B)A'
on conflict (code) do nothing;
