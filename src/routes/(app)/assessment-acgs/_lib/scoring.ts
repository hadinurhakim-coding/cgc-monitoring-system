import { canonicalPartIdForAcgsQuestion, isAcgsQuestionRow } from "./acgs-question-utils.js";

/** Baris minimal untuk aturan skor GCG (1 / 0). */
export type GcgScoreRow = {
	type?: string | null;
	status?: string | null;
	evidence?: string | null;
	part_id?: string | null;
	part?: string | null;
	level?: string | null;
	level_label?: string | null;
	item_id?: string | null;
};

function normStatus(s: string | null | undefined): string {
	return String(s ?? "")
		.trim()
		.toLowerCase();
}

export function isAcgsYes(row: GcgScoreRow): boolean {
	const st = normStatus(row.status);
	return st === "yes" || st === "y";
}

export function isAcgsNo(row: GcgScoreRow): boolean {
	const st = normStatus(row.status);
	return st === "no" || st === "n";
}

export function isAcgsNa(row: GcgScoreRow): boolean {
	return normStatus(row.status) === "na";
}

/**
 * Binary point per question (hanya untuk type question/acgs):
 * - 1 jika status N/A
 * - 1 jika status YES/Y
 * - 0 selain itu
 *
 * Nilai ini digunakan untuk `points_sum` di `acgs_year_summaries` (hitungan integer sederhana).
 * Untuk persentase skor tertimbang per bagian, gunakan `computeAcgsSummary` di acgs-summary.server.ts.
 */
export function gcgQuestionPoint(row: GcgScoreRow): 0 | 1 {
	if (!isAcgsQuestionRow(row)) return 0;
	if (isAcgsNa(row) || isAcgsYes(row)) return 1;
	return 0;
}

export function gcgPartLabel(row: GcgScoreRow): string {
	const p = canonicalPartIdForAcgsQuestion(row);
	return p || "Lainnya";
}
