-- Audit log perubahan untuk Assessment ACGS.
-- Menyimpan "siapa mengubah apa, kapan" untuk kebutuhan Dashboard.

CREATE TABLE IF NOT EXISTS public.assessment_change_logs (
	id bigserial PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT now(),

	user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	user_email text NOT NULL,
	division_id uuid NULL REFERENCES public.divisions(id) ON DELETE SET NULL,

	assessment_uid uuid NOT NULL REFERENCES public.acgs_assessments(uid) ON DELETE CASCADE,
	year integer NOT NULL,
	item_id text NULL,

	field text NOT NULL,
	old_value text NULL,
	new_value text NULL
);

COMMENT ON TABLE public.assessment_change_logs IS
	'Audit log perubahan assessment ACGS (siapa mengubah apa, kapan), untuk dashboard.';

COMMENT ON COLUMN public.assessment_change_logs.field IS
	'Nama kolom yang berubah (implementation/evidence/status/recommendation).';

COMMENT ON COLUMN public.assessment_change_logs.old_value IS
	'Nilai sebelum perubahan (disimpan sebagai text).';

COMMENT ON COLUMN public.assessment_change_logs.new_value IS
	'Nilai setelah perubahan (disimpan sebagai text).';

CREATE INDEX IF NOT EXISTS idx_assessment_change_logs_created_at
	ON public.assessment_change_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_change_logs_year_created_at
	ON public.assessment_change_logs (year, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_change_logs_division_created_at
	ON public.assessment_change_logs (division_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_change_logs_user_id_created_at
	ON public.assessment_change_logs (user_id, created_at DESC);

ALTER TABLE public.assessment_change_logs ENABLE ROW LEVEL SECURITY;

-- Read:
-- - admin: semua
-- - bpo/viewer: hanya divisi sendiri
DROP POLICY IF EXISTS "read assessment change logs by role" ON public.assessment_change_logs;
CREATE POLICY "read assessment change logs by role"
	ON public.assessment_change_logs
	FOR SELECT
	TO authenticated
	USING (
		EXISTS (
			SELECT 1
			FROM public.users u
			WHERE u.id = auth.uid()
			  AND (
				u.role = 'admin'
				OR (u.division_id IS NOT NULL AND assessment_change_logs.division_id = u.division_id)
			  )
		)
	);

-- Insert:
-- - server memakai service role (bypass RLS), tapi tetap beri policy untuk completeness.
DROP POLICY IF EXISTS "insert assessment change logs by role" ON public.assessment_change_logs;
CREATE POLICY "insert assessment change logs by role"
	ON public.assessment_change_logs
	FOR INSERT
	TO authenticated
	WITH CHECK (
		EXISTS (
			SELECT 1
			FROM public.users u
			WHERE u.id = auth.uid()
			  AND (
				u.role = 'admin'
				OR (u.division_id IS NOT NULL AND assessment_change_logs.division_id = u.division_id)
			  )
		)
	);

