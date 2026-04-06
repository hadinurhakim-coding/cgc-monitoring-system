/** Tipe ringkasan untuk SummaryCards — modul klien-safe (tanpa `.server`). */
export type AssessmentSummaryMetrics = {
	progress: { total: number; pointsSum: number; percentage: number };
	parts: { id: string; label: string; color: string; score: number }[];
	evidence: {
		naCount: number;
		yesWithEvidenceCount: number;
		zeroPointCount: number;
	};
	gaps: { total: number; urgent: number; normal: number };
};
