/** Baris yang diperlakukan sebagai pertanyaan di grid (termasuk legacy DB `type = acgs`). */
export function isAcgsQuestionRow(item: { type?: string | null }): boolean {
	const t = String(item.type ?? "").toLowerCase();
	return t === "question" || t === "acgs";
}

export function norm(s: string | null | undefined) {
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
