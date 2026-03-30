-- ============================================================================
-- FASE 1: ENABLE ROW LEVEL SECURITY (RLS) PADA SEMUA TABEL
-- ============================================================================
-- FIX: CRIT-01 — Semua tabel data utama TIDAK memiliki RLS aktif.
-- 
-- Tanpa RLS, seluruh data terekspos melalui Supabase anon_key (public key).
-- Policy-policy yang sudah didefinisikan di migration 20260328164000
-- adalah DEAD CODE karena RLS belum di-enable. Migration ini mengaktifkan
-- RLS sehingga policy-policy tersebut menjadi aktif.
--
-- CATATAN: auth_login_audits sudah memiliki RLS enabled dari migration
-- sebelumnya, sehingga tidak perlu di-enable ulang.
-- ============================================================================

-- 1. Tabel users — data profil pengguna (email, role, division_id)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Tabel divisions — data divisi organisasi
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- 3. Tabel acgs_parts — master data Part ACGS (A, B, C, D, E)
ALTER TABLE public.acgs_parts ENABLE ROW LEVEL SECURITY;

-- 4. Tabel acgs_sections — master data Section per Part
ALTER TABLE public.acgs_sections ENABLE ROW LEVEL SECURITY;

-- 5. Tabel acgs_questions — master data pertanyaan assessment
ALTER TABLE public.acgs_questions ENABLE ROW LEVEL SECURITY;

-- 6. Tabel acgs_assessments — data assessment per tahun per divisi
ALTER TABLE public.acgs_assessments ENABLE ROW LEVEL SECURITY;

-- 7. Tabel acgs_assessment_answers — jawaban assessment per pertanyaan
ALTER TABLE public.acgs_assessment_answers ENABLE ROW LEVEL SECURITY;
