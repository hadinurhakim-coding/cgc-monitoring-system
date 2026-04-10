-- ================================================================
-- Trigger audit otomatis + RPC atomik untuk acgs_assessments.
-- Audit log ditulis langsung oleh database — tidak bisa di-bypass.
-- ================================================================

-- 1. Trigger function: baca konteks dari session var, catat field yang berubah
CREATE OR REPLACE FUNCTION public.acgs_assessments_audit_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid;
  v_email    text;
  v_division uuid;
  v_field    text;
  v_old      text;
  v_new      text;
BEGIN
  v_user_id  := NULLIF(current_setting('app.audit_user_id',     true), '')::uuid;
  v_email    :=        current_setting('app.audit_user_email',  true);
  v_division := NULLIF(current_setting('app.audit_division_id', true), '')::uuid;

  -- Tanpa konteks user (misal edit langsung di DB), lewati saja
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Catat setiap field yang benar-benar berubah
  FOREACH v_field IN ARRAY ARRAY['status','evidence','implementation','recommendation'] LOOP
    CASE v_field
      WHEN 'status'         THEN v_old := OLD.status;         v_new := NEW.status;
      WHEN 'evidence'       THEN v_old := OLD.evidence;       v_new := NEW.evidence;
      WHEN 'implementation' THEN v_old := OLD.implementation; v_new := NEW.implementation;
      WHEN 'recommendation' THEN v_old := OLD.recommendation; v_new := NEW.recommendation;
    END CASE;

    IF v_old IS DISTINCT FROM v_new THEN
      INSERT INTO public.assessment_change_logs (
        user_id, user_email, division_id,
        assessment_uid, year, item_id,
        field, old_value, new_value
      ) VALUES (
        v_user_id, COALESCE(v_email, ''), v_division,
        NEW.uid, NEW.year, NEW.item_id,
        v_field, v_old, v_new
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 2. Pasang trigger (DROP dulu agar migration idempoten)
DROP TRIGGER IF EXISTS acgs_assessments_audit ON public.acgs_assessments;
CREATE TRIGGER acgs_assessments_audit
  AFTER UPDATE ON public.acgs_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.acgs_assessments_audit_fn();

-- 3. RPC: set konteks + update dalam satu transaksi (atomik)
CREATE OR REPLACE FUNCTION public.save_acgs_assessment_field(
  p_row_uid     uuid,
  p_field       text,
  p_value       text,
  p_user_id     uuid,
  p_user_email  text,
  p_division_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_field NOT IN ('status','evidence','implementation','recommendation') THEN
    RAISE EXCEPTION 'Field tidak valid: %', p_field;
  END IF;

  -- Set konteks audit; true = LOCAL (scoped ke transaksi ini)
  -- Trigger AFTER UPDATE akan membaca nilai ini saat firing
  PERFORM set_config('app.audit_user_id',    p_user_id::text,                    true);
  PERFORM set_config('app.audit_user_email', COALESCE(p_user_email, ''),         true);
  PERFORM set_config('app.audit_division_id',COALESCE(p_division_id::text, ''), true);

  UPDATE public.acgs_assessments
  SET
    status         = CASE WHEN p_field = 'status'         THEN lower(p_value) ELSE status         END,
    evidence       = CASE WHEN p_field = 'evidence'       THEN p_value        ELSE evidence       END,
    implementation = CASE WHEN p_field = 'implementation' THEN p_value        ELSE implementation END,
    recommendation = CASE WHEN p_field = 'recommendation' THEN p_value        ELSE recommendation END,
    updated_at     = now()
  WHERE uid = p_row_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Row tidak ditemukan: %', p_row_uid;
  END IF;
END;
$$;

-- 4. Enable Realtime untuk tabel audit log
-- (Supabase: tambahkan ke publication agar postgres_changes bekerja)
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_change_logs;
