-- =============================================================================
-- RLS untuk modul ACGS — JALANKAN DI SUPABASE SQL EDITOR SEBELUM PRODUKSI
-- Aplikasi SvelteKit kini memakai JWT user (createUserServerClient), bukan
-- service role, untuk tabel/storage di bawah. Tanpa policy ini, query akan kosong
-- atau ditolak (RLS enabled) / gagal upload (storage).
-- Sesuaikan nama skema/tabel jika berbeda di proyek Anda.
-- =============================================================================

-- --- Tabel master: semua user terautentikasi boleh baca ---
ALTER TABLE public.acgs_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acgs_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acgs_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acgs_parts_select_auth ON public.acgs_parts;
CREATE POLICY acgs_parts_select_auth ON public.acgs_parts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS acgs_sections_select_auth ON public.acgs_sections;
CREATE POLICY acgs_sections_select_auth ON public.acgs_sections FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS acgs_questions_select_auth ON public.acgs_questions;
CREATE POLICY acgs_questions_select_auth ON public.acgs_questions FOR SELECT TO authenticated USING (true);

-- --- Helper: role admin di public.users ---
-- division_id NULL disamakan antar baris (sama seperti filter aplikasi lama).

ALTER TABLE public.acgs_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acgs_assessment_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acgs_assessments_select ON public.acgs_assessments;
CREATE POLICY acgs_assessments_select ON public.acgs_assessments FOR SELECT TO authenticated USING (
	EXISTS (
		SELECT 1 FROM public.users u
		WHERE u.id = auth.uid()
		AND (
			u.role = 'admin'
			OR acgs_assessments.division_id IS NOT DISTINCT FROM u.division_id
		)
	)
);

DROP POLICY IF EXISTS acgs_assessments_insert ON public.acgs_assessments;
CREATE POLICY acgs_assessments_insert ON public.acgs_assessments FOR INSERT TO authenticated WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.users u
		WHERE u.id = auth.uid()
		AND (
			u.role = 'admin'
			OR acgs_assessments.division_id IS NOT DISTINCT FROM u.division_id
		)
	)
);

DROP POLICY IF EXISTS acgs_assessments_update ON public.acgs_assessments;
CREATE POLICY acgs_assessments_update ON public.acgs_assessments FOR UPDATE TO authenticated USING (
	EXISTS (
		SELECT 1 FROM public.users u
		WHERE u.id = auth.uid()
		AND (
			u.role = 'admin'
			OR acgs_assessments.division_id IS NOT DISTINCT FROM u.division_id
		)
	)
) WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.users u
		WHERE u.id = auth.uid()
		AND (
			u.role = 'admin'
			OR acgs_assessments.division_id IS NOT DISTINCT FROM u.division_id
		)
	)
);

DROP POLICY IF EXISTS acgs_answers_select ON public.acgs_assessment_answers;
CREATE POLICY acgs_answers_select ON public.acgs_assessment_answers FOR SELECT TO authenticated USING (
	EXISTS (
		SELECT 1 FROM public.acgs_assessments a
		JOIN public.users u ON u.id = auth.uid()
		WHERE a.id = acgs_assessment_answers.assessment_id
		AND (u.role = 'admin' OR a.division_id IS NOT DISTINCT FROM u.division_id)
	)
);

DROP POLICY IF EXISTS acgs_answers_insert ON public.acgs_assessment_answers;
CREATE POLICY acgs_answers_insert ON public.acgs_assessment_answers FOR INSERT TO authenticated WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.acgs_assessments a
		JOIN public.users u ON u.id = auth.uid()
		WHERE a.id = acgs_assessment_answers.assessment_id
		AND (u.role = 'admin' OR a.division_id IS NOT DISTINCT FROM u.division_id)
	)
);

DROP POLICY IF EXISTS acgs_answers_update ON public.acgs_assessment_answers;
CREATE POLICY acgs_answers_update ON public.acgs_assessment_answers FOR UPDATE TO authenticated USING (
	EXISTS (
		SELECT 1 FROM public.acgs_assessments a
		JOIN public.users u ON u.id = auth.uid()
		WHERE a.id = acgs_assessment_answers.assessment_id
		AND (u.role = 'admin' OR a.division_id IS NOT DISTINCT FROM u.division_id)
	)
) WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.acgs_assessments a
		JOIN public.users u ON u.id = auth.uid()
		WHERE a.id = acgs_assessment_answers.assessment_id
		AND (u.role = 'admin' OR a.division_id IS NOT DISTINCT FROM u.division_id)
	)
);

-- --- Storage bucket `gcg-evidence` (sesuaikan nama bucket) ---
-- Pastikan bucket sudah ada. Policy di storage.objects:

DROP POLICY IF EXISTS gcg_evidence_insert ON storage.objects;
CREATE POLICY gcg_evidence_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
	bucket_id = 'gcg-evidence'
	AND name LIKE 'assessment/%'
);

DROP POLICY IF EXISTS gcg_evidence_select ON storage.objects;
CREATE POLICY gcg_evidence_select ON storage.objects FOR SELECT TO authenticated
USING (
	bucket_id = 'gcg-evidence'
	AND name LIKE 'assessment/%'
);

-- Tambahkan UPDATE/DELETE jika aplikasi menghapus/mengganti file di storage.
