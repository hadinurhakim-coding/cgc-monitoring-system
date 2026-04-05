/** Tipe ringkasan untuk SummaryCards — modul klien-safe (tanpa `.server`). */
export type AssessmentSummaryMetrics = {
	progress: { total: number; completed: number; percentage: number };
	compliance: { score: string; trend: string; status: string };
	parts: { id: string; label: string; color: string; score: number }[];
	evidence: { total: number; fulfilled: number; percentage: number };
	gaps: { total: number; urgent: number; normal: number };
};
