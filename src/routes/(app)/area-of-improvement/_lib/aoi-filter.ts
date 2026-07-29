import { extractEvidenceText } from "$lib/evidence-utils.js";
import type { AoiItem } from "./types.js";

export function formatAoiDate(value: string): string {
	if (!value) return "Belum ada target waktu";
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return "Tanggal tidak valid";
	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(date);
}

function normalizeSearchValue(value: string | number | null | undefined): string {
	return String(value ?? "").trim().toLowerCase();
}

function itemSearchHaystack(item: AoiItem, index: number): string {
	return [
		index + 1,
		item.aoi_code,
		item.area_of_improvement,
		item.fakta_temuan,
		item.rekomendasi,
		item.tindak_lanjut_rekomendasi,
		item.pic,
		formatAoiDate(item.target_waktu_penyelesaian),
		item.status_rekomendasi,
		extractEvidenceText(item.eviden),
		item.keterangan,
		item.level_label,
		item.part_id,
		item.section_id,
	]
		.map(normalizeSearchValue)
		.join(" ");
}

export function filterAoiItems(items: AoiItem[], query: string): AoiItem[] {
	const tokens = normalizeSearchValue(query).split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return items;
	return items.filter((item, index) => {
		const haystack = itemSearchHaystack(item, index);
		return tokens.every((token) => haystack.includes(token));
	});
}
