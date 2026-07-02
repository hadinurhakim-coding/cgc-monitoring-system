-- Fix Supabase advisor: public.acgs_assessments has RLS enabled but no policy.
-- Current flat assessment schema has no division_id column, so direct Data API
-- reads are limited to users registered in public.users. Writes stay server-only.

ALTER TABLE public.acgs_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acgs_assessments_select_registered_users"
	ON public.acgs_assessments;

CREATE POLICY "acgs_assessments_select_registered_users"
ON public.acgs_assessments
FOR SELECT
TO authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.users u
		WHERE u.id = (SELECT auth.uid())
			AND u.role IN ('admin', 'bpo', 'viewer')
	)
);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.acgs_assessments
	FROM anon, authenticated;
