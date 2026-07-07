import { assessmentData } from "../../assessment-acgs/_data/assessment-master.js";
import type { AoiItem } from "../../area-of-improvement/_lib/types.js";
import {
	type AoiStatusCounts,
	type AoiSectionRow,
	type AoiPartGroup,
	type AoiLevelGroup,
	type MonitoringGrandTotal,
	emptyStatusCounts,
	addStatusCounts,
} from "./types.js";

function statusToKey(status: string): keyof AoiStatusCounts | null {
	switch (status) {
		case "Telah ditindaklanjuti 100%": return "selesai";
		case "On Progress": return "onProgress";
		case "Tidak dapat ditindaklanjuti 100%": return "tidakDapat";
		case "Belum ditindaklanjuti": return "belum";
		default: return null;
	}
}

function computeStatusCounts(items: AoiItem[]): AoiStatusCounts {
	const counts = emptyStatusCounts();
	for (const item of items) {
		const key = statusToKey(item.status_rekomendasi);
		if (key) counts[key]++;
	}
	return counts;
}

function partLabelFromId(partId: string): string {
	const map: Record<string, string> = {
		"PART A": "Bagian A",
		"PART B": "Bagian B",
		"PART C": "Bagian C",
		"PART D": "Bagian D",
		"PART (B)A": "Bonus A",
		"PART (B)B": "Bonus B",
		"PART (B)C": "Bonus C",
		"PART (B)D": "Bonus D",
		"PART (P)A": "Penalti A",
		"PART (P)B": "Penalti B",
		"PART (P)C": "Penalti C",
		"PART (P)D": "Penalti D",
	};
	return map[partId] ?? partId;
}

export function buildMonitoringData(
	items: AoiItem[],
	keteranganMap: Map<string, string>
): { levels: AoiLevelGroup[]; grandTotal: MonitoringGrandTotal } {
	// Bangun index: section_id → items
	const itemsBySection = new Map<string, AoiItem[]>();
	for (const item of items) {
		const key = item.section_id;
		if (!itemsBySection.has(key)) itemsBySection.set(key, []);
		itemsBySection.get(key)!.push(item);
	}

	// Kumpulkan hierarki dari master data secara berurutan
	const levelMap = new Map<string, { label: string; parts: Map<string, { part: (typeof assessmentData)[number]; sections: (typeof assessmentData)[number][] }> }>();
	const levelOrder: string[] = [];
	const partOrderPerLevel = new Map<string, string[]>();

	for (const item of assessmentData) {
		if (item.type === "level") {
			const lbl = item.label ?? "";
			if (!levelMap.has(lbl)) {
				levelMap.set(lbl, { label: lbl, parts: new Map() });
				levelOrder.push(lbl);
				partOrderPerLevel.set(lbl, []);
			}
		} else if (item.type === "part") {
			const lbl = item.level ?? "";
			const partId = item.id ?? "";
			if (!levelMap.has(lbl)) {
				levelMap.set(lbl, { label: lbl, parts: new Map() });
				levelOrder.push(lbl);
				partOrderPerLevel.set(lbl, []);
			}
			const lv = levelMap.get(lbl)!;
			if (!lv.parts.has(partId)) {
				lv.parts.set(partId, { part: item, sections: [] });
				partOrderPerLevel.get(lbl)!.push(partId);
			}
		} else if (item.type === "section") {
			const lbl = item.level ?? "";
			const partId = item.part ?? "";
			const lv = levelMap.get(lbl);
			if (!lv) continue;
			const pt = lv.parts.get(partId);
			if (!pt) continue;
			pt.sections.push(item);
		}
	}

	const levels: AoiLevelGroup[] = [];
	let grandTotal: MonitoringGrandTotal = { jumlahAoi: 0, statusCounts: emptyStatusCounts() };

	for (const levelLabel of levelOrder) {
		const lv = levelMap.get(levelLabel);
		if (!lv) continue;

		const parts: AoiPartGroup[] = [];
		let levelTotalAoi = 0;
		let levelStatusCounts = emptyStatusCounts();

		const partOrder = partOrderPerLevel.get(levelLabel) ?? [];
		for (const partId of partOrder) {
			const pt = lv.parts.get(partId);
			if (!pt) continue;

			const sections: AoiSectionRow[] = [];
			let partTotalAoi = 0;
			let partStatusCounts = emptyStatusCounts();

			for (const sec of pt.sections) {
				const sectionId = sec.id ?? "";
				const sectionLabel = (sec.name_id ?? "").trim();
				const sectionItems = itemsBySection.get(sectionId) ?? [];
				const jumlahAoi = sectionItems.length;
				const statusCounts = computeStatusCounts(sectionItems);

				sections.push({ sectionId, sectionLabel, partId, levelLabel, jumlahAoi, statusCounts });
				partTotalAoi += jumlahAoi;
				partStatusCounts = addStatusCounts(partStatusCounts, statusCounts);
			}

			const partGroup: AoiPartGroup = {
				partId,
				partLabel: partLabelFromId(partId),
				fullNameId: (pt.part.full_name_id ?? pt.part.name_id ?? "").trim(),
				levelLabel,
				sections,
				totalAoi: partTotalAoi,
				statusCounts: partStatusCounts,
				keterangan: keteranganMap.get(partId) ?? "",
			};
			parts.push(partGroup);
			levelTotalAoi += partTotalAoi;
			levelStatusCounts = addStatusCounts(levelStatusCounts, partStatusCounts);
		}

		levels.push({ levelLabel, parts, totalAoi: levelTotalAoi, statusCounts: levelStatusCounts });
		grandTotal = {
			jumlahAoi: grandTotal.jumlahAoi + levelTotalAoi,
			statusCounts: addStatusCounts(grandTotal.statusCounts, levelStatusCounts),
		};
	}

	return { levels, grandTotal };
}
