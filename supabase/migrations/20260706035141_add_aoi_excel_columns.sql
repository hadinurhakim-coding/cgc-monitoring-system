-- Align AOI records with the Excel monitoring table shape.
ALTER TABLE public.aoi_items
	ADD COLUMN IF NOT EXISTS aoi_code text NOT NULL DEFAULT '',
	ADD COLUMN IF NOT EXISTS area_of_improvement text NOT NULL DEFAULT '',
	ADD COLUMN IF NOT EXISTS tindak_lanjut_rekomendasi text NOT NULL DEFAULT '';

UPDATE public.aoi_items
SET
	aoi_code = COALESCE(NULLIF(aoi_code, ''), NULLIF(section_id, ''), ''),
	area_of_improvement = COALESCE(NULLIF(area_of_improvement, ''), NULLIF(standar_label, ''), '')
WHERE aoi_code = ''
	OR area_of_improvement = '';

CREATE INDEX IF NOT EXISTS idx_aoi_items_year_aoi_code
	ON public.aoi_items (year, aoi_code);
