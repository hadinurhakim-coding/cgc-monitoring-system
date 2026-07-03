/**
 * Server-side replica of the weighted ACGS scoring formula from score-summary-table.svelte.
 * This module is the single source of truth for persisting year summaries.
 */
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canonicalPartIdForAcgsQuestion, isAcgsQuestionRow } from "./acgs-question-utils.js";
import { gcgQuestionPoint, isAcgsNa, isAcgsYes, type GcgScoreRow } from "./scoring.js";

type GroupMode = "level1" | "bonus" | "penalti";

interface GroupScore {
	total: number;
	na: number;
	tidak: number;
	ya: number;
	scoreMax: number;
	scoreTotal: number;
}

function roundDisplayScore(n: number): number {
	return Number(n.toFixed(2));
}

function computeGroup(rows: GcgScoreRow[], scoreMax: number, mode: GroupMode): GroupScore {
	const total = rows.length;
	const na = rows.filter(isAcgsNa).length;
	const ya = rows.filter(isAcgsYes).length;
	const tidak = Math.max(0, total - na - ya);

	const rawScoreTotal =
		total === 0
			? 0
			: mode === "level1"
				? ((na + ya) / total) * scoreMax
				: (ya / total) * scoreMax;
	const scoreTotal = roundDisplayScore(rawScoreTotal);

	return { total, na, tidak, ya, scoreMax, scoreTotal };
}

export type AcgsSummaryResult = {
	question_count: number;
	points_sum: number;
	score_pct: number;
	payload: Record<string, unknown>;
};

/**
 * Computes the ACGS year summary from question rows.
 *
 * Mirrors the exact weighted formula in score-summary-table.svelte:
 *   Part A (scoreMax 20), B (15), C (25), D (40) — Level 1: ((na+ya)/total) × scoreMax
 *   Bonus (scoreMax 30), Penalti (scoreMax −67) — Level 2: (ya/total) × scoreMax
 *   score_pct = (overallScore / 130) × 100
 *
 * Group scores are rounded to the two-decimal values shown in the UI before being summed.
 */
export function computeAcgsSummary(questions: GcgScoreRow[]): AcgsSummaryResult {
	const questionRows = questions.filter((q) => isAcgsQuestionRow(q));
	const question_count = questionRows.length;
	const points_sum = questionRows.reduce((acc, q) => acc + gcgQuestionPoint(q), 0);

	const partA = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART A")),
		20,
		"level1"
	);
	const partB = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART B")),
		15,
		"level1"
	);
	const partC = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART C")),
		25,
		"level1"
	);
	const partD = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART D")),
		40,
		"level1"
	);
	const bonus = computeGroup(
		questionRows.filter((q) => /^PART\s+\(B\)/.test(canonicalPartIdForAcgsQuestion(q))),
		30,
		"bonus"
	);
	const penalti = computeGroup(
		questionRows.filter((q) => /^PART\s+\(P\)/.test(canonicalPartIdForAcgsQuestion(q))),
		-67,
		"penalti"
	);

	const level1Score = partA.scoreTotal + partB.scoreTotal + partC.scoreTotal + partD.scoreTotal;
	const level2Score = bonus.scoreTotal + penalti.scoreTotal;
	const overallScore = level1Score + level2Score;

	const score_pct = question_count === 0 ? 0 : (overallScore / 130) * 100;

	const payload: Record<string, unknown> = {
		partA,
		partB,
		partC,
		partD,
		bonus,
		penalti,
		level1Score,
		level2Score,
		overallScore
	};

	return { question_count, points_sum, score_pct, payload };
}

/**
 * Computes the summary and upserts it into `acgs_year_summaries` (conflict key: year).
 * Returns the computed score_pct so callers can include it in API responses.
 */
export async function persistYearSummary(
	adminDb: ReturnType<typeof createAdminServerClient>,
	year: number,
	questions: GcgScoreRow[]
): Promise<{ score_pct: number; error: Error | null }> {
	const summary = computeAcgsSummary(questions);

	const { error } = await adminDb.from("acgs_year_summaries").upsert(
		{
			year,
			question_count: summary.question_count,
			points_sum: summary.points_sum,
			score_pct: summary.score_pct,
			payload: summary.payload,
			updated_at: new Date().toISOString()
		},
		{ onConflict: "year" }
	);

	if (error) {
		return { score_pct: summary.score_pct, error: new Error(error.message) };
	}

	return { score_pct: summary.score_pct, error: null };
}
