-- Snapshot ringkasan skor GCG per tahun (sinkron dengan computeAssessmentSummaryMetrics di app).

CREATE TABLE IF NOT EXISTS public.acgs_year_summaries (
	year integer PRIMARY KEY,
	question_count integer NOT NULL,
	points_sum integer NOT NULL,
	score_pct numeric(8, 2) NOT NULL,
	payload jsonb NOT NULL DEFAULT '{}'::jsonb,
	updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.acgs_year_summaries IS
	'Cache ringkasan assessment ACGS per tahun; diisi oleh server (service role).';

ALTER TABLE public.acgs_year_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read acgs year summaries authenticated" ON public.acgs_year_summaries;
CREATE POLICY "read acgs year summaries authenticated"
	ON public.acgs_year_summaries
	FOR SELECT
	TO authenticated
	USING (true);
