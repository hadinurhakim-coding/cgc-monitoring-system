-- Full-text search for flat acgs_assessments (question / acgs rows).
-- Requires columns: type, item_id, question_en, question_id.
-- App filters with PostgREST: .textSearch('search_vector', query, { type: 'websearch', config: 'simple' }).

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.tables
		WHERE table_schema = 'public'
			AND table_name = 'acgs_assessments'
	) THEN
		RAISE NOTICE 'acgs_assessments missing; skip search_vector';
		RETURN;
	END IF;

	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'acgs_assessments'
			AND column_name = 'search_vector'
	) THEN
		RETURN;
	END IF;

	ALTER TABLE public.acgs_assessments
		ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
			CASE
				WHEN lower(coalesce(type, '')) IN ('question', 'acgs') THEN
					setweight(to_tsvector('simple', coalesce(item_id, '')), 'A')
					|| setweight(to_tsvector('simple', coalesce(question_en, '')), 'B')
					|| setweight(to_tsvector('simple', coalesce(question_id, '')), 'B')
				ELSE ''::tsvector
			END
		) STORED;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'acgs_assessments'
			AND column_name = 'search_vector'
	) THEN
		RETURN;
	END IF;

	CREATE INDEX IF NOT EXISTS acgs_assessments_search_vector_gin
		ON public.acgs_assessments USING gin (search_vector);

	COMMENT ON COLUMN public.acgs_assessments.search_vector IS
		'Combined FTS for item_id (weight A), question_en / question_id (B); config simple for mixed language.';
END $$;
