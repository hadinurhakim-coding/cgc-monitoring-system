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

export interface MonitoringHierarchyItem {
	type: "level" | "part" | "section";
	sortOrder: number;
	levelLabel: string;
	partId: string;
	itemId: string;
	label: string;
	nameId: string;
	fullNameId: string;
}

function norm(value: string): string {
	return value.trim();
}

function statusToKey(status: string): keyof AoiStatusCounts {
	switch (status) {
		case "Telah ditindaklanjuti 100%": return "selesai";
		case "On Progress": return "onProgress";
		case "Tidak dapat ditindaklanjuti 100%": return "tidakDapat";
		case "Belum ditindaklanjuti": return "belum";
		default: return "belum";
	}
}

function computeStatusCounts(items: AoiItem[]): AoiStatusCounts {
	const counts = emptyStatusCounts();
	for (const item of items) {
		counts[statusToKey(item.status_rekomendasi)]++;
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

const levelOnePartNames: Record<string, string> = {
	"PART A": "Hak-hak dan Perlakuan Setara terhadap Pemegang Saham",
	"PART B": "Keberlanjutan dan Ketahanan",
	"PART C": "Transparansi dan Pengungkapan",
	"PART D": "Tanggung Jawab Dewan",
};

function levelKind(label: string): "level1" | "bonus" | "penalti" | "other" {
	const normalized = norm(label).toUpperCase();
	if (normalized.includes("BONUS")) return "bonus";
	if (normalized.includes("PENALTY") || normalized.includes("PENALTI")) return "penalti";
	if (normalized.includes("LEVEL 1")) return "level1";
	return "other";
}

function summarizeParts(
	partId: string,
	partLabel: string,
	fullNameId: string,
	parts: AoiPartGroup[],
	keteranganMap: Map<string, string>
): AoiPartGroup {
	const statusCounts = parts.reduce(
		(total, part) => addStatusCounts(total, part.statusCounts),
		emptyStatusCounts()
	);
	const fallbackKeterangan = [...new Set(parts.map((part) => part.keterangan).filter(Boolean))].join("\n");

	return {
		partId,
		partLabel,
		fullNameId,
		levelLabel: "LEVEL 2",
		sections: parts.flatMap((part) => part.sections),
		totalAoi: parts.reduce((total, part) => total + part.totalAoi, 0),
		statusCounts,
		keterangan: keteranganMap.get(partId) ?? fallbackKeterangan,
	};
}

function summarizeLevel(levelLabel: string, parts: AoiPartGroup[]): AoiLevelGroup {
	return {
		levelLabel,
		parts,
		totalAoi: parts.reduce((total, part) => total + part.totalAoi, 0),
		statusCounts: parts.reduce(
			(total, part) => addStatusCounts(total, part.statusCounts),
			emptyStatusCounts()
		),
	};
}

function toMajorPointLevels(
	levels: AoiLevelGroup[],
	keteranganMap: Map<string, string>
): AoiLevelGroup[] {
	const levelOneParts = levels
		.filter((level) => levelKind(level.levelLabel) === "level1")
		.flatMap((level) => level.parts)
		.map((part) => ({
			...part,
			partLabel: partLabelFromId(part.partId),
			fullNameId: levelOnePartNames[part.partId] ?? part.fullNameId,
			levelLabel: "LEVEL 1",
		}));

	const bonusParts = levels
		.filter((level) => levelKind(level.levelLabel) === "bonus")
		.flatMap((level) => level.parts);
	const penaltiParts = levels
		.filter((level) => levelKind(level.levelLabel) === "penalti")
		.flatMap((level) => level.parts);

	const result: AoiLevelGroup[] = [];
	if (levelOneParts.length > 0) result.push(summarizeLevel("LEVEL 1", levelOneParts));

	const levelTwoParts: AoiPartGroup[] = [];
	if (bonusParts.length > 0) {
		levelTwoParts.push(summarizeParts("LEVEL 2 BONUS", "", "Bonus", bonusParts, keteranganMap));
	}
	if (penaltiParts.length > 0) {
		levelTwoParts.push(summarizeParts("LEVEL 2 PENALTI", "", "Penalti", penaltiParts, keteranganMap));
	}
	if (levelTwoParts.length > 0) result.push(summarizeLevel("LEVEL 2", levelTwoParts));

	result.push(
		...levels.filter(
			(level) => levelKind(level.levelLabel) === "other" && level.parts.length > 0
		)
	);
	return result;
}

export function buildMonitoringData(
	hierarchy: MonitoringHierarchyItem[],
	items: AoiItem[],
	keteranganMap: Map<string, string>
): { levels: AoiLevelGroup[]; grandTotal: MonitoringGrandTotal } {
	const itemsBySection = new Map<string, AoiItem[]>();
	for (const item of items) {
		const key = norm(item.section_id);
		if (!itemsBySection.has(key)) itemsBySection.set(key, []);
		itemsBySection.get(key)!.push(item);
	}

	const levelMap = new Map<string, {
		label: string;
		parts: Map<string, { part: MonitoringHierarchyItem; sections: MonitoringHierarchyItem[] }>;
	}>();
	const levelOrder: string[] = [];
	const partOrderPerLevel = new Map<string, string[]>();

	for (const item of [...hierarchy].sort((a, b) => a.sortOrder - b.sortOrder)) {
		if (item.type === "level") {
			const levelLabel = norm(item.label);
			if (!levelLabel || levelMap.has(levelLabel)) continue;
			levelMap.set(levelLabel, { label: levelLabel, parts: new Map() });
			levelOrder.push(levelLabel);
			partOrderPerLevel.set(levelLabel, []);
		} else if (item.type === "part") {
			const levelLabel = norm(item.levelLabel);
			const partId = norm(item.itemId);
			if (!levelLabel || !partId) continue;
			if (!levelMap.has(levelLabel)) {
				levelMap.set(levelLabel, { label: levelLabel, parts: new Map() });
				levelOrder.push(levelLabel);
				partOrderPerLevel.set(levelLabel, []);
			}
			const level = levelMap.get(levelLabel)!;
			if (!level.parts.has(partId)) {
				level.parts.set(partId, { part: item, sections: [] });
				partOrderPerLevel.get(levelLabel)!.push(partId);
			}
		} else if (item.type === "section") {
			const levelLabel = norm(item.levelLabel);
			const partId = norm(item.partId);
			const level = levelMap.get(levelLabel);
			const part = level?.parts.get(partId);
			if (!part) continue;
			part.sections.push(item);
		}
	}

	const levels: AoiLevelGroup[] = [];
	let grandTotal: MonitoringGrandTotal = { jumlahAoi: 0, statusCounts: emptyStatusCounts() };

	for (const levelLabel of levelOrder) {
		const level = levelMap.get(levelLabel);
		if (!level) continue;

		const parts: AoiPartGroup[] = [];
		let levelTotalAoi = 0;
		let levelStatusCounts = emptyStatusCounts();

		for (const partId of partOrderPerLevel.get(levelLabel) ?? []) {
			const part = level.parts.get(partId);
			if (!part) continue;

			const sections: AoiSectionRow[] = [];
			let partTotalAoi = 0;
			let partStatusCounts = emptyStatusCounts();

			for (const section of part.sections) {
				const sectionId = norm(section.itemId);
				const sectionItems = itemsBySection.get(sectionId) ?? [];
				const jumlahAoi = sectionItems.length;
				const statusCounts = computeStatusCounts(sectionItems);

				sections.push({
					sectionId,
					sectionLabel: norm(section.nameId),
					partId,
					levelLabel,
					jumlahAoi,
					statusCounts,
				});
				partTotalAoi += jumlahAoi;
				partStatusCounts = addStatusCounts(partStatusCounts, statusCounts);
			}

			parts.push({
				partId,
				partLabel: partLabelFromId(partId),
				fullNameId: norm(part.part.fullNameId || part.part.nameId),
				levelLabel,
				sections,
				totalAoi: partTotalAoi,
				statusCounts: partStatusCounts,
				keterangan: keteranganMap.get(partId) ?? "",
			});
			levelTotalAoi += partTotalAoi;
			levelStatusCounts = addStatusCounts(levelStatusCounts, partStatusCounts);
		}

		levels.push({ levelLabel, parts, totalAoi: levelTotalAoi, statusCounts: levelStatusCounts });
		grandTotal = {
			jumlahAoi: grandTotal.jumlahAoi + levelTotalAoi,
			statusCounts: addStatusCounts(grandTotal.statusCounts, levelStatusCounts),
		};
	}

	return { levels: toMajorPointLevels(levels, keteranganMap), grandTotal };
}
