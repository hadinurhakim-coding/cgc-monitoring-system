-- Remote-compatible security hardening for the current production schema.
-- This migration avoids assumptions that are not true on remote yet, such as
-- public.acgs_assessments.division_id.

ALTER TABLE public.users
	ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
	ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

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
			AND u.is_active
			AND u.role IN ('admin', 'bpo', 'viewer')
	)
);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.acgs_assessments
	FROM anon, authenticated;

ALTER TABLE public.aoi_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aoi_items_select_authenticated" ON public.aoi_items;
DROP POLICY IF EXISTS "aoi_items_select_by_role" ON public.aoi_items;

CREATE POLICY "aoi_items_select_by_role"
ON public.aoi_items
FOR SELECT
TO authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.users u
		WHERE u.id = (SELECT auth.uid())
			AND u.is_active
			AND (
				u.role = 'admin'
				OR (
					u.role IN ('bpo', 'viewer')
					AND u.division_id IS NOT NULL
					AND public.aoi_items.division_id = u.division_id
				)
			)
	)
);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.aoi_items
	FROM anon, authenticated;

ALTER TABLE public.aoi_monitoring_keterangan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aoi_monitoring_keterangan_select_authenticated" ON public.aoi_monitoring_keterangan;
DROP POLICY IF EXISTS "aoi_monitoring_keterangan_select_active_authenticated" ON public.aoi_monitoring_keterangan;

CREATE POLICY "aoi_monitoring_keterangan_select_active_authenticated"
ON public.aoi_monitoring_keterangan
FOR SELECT
TO authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.users u
		WHERE u.id = (SELECT auth.uid())
			AND u.is_active
			AND u.role = 'admin'
	)
);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.aoi_monitoring_keterangan
	FROM anon, authenticated;

DROP POLICY IF EXISTS "read own login audit" ON public.auth_login_audits;
CREATE POLICY "read own login audit"
ON public.auth_login_audits
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "read own profile" ON public.users;
CREATE POLICY "read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()) AND is_active);

DROP POLICY IF EXISTS "read assessment change logs by role" ON public.assessment_change_logs;
CREATE POLICY "read assessment change logs by role"
ON public.assessment_change_logs
FOR SELECT
TO authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.users u
		WHERE u.id = (SELECT auth.uid())
			AND u.is_active
			AND (
				u.role = 'admin'
				OR (
					u.division_id IS NOT NULL
					AND public.assessment_change_logs.division_id = u.division_id
				)
			)
	)
);

DROP POLICY IF EXISTS "insert assessment change logs by role" ON public.assessment_change_logs;
CREATE POLICY "insert assessment change logs by role"
ON public.assessment_change_logs
FOR INSERT
TO authenticated
WITH CHECK (
	EXISTS (
		SELECT 1
		FROM public.users u
		WHERE u.id = (SELECT auth.uid())
			AND u.is_active
			AND (
				u.role = 'admin'
				OR (
					u.division_id IS NOT NULL
					AND public.assessment_change_logs.division_id = u.division_id
				)
			)
	)
);

CREATE OR REPLACE FUNCTION public.acgs_assessments_audit_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_user_id uuid;
	v_email text;
	v_division uuid;
	v_field text;
	v_old text;
	v_new text;
BEGIN
	v_user_id := NULLIF(current_setting('app.audit_user_id', true), '')::uuid;

	IF v_user_id IS NULL THEN
		RETURN NEW;
	END IF;

	SELECT u.email, u.division_id
	INTO v_email, v_division
	FROM public.users u
	WHERE u.id = v_user_id
		AND u.is_active;

	IF v_email IS NULL THEN
		RETURN NEW;
	END IF;

	FOREACH v_field IN ARRAY ARRAY['status', 'evidence', 'implementation', 'recommendation'] LOOP
		CASE v_field
			WHEN 'status' THEN
				v_old := OLD.status;
				v_new := NEW.status;
			WHEN 'evidence' THEN
				v_old := OLD.evidence;
				v_new := NEW.evidence;
			WHEN 'implementation' THEN
				v_old := OLD.implementation;
				v_new := NEW.implementation;
			WHEN 'recommendation' THEN
				v_old := OLD.recommendation;
				v_new := NEW.recommendation;
		END CASE;

		IF v_old IS DISTINCT FROM v_new THEN
			INSERT INTO public.assessment_change_logs (
				user_id,
				user_email,
				division_id,
				assessment_uid,
				year,
				item_id,
				field,
				old_value,
				new_value
			) VALUES (
				v_user_id,
				v_email,
				v_division,
				NEW.uid,
				NEW.year,
				NEW.item_id,
				v_field,
				v_old,
				v_new
			);
		END IF;
	END LOOP;

	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS acgs_assessments_audit ON public.acgs_assessments;
CREATE TRIGGER acgs_assessments_audit
AFTER UPDATE ON public.acgs_assessments
FOR EACH ROW
EXECUTE FUNCTION public.acgs_assessments_audit_fn();

CREATE OR REPLACE FUNCTION public.save_acgs_assessment_field(
	p_row_uid uuid,
	p_field text,
	p_value text,
	p_user_id uuid,
	p_user_email text,
	p_division_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	v_actor_email text;
	v_actor_role text;
BEGIN
	IF p_field NOT IN ('status', 'evidence', 'implementation', 'recommendation') THEN
		RAISE EXCEPTION 'Field tidak valid: %', p_field;
	END IF;

	SELECT u.email, u.role
	INTO v_actor_email, v_actor_role
	FROM public.users u
	WHERE u.id = p_user_id
		AND u.is_active;

	IF v_actor_email IS NULL THEN
		RAISE EXCEPTION 'User tidak aktif atau tidak ditemukan';
	END IF;

	IF v_actor_role NOT IN ('admin', 'bpo') THEN
		RAISE EXCEPTION 'Izin ditolak';
	END IF;

	PERFORM set_config('app.audit_user_id', p_user_id::text, true);

	UPDATE public.acgs_assessments
	SET
		status = CASE WHEN p_field = 'status' THEN lower(p_value) ELSE status END,
		evidence = CASE WHEN p_field = 'evidence' THEN p_value ELSE evidence END,
		implementation = CASE WHEN p_field = 'implementation' THEN p_value ELSE implementation END,
		recommendation = CASE WHEN p_field = 'recommendation' THEN p_value ELSE recommendation END,
		updated_at = now()
	WHERE uid = p_row_uid;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Row tidak ditemukan: %', p_row_uid;
	END IF;
END;
$$;

ALTER FUNCTION public.handle_new_user()
	SET search_path = '';

ALTER FUNCTION public.rls_auto_enable()
	SET search_path = '';

DO $$
DECLARE
	fn regprocedure;
BEGIN
	FOR fn IN
		SELECT p.oid::regprocedure
		FROM pg_proc p
		JOIN pg_namespace n ON n.oid = p.pronamespace
		WHERE n.nspname = 'public'
			AND p.proname IN (
				'acgs_assessments_audit_fn',
				'handle_new_user',
				'rls_auto_enable',
				'save_acgs_assessment_field',
				'update_updated_at'
			)
	LOOP
		IF to_regrole('anon') IS NOT NULL THEN
			EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
		END IF;
		IF to_regrole('authenticated') IS NOT NULL THEN
			EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
		END IF;
		EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
	END LOOP;

	IF to_regrole('service_role') IS NOT NULL THEN
		EXECUTE 'GRANT EXECUTE ON FUNCTION public.save_acgs_assessment_field(uuid, text, text, uuid, text, uuid) TO service_role';
	END IF;
END;
$$;

UPDATE storage.buckets
SET
	public = false,
	file_size_limit = 15728640,
	allowed_mime_types = ARRAY[
		'application/pdf',
		'image/png',
		'image/jpeg',
		'image/webp'
	]
WHERE id = 'gcg-evidence';

DROP POLICY IF EXISTS "gcg_evidence_insert" ON storage.objects;
DROP POLICY IF EXISTS "gcg_evidence_select" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_evidence_download" ON storage.objects;
DROP POLICY IF EXISTS "service_role_evidence_upload" ON storage.objects;
DROP POLICY IF EXISTS "service_role_evidence_select" ON storage.objects;
DROP POLICY IF EXISTS "service_role_evidence_insert" ON storage.objects;
DROP POLICY IF EXISTS "service_role_evidence_update" ON storage.objects;
DROP POLICY IF EXISTS "service_role_evidence_delete" ON storage.objects;

CREATE POLICY "service_role_evidence_select"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'gcg-evidence');

CREATE POLICY "service_role_evidence_insert"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'gcg-evidence');

CREATE POLICY "service_role_evidence_update"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'gcg-evidence')
WITH CHECK (bucket_id = 'gcg-evidence');

CREATE POLICY "service_role_evidence_delete"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'gcg-evidence');

CREATE INDEX IF NOT EXISTS idx_users_division_id
	ON public.users (division_id);

CREATE INDEX IF NOT EXISTS idx_aoi_items_created_by
	ON public.aoi_items (created_by);

CREATE INDEX IF NOT EXISTS idx_aoi_items_division_id
	ON public.aoi_items (division_id);

CREATE INDEX IF NOT EXISTS idx_aoi_items_updated_by
	ON public.aoi_items (updated_by);

CREATE INDEX IF NOT EXISTS idx_aoi_monitoring_keterangan_updated_by
	ON public.aoi_monitoring_keterangan (updated_by);

CREATE INDEX IF NOT EXISTS idx_assessment_change_logs_assessment_uid
	ON public.assessment_change_logs (assessment_uid);
