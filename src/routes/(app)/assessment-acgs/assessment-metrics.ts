/**
 * Agregat ringkas untuk SummaryCards — satu sumber kebenaran skor GCG (boleh di-import dari klien).
 */
import { isAcgsQuestionRow } from "./acgs-defaults.js";
import type { AssessmentSummaryMetrics } from "./acgs-summary-types.js";
import { gcgPartLabel, gcgQuestionPoint, type GcgScoreRow } from "./gcg-scoring.js";

export type QuestionSummaryRow = GcgScoreRow;

function normStatus(s: string | null | undefined): string {
	return String(s ?? "")
		.trim()
		.toLowerCase();
}

function levelUpper(row: GcgScoreRow): string {
	return String(row.level_label ?? row.level ?? "").toUpperCase();
}

export function emptyAssessmentSummaryMetrics(): AssessmentSummaryMetrics {
	return {
		progress: { total: 0, pointsSum: 0, percentage: 0 },
		parts: [],
		evidence: { naCount: 0, yesWithEvidenceCount: 0, zeroPointCount: 0 },
		gaps: { total: 0, urgent: 0, normal: 0 }
	};
}

export function computeAssessmentSummaryMetrics(rows: QuestionSummaryRow[]): AssessmentSummaryMetrics {
	const questions = rows.filter((item) => isAcgsQuestionRow(item));
	const total = questions.length;
	if (total === 0) {
		return emptyAssessmentSummaryMetrics();
	}

	let pointsSum = 0;
	for (const q of questions) {
		pointsSum += gcgQuestionPoint(q);
	}
	const percentage = Math.round((pointsSum / total) * 100);

	const palette = [
		"var(--primary)",
		"#10b981",
		"#f59e0b",
		"#00b4d8",
		"#64748b",
		"#a855f7",
		"#ec4899"
	];

	const partMap = new Map<string, { sum: number; count: number }>();
	for (const q of questions) {
		const label = gcgPartLabel(q);
		const p = gcgQuestionPoint(q);
		const cur = partMap.get(label) ?? { sum: 0, count: 0 };
		cur.sum += p;
		cur.count += 1;
		partMap.set(label, cur);
	}
	const sortedPartKeys = [...partMap.keys()].sort();
	const parts = sortedPartKeys.map((label, idx) => {
		const { sum, count } = partMap.get(label)!;
		const score = count > 0 ? Math.round((sum / count) * 100) : 0;
		const short = label.replace(/^PART\s+/i, "").trim() || label.slice(0, 8);
		return {
			id: short,
			label,
			color: palette[idx % palette.length]!,
			score
		};
	});

	const naCount = questions.filter((q) => normStatus(q.status) === "na").length;
	const yesWithEvidenceCount = questions.filter((q) => {
		const st = normStatus(q.status);
		return (
			(st === "yes" || st === "y") &&
			String(q.evidence ?? "")
				.replace(/\s+/g, " ")
				.trim().length > 0
		);
	}).length;
	const zeroPointCount = total - pointsSum;

	const isGapNo = (q: GcgScoreRow) => {
		const st = normStatus(q.status);
		return st === "no" || st === "n";
	};
	const gapRows = questions.filter(isGapNo);
	const totalGaps = gapRows.length;
	const urgent = gapRows.filter((q) => levelUpper(q).includes("LEVEL 1")).length;

	return {
		progress: { total, pointsSum, percentage },
		parts,
		evidence: { naCount, yesWithEvidenceCount, zeroPointCount },
		gaps: { total: totalGaps, urgent, normal: totalGaps - urgent }
	};
}
