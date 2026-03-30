-- ============================================================================
-- FASE 6: CREATE EVIDENCE BUCKET MIGRATION
-- ============================================================================
-- FIX: ARCH-02 — ensureEvidenceBucket() sebelumnya dipanggil di runtime 
-- di setiap request upload file. Ini membuang ~50ms per upload dan merupakan
-- hak ases yang tidak perlu di production.
--
-- Selain itu, nama bucket diperbaiki dari typo "evidance" menjadi "evidence" (SMELL-04).
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gcg-evidence',
    'gcg-evidence',
    false,
    15728640, -- 15 MB
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    file_size_limit = EXCLUDED.file_size_limit;
