import { canonicalPartIdForAcgsQuestion, isAcgsQuestionRow } from "./acgs-defaults.js";

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

function normEvidence(s: string | null | undefined): string {
	return String(s ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Skor per pertanyaan (hanya untuk type question/acgs):
 * - 1 jika status N/A
 * - 1 jika status YES/Y dan evidence terisi
 * - 0 selain itu
 */
export function gcgQuestionPoint(row: GcgScoreRow): 0 | 1 {
	if (!isAcgsQuestionRow(row)) return 0;
	const st = normStatus(row.status);
	if (st === "na") return 1;
	if (st === "yes" || st === "y") {
		return normEvidence(row.evidence) ? 1 : 0;
	}
	return 0;
}

export function gcgPartLabel(row: GcgScoreRow): string {
	const p = canonicalPartIdForAcgsQuestion(row);
	return p || "Lainnya";
}
