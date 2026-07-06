import { assessmentData, type AssessmentItem } from "./assessment-master.js";
import { isAcgsQuestionRow } from "../_lib/acgs-question-utils.js";

export {
	isAcgsQuestionRow,
	partIdFromQuestionItemId,
	sectionIdFromQuestionItemId,
	canonicalPartIdForAcgsQuestion,
	canonicalSectionIdForAcgsQuestion
} from "../_lib/acgs-question-utils.js";

function norm(s: string | null | undefined) {
	return (s ?? "").replace(/\s+/g, " ").trim();
}

/** Master `question` rows keyed by `id` (e.g. A.1.1) for DB backfill and server/UI merge. */
export const questionDefaultsByItemId: ReadonlyMap<
	string,
	{ question_en: string; question_id: string }
> = (() => {
	const m = new Map<string, { question_en: string; question_id: string }>();
	for (const item of assessmentData) {
		if (item.type !== "question") continue;
		const key = norm(item.id);
		if (!key) continue;
		if (m.has(key)) continue;
		m.set(key, {
			question_en: norm(item.question_en),
			question_id: norm(item.question_id)
		});
	}
	return m;
})();

export function mergeQuestionDefaultsFromMaster(row: {
	type?: string | null;
	item_id?: string | null;
	question_en?: string | null;
	question_id?: string | null;
}): { question_en?: string; question_id?: string } {
	if (!isAcgsQuestionRow(row)) return {};
	const key = norm(row.item_id ?? undefined);
	if (!key) return {};
	const d = questionDefaultsByItemId.get(key);
	if (!d) return {};
	const out: { question_en?: string; question_id?: string } = {};
	if (!norm(row.question_en)) out.question_en = d.question_en;
	if (!norm(row.question_id)) out.question_id = d.question_id;
	return out;
}

/** Baris flat untuk `acgs_assessments` (sama bentuknya dengan seed DB). */
export function buildFlatRowsForYear(year: number): Record<string, unknown>[] {
	return assessmentData.map((item: AssessmentItem, index: number) => ({
		type: item.type,
		sort_order: index,
		year,
		level_label: item.level ?? null,
		part_id: item.part ?? null,
		section_id: item.section ?? null,
		item_id: item.id ?? null,
		label: item.label ?? null,
		name_en: item.name_en ?? null,
		name_id: item.name_id ?? null,
		full_name_en: item.full_name_en ?? null,
		full_name_id: item.full_name_id ?? null,
		question_en: item.question_en ?? null,
		question_id: item.question_id ?? null,
		implementation: item.implementation ?? "",
		evidence: item.evidence ?? "",
		status: "",
		recommendation: ""
	}));
}
