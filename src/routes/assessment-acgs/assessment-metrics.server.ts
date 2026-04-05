/**
 * Agregat ringkas untuk SummaryCards — sama logika dengan summary-cards.svelte,
 * dijalankan di server dari baris pertanyaan berkolom sempit.
 */
import { isAcgsQuestionRow } from "./acgs-defaults.js";
import type { AssessmentSummaryMetrics } from "./acgs-summary-types.js";

export type QuestionSummaryRow = {
	type?: string | null;
	status?: string | null;
	implementation?: string | null;
	evidence?: string | null;
	part_id?: string | null;
	part?: string | null;
	level_label?: string | null;
	level?: string | null;
};

function norm(s: string | null | undefined) {
	return (s ?? "").replace(/\s+/g, " ").trim();
}

export function computeAssessmentSummaryMetrics(rows: QuestionSummaryRow[]): AssessmentSummaryMetrics {
	const questions = rows.filter((item) => isAcgsQuestionRow(item));
	const total = questions.length;
	if (total === 0) {
		return {
			progress: { total: 0, completed: 0, percentage: 0 },
			compliance: { score: "0", trend: "N/A", status: "stable" },
			parts: [],
			evidence: { total: 0, fulfilled: 0, percentage: 0 },
			gaps: { total: 0, urgent: 0, normal: 0 }
		};
	}

	const completed = questions.filter((q) => norm(q.implementation) || norm(q.status)).length;
	const progressPerc = Math.round((completed / total) * 100);

	const compliant = questions.filter((q) => q.status === "YES" || q.status === "Y").length;
	const complianceScore = ((compliant / total) * 100).toFixed(1);

	const palette = [
		"var(--primary)",
		"#10b981",
		"#f59e0b",
		"#00b4d8",
		"#64748b",
		"#a855f7",
		"#ec4899"
	];
	const partKeys = [
		...new Set(questions.map((q) => norm(q.part_id || q.part)).filter(Boolean))
	].sort();
	const partsStats = partKeys.map((partKey, idx) => {
		const partQuestions = questions.filter((q) => norm(q.part_id || q.part) === partKey);
		const pTotal = partQuestions.length;
		const pCompliant = partQuestions.filter((q) => q.status === "YES" || q.status === "Y").length;
		const pScore = pTotal > 0 ? Math.round((pCompliant / pTotal) * 100) : 0;
		const short = partKey.replace(/^PART\s+/i, "").trim() || partKey.slice(0, 8);
		return {
			id: short,
			label: partKey,
			color: palette[idx % palette.length]!,
			score: pScore
		};
	});

	const withEvidence = questions.filter((q) => norm(q.evidence)).length;
	const evidencePerc = total > 0 ? Math.round((withEvidence / total) * 100) : 0;

	const totalGaps = questions.filter((q) => q.status === "NO" || q.status === "N").length;
	const urgent = questions.filter(
		(q) =>
			(q.status === "NO" || q.status === "N") &&
			(norm(q.level_label) || norm(q.level)).toUpperCase().includes("LEVEL 1")
	).length;

	return {
		progress: { total, completed, percentage: progressPerc },
		compliance: { score: complianceScore, trend: "+0%", status: "stable" },
		parts: partsStats,
		evidence: { total, fulfilled: withEvidence, percentage: evidencePerc },
		gaps: { total: totalGaps, urgent, normal: totalGaps - urgent }
	};
}
