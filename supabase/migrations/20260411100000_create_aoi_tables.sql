-- =============================================================
-- MIGRATION: create aoi_items & aoi_monitoring_keterangan
-- =============================================================

-- Pastikan fungsi trigger updated_at tersedia (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tabel utama AOI
CREATE TABLE IF NOT EXISTS public.aoi_items (
  uid                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  year                 integer     NOT NULL,
  sort_order           integer,
  division_id          uuid        REFERENCES public.divisions(id) ON DELETE SET NULL,
  level_label          text        NOT NULL DEFAULT '',
  part_id              text        NOT NULL DEFAULT '',
  section_id           text        NOT NULL DEFAULT '',
  standar_label        text        NOT NULL DEFAULT '',
  fakta_temuan         text        NOT NULL DEFAULT '',
  rekomendasi          text        NOT NULL DEFAULT '',
  pic                  text        NOT NULL DEFAULT '',
  status_rekomendasi   text        NOT NULL DEFAULT 'Belum ditindak-lanjuti'
    CHECK (status_rekomendasi IN (
      'Selesai ditindak-lanjuti',
      'On Progress',
      'Tidak dapat ditindak-lanjuti 100%',
      'Belum ditindak-lanjuti'
    )),
  eviden               text        NOT NULL DEFAULT '',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by           uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_aoi_items_year_sort
  ON public.aoi_items (year, sort_order NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_aoi_items_year_section
  ON public.aoi_items (year, section_id);

CREATE TRIGGER aoi_items_set_updated_at
  BEFORE UPDATE ON public.aoi_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.aoi_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aoi_items_select_authenticated"
  ON public.aoi_items FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================
-- Tabel keterangan monitoring per part per tahun
-- =============================================================

CREATE TABLE IF NOT EXISTS public.aoi_monitoring_keterangan (
  id           bigserial   PRIMARY KEY,
  year         integer     NOT NULL,
  part_id      text        NOT NULL,
  keterangan   text        NOT NULL DEFAULT '',
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (year, part_id)
);

CREATE INDEX IF NOT EXISTS idx_aoi_monitoring_keterangan_year
  ON public.aoi_monitoring_keterangan (year);

CREATE TRIGGER aoi_monitoring_keterangan_set_updated_at
  BEFORE UPDATE ON public.aoi_monitoring_keterangan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.aoi_monitoring_keterangan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aoi_monitoring_keterangan_select_authenticated"
  ON public.aoi_monitoring_keterangan FOR SELECT
  TO authenticated
  USING (true);
