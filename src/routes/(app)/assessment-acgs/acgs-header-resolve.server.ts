/**
 * Resolusi header level / part / section untuk baris pertanyaan ACGS.
 * Hanya di-import dari server — memakai master `_data/assessment-master` tanpa membawa ke bundle klien.
 */
import { assessmentData as acgsMasterStructure } from "./_data/assessment-master.js";
import {
	canonicalPartIdForAcgsQuestion,
	canonicalSectionIdForAcgsQuestion,
	isAcgsQuestionRow
} from "./acgs-defaults.js";

function norm(s: string | null | undefined) {
	return (s ?? "").replace(/\s+/g, " ").trim();
}

function partCode(row: Record<string, unknown>): string {
	return norm(
		String(row.item_id ?? row.part_id ?? row.label ?? row.id ?? "")
	);
}

const masterQuestionByItemId = (() => {
	const m = new Map<string, (typeof acgsMasterStructure)[number]>();
	for (const r of acgsMasterStructure) {
		if (r.type === "question" && r.id) m.set(norm(r.id), r);
	}
	return m;
})();

const masterLevelByLabel = new Map<string, Record<string, unknown>>();
const masterPartByCode = new Map<string, Record<string, unknown>>();
const masterSectionByKey = new Map<string, Record<string, unknown>>();
for (const raw of acgsMasterStructure) {
	if (raw.type === "level") {
		masterLevelByLabel.set(norm(raw.label), raw as unknown as Record<string, unknown>);
	} else if (raw.type === "part") {
		const pr = raw as unknown as Record<string, unknown>;
		const c = partCode(pr);
		if (c) masterPartByCode.set(c, pr);
	} else if (raw.type === "section") {
		const sr = raw as unknown as Record<string, unknown>;
		const k1 = norm(String(sr.item_id ?? sr.id ?? ""));
		const k2 = norm(String(sr.section_id ?? sr.section ?? ""));
		if (k1) masterSectionByKey.set(k1, sr);
		if (k2 && k2 !== k1) masterSectionByKey.set(k2, sr);
	}
}

function effectiveLevelLabel(q: Record<string, unknown>): string {
	const fromDb = norm(String(q.level_label ?? q.level ?? ""));
	if (fromDb) return fromDb;
	const key = norm(String(q.item_id ?? ""));
	if (!key) return "";
	return norm(masterQuestionByItemId.get(key)?.level);
}

export type AcgsResolvedLevel = { label: string | null };
export type AcgsResolvedPart = {
	item_id: string | null;
	id: string | null;
	part_id: string | null;
	name_id: string | null;
	full_name_en: string | null;
	full_name_id: string | null;
};
export type AcgsResolvedSection = {
	item_id: string | null;
	id: string | null;
	name_en: string | null;
	name_id: string | null;
};

function toResolvedLevel(row: Record<string, unknown> | undefined): AcgsResolvedLevel | null {
	if (!row) return null;
	return { label: row.label != null ? String(row.label) : null };
}

function toResolvedPart(row: Record<string, unknown> | undefined): AcgsResolvedPart | null {
	if (!row) return null;
	return {
		item_id: row.item_id != null ? String(row.item_id) : null,
		id: row.id != null ? String(row.id) : null,
		part_id: row.part_id != null ? String(row.part_id) : null,
		name_id: row.name_id != null ? String(row.name_id) : null,
		full_name_en: row.full_name_en != null ? String(row.full_name_en) : null,
		full_name_id: row.full_name_id != null ? String(row.full_name_id) : null
	};
}

function toResolvedSection(row: Record<string, unknown> | undefined): AcgsResolvedSection | null {
	if (!row) return null;
	return {
		item_id: row.item_id != null ? String(row.item_id) : null,
		id: row.id != null ? String(row.id) : null,
		name_en: row.name_en != null ? String(row.name_en) : null,
		name_id: row.name_id != null ? String(row.name_id) : null
	};
}

/**
 * Untuk setiap baris pertanyaan, lampirkan `acgs_resolved_*` (JSON-safe) agar klien tidak perlu import master.
 */
export function attachResolvedAcgsHeaders<T extends Record<string, unknown>>(rows: T[]): T[] {
	const levelByLabel = new Map<string, Record<string, unknown>>();
	const partByCode = new Map<string, Record<string, unknown>>();
	const sectionByKey = new Map<string, Record<string, unknown>>();
	for (const row of rows) {
		const t = String(row.type ?? "").toLowerCase();
		const r = row as Record<string, unknown>;
		if (t === "level") {
			const lbl = norm(String(r.label ?? ""));
			if (lbl) levelByLabel.set(lbl, r);
		} else if (t === "part") {
			const c = partCode(r);
			if (c) partByCode.set(c, r);
		} else if (t === "section") {
			const k1 = norm(String(r.item_id ?? r.id ?? ""));
			const k2 = norm(String(r.section_id ?? r.section ?? ""));
			if (k1) sectionByKey.set(k1, r);
			if (k2 && k2 !== k1) sectionByKey.set(k2, r);
		}
	}

	return rows.map((row) => {
		if (!isAcgsQuestionRow(row)) return row;

		const q = row as Record<string, unknown>;
		const levelLabel = effectiveLevelLabel(q);
		const partCanon = canonicalPartIdForAcgsQuestion(
			q as Parameters<typeof canonicalPartIdForAcgsQuestion>[0]
		);
		const sid = canonicalSectionIdForAcgsQuestion(
			q as Parameters<typeof canonicalSectionIdForAcgsQuestion>[0]
		);

		let levelRow = levelLabel ? levelByLabel.get(levelLabel) : undefined;
		let partRow = norm(partCanon) ? partByCode.get(norm(partCanon)) : undefined;
		let sectionRow = norm(sid) ? sectionByKey.get(norm(sid)) : undefined;

		if (!levelRow && levelLabel) levelRow = masterLevelByLabel.get(levelLabel);
		if (!partRow && norm(partCanon)) partRow = masterPartByCode.get(norm(partCanon));
		if (!sectionRow && norm(sid)) sectionRow = masterSectionByKey.get(norm(sid));

		return {
			...row,
			acgs_resolved_level: toResolvedLevel(levelRow),
			acgs_resolved_part: toResolvedPart(partRow),
			acgs_resolved_section: toResolvedSection(sectionRow)
		} as T;
	});
}
