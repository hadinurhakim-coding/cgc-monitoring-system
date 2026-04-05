import { assessmentData, type AssessmentItem } from "./assessment-data.js";

/** Baris yang diperlakukan sebagai pertanyaan di grid (termasuk legacy DB `type = acgs`). */
export function isAcgsQuestionRow(item: { type?: string | null }): boolean {
	const t = String(item.type ?? "").toLowerCase();
	return t === "question" || t === "acgs";
}

function norm(s: string | null | undefined) {
	return (s ?? "").replace(/\s+/g, " ").trim();
}

/** A.1.1 / (P)A.2.1 → PART A / PART (P)A */
export function partIdFromQuestionItemId(itemId: string | null | undefined): string | null {
	const s = norm(itemId);
	if (!s) return null;
	const bonusPenalty = s.match(/^\((P|B)\)([A-Za-z])\./i);
	if (bonusPenalty) {
		const tag = bonusPenalty[1].toUpperCase();
		const letter = bonusPenalty[2].toUpperCase();
		return `PART (${tag})${letter}`;
	}
	if (/^[A-Za-z]\.\d/.test(s)) {
		return `PART ${s[0].toUpperCase()}`;
	}
	return null;
}

/** A.9.2 → A.9 ; (P)A.2.1 → (P)A.2 */
export function sectionIdFromQuestionItemId(itemId: string | null | undefined): string | null {
	const s = norm(itemId);
	if (!s) return null;
	const parts = s.split(".");
	if (parts.length < 2) return null;
	const last = parts[parts.length - 1] ?? "";
	if (!/^\d+$/.test(last)) return null;
	if (parts.length >= 3) {
		parts.pop();
		return parts.join(".");
	}
	return s;
}

const FULL_SECTION_RE = /^(\([PB]\)[A-Za-z]|[A-Za-z])\.\d+$/;

function sectionPrefixFromCanonicalPart(canonicalPart: string): string | null {
	const p = norm(canonicalPart).toUpperCase();
	const m = p.match(/^PART\s+(\([PB]\)[A-Z])$/);
	if (m) return m[1];
	const m2 = p.match(/^PART\s+([A-Z])$/);
	if (m2) return m2[1];
	return null;
}

export function canonicalPartIdForAcgsQuestion(row: {
	part_id?: string | null;
	part?: string | null;
	item_id?: string | null;
}): string {
	const fromItem = partIdFromQuestionItemId(row.item_id);
	if (fromItem) return fromItem;
	const raw = norm(row.part_id || row.part);
	if (!raw) return "";
	if (/^PART\s/i.test(raw)) return raw;
	if (/^[A-Za-z]$/.test(raw)) return `PART ${raw.toUpperCase()}`;
	return raw;
}

export function canonicalSectionIdForAcgsQuestion(row: {
	section_id?: string | null;
	section?: string | null;
	item_id?: string | null;
	part_id?: string | null;
	part?: string | null;
}): string {
	const sid = norm(row.section_id || row.section);
	if (sid && FULL_SECTION_RE.test(sid)) return sid;
	const fromItem = sectionIdFromQuestionItemId(row.item_id);
	if (fromItem) return fromItem;
	if (/^\d+$/.test(sid)) {
		const partCanon = canonicalPartIdForAcgsQuestion(row);
		const prefix = sectionPrefixFromCanonicalPart(partCanon);
		if (prefix) return `${prefix}.${sid}`;
	}
	return sid;
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
		status: item.status ?? "",
		recommendation: item.recommendation ?? ""
	}));
}
