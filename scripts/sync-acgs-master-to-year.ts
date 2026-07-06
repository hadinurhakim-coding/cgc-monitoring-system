/**
 * Backward-compatible wrapper.
 *
 * Schema normalized tidak lagi menyinkronkan master per tahun. Master ACGS
 * disimpan sekali di `public.acgs_items`, sedangkan jawaban tahunan berada di
 * `public.acgs_assessment_answers`.
 */
import "./seed-db.js";
