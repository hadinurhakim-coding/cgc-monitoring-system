-- ============================================================================
-- FIX: CRIT-07 — Storage policy untuk evidence bucket
-- FIX: ARCH-07 — Trigger updated_at yang sebelumnya dead column
-- ============================================================================

-- =====================
-- CRIT-07: Storage RLS
-- =====================

-- Authenticated users bisa download evidence files
CREATE POLICY "authenticated_evidence_download"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'gcg-evidence'
);

-- Upload hanya via service_role (explicit policy for defense-in-depth)
CREATE POLICY "service_role_evidence_upload"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (
    bucket_id = 'gcg-evidence'
);

-- =====================
-- ARCH-07: updated_at triggers
-- =====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_assessments
    BEFORE UPDATE ON public.acgs_assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_answers
    BEFORE UPDATE ON public.acgs_assessment_answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_login_audits
    BEFORE UPDATE ON public.auth_login_audits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
