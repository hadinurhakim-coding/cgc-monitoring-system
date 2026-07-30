import ExcelJS from "exceljs";
import { extractEvidenceFiles, extractEvidenceText } from "$lib/evidence-utils.js";
import {
	canonicalPartIdForAcgsQuestion,
	canonicalSectionIdForAcgsQuestion,
	isAcgsQuestionRow,
	norm
} from "../_lib/acgs-question-utils.js";
import { isAcgsNa, isAcgsNo, isAcgsYes, type GcgScoreRow } from "../_lib/scoring.js";
import type { AssessmentItem } from "../_lib/types.js";

export type AssessmentExcelTable = "score" | "detail";

type GroupMode = "level1" | "bonus" | "penalti";
type GroupScore = {
	total: number;
	na: number;
	tidak: number;
	ya: number;
	scoreMax: number;
	scoreTotal: number;
};

const primaryArgb = "FF002060";
const whiteArgb = "FFFFFFFF";
const textArgb = "FF0F172A";
const blueTextArgb = "FF1D4ED8";
const levelFillArgb = "FFE2E8F0";
const totalFillArgb = "FFB4C6E7";
const lightFillArgb = "FFF8FAFC";
const borderArgb = "FF94A3B8";

function cleanText(value: string | number | null | undefined): string {
	return String(value ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

function roundDisplayScore(value: number): number {
	return Number(value.toFixed(2));
}

function computeGroup(rows: GcgScoreRow[], scoreMax: number, mode: GroupMode): GroupScore {
	const total = rows.length;
	const na = rows.filter(isAcgsNa).length;
	const ya = rows.filter(isAcgsYes).length;
	const tidak = rows.filter(isAcgsNo).length;
	const rawScoreTotal =
		total === 0
			? 0
			: mode === "level1"
				? ((na + ya) / total) * scoreMax
				: (ya / total) * scoreMax;

	return {
		total,
		na,
		tidak,
		ya,
		scoreMax,
		scoreTotal: roundDisplayScore(rawScoreTotal)
	};
}

function buildSummaryGroups(questions: AssessmentItem[]): {
	partA: GroupScore;
	partB: GroupScore;
	partC: GroupScore;
	partD: GroupScore;
	level1: Omit<GroupScore, "scoreMax">;
	bonus: GroupScore;
	penalti: GroupScore;
	level2: Omit<GroupScore, "scoreMax">;
	overall: Omit<GroupScore, "scoreMax">;
} {
	const questionRows = questions.filter(isAcgsQuestionRow);
	const partA = computeGroup(
		questionRows.filter((row) => canonicalPartIdForAcgsQuestion(row).startsWith("PART A")),
		20,
		"level1"
	);
	const partB = computeGroup(
		questionRows.filter((row) => canonicalPartIdForAcgsQuestion(row).startsWith("PART B")),
		15,
		"level1"
	);
	const partC = computeGroup(
		questionRows.filter((row) => canonicalPartIdForAcgsQuestion(row).startsWith("PART C")),
		25,
		"level1"
	);
	const partD = computeGroup(
		questionRows.filter((row) => canonicalPartIdForAcgsQuestion(row).startsWith("PART D")),
		40,
		"level1"
	);
	const level1 = {
		total: partA.total + partB.total + partC.total + partD.total,
		na: partA.na + partB.na + partC.na + partD.na,
		tidak: partA.tidak + partB.tidak + partC.tidak + partD.tidak,
		ya: partA.ya + partB.ya + partC.ya + partD.ya,
		scoreTotal: partA.scoreTotal + partB.scoreTotal + partC.scoreTotal + partD.scoreTotal
	};
	const bonus = computeGroup(
		questionRows.filter((row) => /^PART\s+\(B\)/.test(canonicalPartIdForAcgsQuestion(row))),
		30,
		"bonus"
	);
	const penalti = computeGroup(
		questionRows.filter((row) => /^PART\s+\(P\)/.test(canonicalPartIdForAcgsQuestion(row))),
		-67,
		"penalti"
	);
	const level2 = {
		total: bonus.total + penalti.total,
		na: bonus.na + penalti.na,
		tidak: bonus.tidak + penalti.tidak,
		ya: bonus.ya + penalti.ya,
		scoreTotal: bonus.scoreTotal + penalti.scoreTotal
	};
	const overall = {
		total: level1.total + level2.total,
		na: level1.na + level2.na,
		tidak: level1.tidak + level2.tidak,
		ya: level1.ya + level2.ya,
		scoreTotal: level1.scoreTotal + level2.scoreTotal
	};

	return { partA, partB, partC, partD, level1, bonus, penalti, level2, overall };
}

function applyThinBorder(cell: ExcelJS.Cell, color = borderArgb): void {
	cell.border = {
		top: { style: "thin", color: { argb: color } },
		left: { style: "thin", color: { argb: color } },
		bottom: { style: "thin", color: { argb: color } },
		right: { style: "thin", color: { argb: color } }
	};
}

function styleTitle(worksheet: ExcelJS.Worksheet, title: string, lastColumn: number): void {
	worksheet.mergeCells(1, 1, 1, lastColumn);
	const titleCell = worksheet.getCell(1, 1);
	titleCell.value = title;
	titleCell.font = { bold: true, color: { argb: whiteArgb }, size: 14 };
	titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: primaryArgb } };
	titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
	worksheet.getRow(1).height = 32;
}

function styleHeaderRows(
	worksheet: ExcelJS.Worksheet,
	startRow: number,
	endRow: number,
	lastColumn: number
): void {
	for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
		const row = worksheet.getRow(rowNumber);
		for (let columnNumber = 1; columnNumber <= lastColumn; columnNumber += 1) {
			const cell = row.getCell(columnNumber);
			cell.font = { bold: true, color: { argb: whiteArgb } };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: primaryArgb } };
			cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
			applyThinBorder(cell, whiteArgb);
		}
	}
}

function addScoreDataRow(
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	label: string,
	description: string,
	group: GroupScore,
	mode: GroupMode
): void {
	const row = worksheet.getRow(rowNumber);
	row.values = [label || "—", description, group.total, group.scoreMax, group.na, group.tidak, group.ya];
	const formula =
		mode === "level1"
			? `IF(C${rowNumber}=0,0,(E${rowNumber}+G${rowNumber})/C${rowNumber}*D${rowNumber})`
			: `IF(C${rowNumber}=0,0,G${rowNumber}/C${rowNumber}*D${rowNumber})`;
	row.getCell(8).value = { formula, result: group.scoreTotal };
	row.height = 30;
	row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
		cell.font = { color: { argb: textArgb } };
		cell.alignment = {
			horizontal: columnNumber >= 3 ? "right" : columnNumber === 1 ? "center" : "left",
			vertical: "middle",
			wrapText: true
		};
		applyThinBorder(cell);
	});
	row.getCell(4).numFmt = "0.00;[Red](0.00)";
	row.getCell(8).numFmt = "0.00;[Red](0.00)";
}

function addScoreTotalRow(
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	label: string,
	sourceRows: number[],
	group: Omit<GroupScore, "scoreMax">,
	scoreMax: number
): void {
	worksheet.mergeCells(rowNumber, 1, rowNumber, 2);
	const row = worksheet.getRow(rowNumber);
	row.getCell(1).value = label;
	const sourceFormula = (column: string): string => sourceRows.map((source) => `${column}${source}`).join("+");
	row.getCell(3).value = { formula: sourceFormula("C"), result: group.total };
	row.getCell(4).value = scoreMax;
	row.getCell(5).value = { formula: sourceFormula("E"), result: group.na };
	row.getCell(6).value = { formula: sourceFormula("F"), result: group.tidak };
	row.getCell(7).value = { formula: sourceFormula("G"), result: group.ya };
	row.getCell(8).value = { formula: sourceFormula("H"), result: group.scoreTotal };
	row.height = 26;
	row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
		cell.font = { bold: true, color: { argb: textArgb } };
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: totalFillArgb } };
		cell.alignment = {
			horizontal: columnNumber >= 3 ? "right" : "left",
			vertical: "middle",
			wrapText: true
		};
		applyThinBorder(cell);
	});
	row.getCell(4).numFmt = "0.00;[Red](0.00)";
	row.getCell(8).numFmt = "0.00;[Red](0.00)";
}

function createScoreWorksheet(workbook: ExcelJS.Workbook, year: number, questions: AssessmentItem[]): void {
	const worksheet = workbook.addWorksheet("Skor Capaian", {
		properties: { defaultRowHeight: 20 },
		pageSetup: {
			orientation: "landscape",
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 1,
			paperSize: 9
		},
		views: [{ state: "frozen", ySplit: 4, activeCell: "A5" }]
	});
	worksheet.columns = [
		{ width: 14 },
		{ width: 42 },
		{ width: 18 },
		{ width: 16 },
		{ width: 14 },
		{ width: 14 },
		{ width: 14 },
		{ width: 16 }
	];
	worksheet.views = [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: false }];

	styleTitle(
		worksheet,
		`Tabel Skor Capaian Assessment ACGS PT PLN (Persero), Tahun Buku ${year}`,
		8
	);
	worksheet.mergeCells("A3:B4");
	worksheet.mergeCells("C3:C4");
	worksheet.mergeCells("D3:D4");
	worksheet.mergeCells("E3:G3");
	worksheet.mergeCells("H3:H4");
	worksheet.getCell("A3").value = "Standar Tata Kelola Perusahaan";
	worksheet.getCell("C3").value = "Jumlah Pertanyaan";
	worksheet.getCell("D3").value = "Skor Maksimal";
	worksheet.getCell("E3").value = "Pemenuhan";
	worksheet.getCell("E4").value = "Not Applicable (N/A)";
	worksheet.getCell("F4").value = "Tidak";
	worksheet.getCell("G4").value = "Ya";
	worksheet.getCell("H3").value = "Total Skor";
	styleHeaderRows(worksheet, 3, 4, 8);
	worksheet.getRow(3).height = 28;
	worksheet.getRow(4).height = 28;

	const groups = buildSummaryGroups(questions);
	worksheet.mergeCells("A5:H5");
	worksheet.getCell("A5").value = "LEVEL 1";
	addScoreDataRow(worksheet, 6, "Bagian A", "Hak-hak dan Perlakuan Setara terhadap Pemegang Saham", groups.partA, "level1");
	addScoreDataRow(worksheet, 7, "Bagian B", "Keberlanjutan dan Ketahanan", groups.partB, "level1");
	addScoreDataRow(worksheet, 8, "Bagian C", "Transparansi dan Pengungkapan", groups.partC, "level1");
	addScoreDataRow(worksheet, 9, "Bagian D", "Tanggung Jawab Dewan", groups.partD, "level1");
	addScoreTotalRow(worksheet, 10, "TOTAL LEVEL 1", [6, 7, 8, 9], groups.level1, 100);
	worksheet.mergeCells("A11:H11");
	worksheet.getCell("A11").value = "LEVEL 2";
	addScoreDataRow(worksheet, 12, "", "Bonus", groups.bonus, "bonus");
	addScoreDataRow(worksheet, 13, "", "Penalti", groups.penalti, "penalti");
	addScoreTotalRow(worksheet, 14, "TOTAL LEVEL 2", [12, 13], groups.level2, 30);
	addScoreTotalRow(worksheet, 15, "TOTAL", [10, 14], groups.overall, 130);

	for (const rowNumber of [5, 11]) {
		const cell = worksheet.getCell(rowNumber, 1);
		cell.font = { bold: true, color: { argb: textArgb } };
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: levelFillArgb } };
		cell.alignment = { vertical: "middle" };
		applyThinBorder(cell);
	}
	worksheet.headerFooter.oddFooter = `&LAssessment ACGS ${year}&RHalaman &P dari &N`;
}

type DetailHeaders = {
	levelLabel: string;
	partCode: string;
	partNameEn: string;
	partNameId: string;
	sectionCode: string;
	sectionNameEn: string;
	sectionNameId: string;
	subtitleNameEn: string;
	subtitleNameId: string;
};

function detailHeadersFor(row: AssessmentItem): DetailHeaders {
	return {
		levelLabel: cleanText(row.acgs_resolved_level?.label ?? row.level_label ?? row.level),
		partCode: cleanText(
			row.acgs_resolved_part?.item_id ??
				row.acgs_resolved_part?.id ??
				row.acgs_resolved_part?.part_id ??
				canonicalPartIdForAcgsQuestion(row)
		),
		partNameEn: cleanText(row.acgs_resolved_part?.full_name_en),
		partNameId: cleanText(
			row.acgs_resolved_part?.full_name_id ?? row.acgs_resolved_part?.name_id
		),
		sectionCode: cleanText(
			row.acgs_resolved_section?.item_id ??
				row.acgs_resolved_section?.id ??
				canonicalSectionIdForAcgsQuestion(row)
		),
		sectionNameEn: cleanText(row.acgs_resolved_section?.name_en),
		sectionNameId: cleanText(row.acgs_resolved_section?.name_id),
		subtitleNameEn: cleanText(row.acgs_subtitle_context?.name_en),
		subtitleNameId: cleanText(row.acgs_subtitle_context?.name_id)
	};
}

function statusText(row: AssessmentItem): string {
	const status = cleanText(row.status).toUpperCase();
	if (status === "Y") return "YES";
	if (status === "N") return "NO";
	return status;
}

function evidenceText(row: AssessmentItem): string {
	const text = extractEvidenceText(row.evidence);
	const files = extractEvidenceFiles(row.evidence).map((file) => file.name);
	return [text, files.length > 0 ? `Lampiran: ${files.join(", ")}` : ""].filter(Boolean).join("\n");
}

function estimateDetailRowHeight(values: string[]): number {
	const maxLength = Math.max(0, ...values.map((value) => value.length));
	return Math.min(180, Math.max(34, Math.ceil(maxLength / 80) * 18));
}

function styleStructuralRow(
	worksheet: ExcelJS.Worksheet,
	rowNumber: number,
	fillArgb: string,
	bold = true
): void {
	const row = worksheet.getRow(rowNumber);
	row.eachCell({ includeEmpty: true }, (cell) => {
		cell.font = { bold, color: { argb: textArgb } };
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillArgb } };
		cell.alignment = { vertical: "middle", wrapText: true };
		applyThinBorder(cell);
	});
}

function createDetailWorksheet(
	workbook: ExcelJS.Workbook,
	year: number,
	query: string,
	questions: AssessmentItem[]
): void {
	const worksheet = workbook.addWorksheet("Detail Assessment", {
		properties: { defaultRowHeight: 20 },
		pageSetup: {
			orientation: "landscape",
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 0,
			paperSize: 9
		}
	});
	worksheet.columns = [
		{ width: 14 },
		{ width: 72 },
		{ width: 34 },
		{ width: 34 },
		{ width: 14 },
		{ width: 34 }
	];
	worksheet.views = [{ state: "frozen", xSplit: 2, ySplit: 4, activeCell: "C5", showGridLines: false }];

	styleTitle(
		worksheet,
		`Tabel Detail Assessment ACGS PT PLN (Persero), Tahun Buku ${year}`,
		6
	);
	worksheet.mergeCells("A2:F2");
	const filterCell = worksheet.getCell("A2");
	filterCell.value = query ? `Filter aktif: ${query}` : "Seluruh data assessment";
	filterCell.font = { italic: true, color: { argb: "FF475569" } };
	filterCell.alignment = { vertical: "middle" };

	const headerRow = worksheet.getRow(4);
	headerRow.values = [
		"ITEM",
		"STANDAR TATA KELOLA PERUSAHAAN",
		"IMPLEMENTASI",
		"EVIDENCE",
		"STATUS YES OR NO",
		"REKOMENDASI"
	];
	headerRow.height = 36;
	styleHeaderRows(worksheet, 4, 4, 6);

	let outputRow = 5;
	let previousLevel = "";
	let previousPart = "";
	let previousSection = "";
	let previousSubtitle = "";

	for (const question of questions) {
		const headers = detailHeadersFor(question);
		const subtitleKey = `${headers.subtitleNameEn}|${headers.subtitleNameId}`;

		if (headers.levelLabel && headers.levelLabel !== previousLevel) {
			worksheet.mergeCells(outputRow, 1, outputRow, 6);
			worksheet.getCell(outputRow, 1).value = headers.levelLabel;
			styleStructuralRow(worksheet, outputRow, levelFillArgb);
			outputRow += 1;
			previousLevel = headers.levelLabel;
			previousPart = "";
			previousSection = "";
			previousSubtitle = "";
		}

		if (headers.partCode && headers.partCode !== previousPart) {
			worksheet.mergeCells(outputRow, 2, outputRow, 6);
			worksheet.getCell(outputRow, 1).value = headers.partCode;
			worksheet.getCell(outputRow, 2).value = [headers.partNameEn, headers.partNameId]
				.filter(Boolean)
				.join("\n");
			worksheet.getCell(outputRow, 2).font = { bold: true, color: { argb: blueTextArgb } };
			styleStructuralRow(worksheet, outputRow, lightFillArgb);
			worksheet.getRow(outputRow).height = 34;
			outputRow += 1;
			previousPart = headers.partCode;
			previousSection = "";
			previousSubtitle = "";
		}

		if (headers.sectionCode && headers.sectionCode !== previousSection) {
			worksheet.mergeCells(outputRow, 2, outputRow, 6);
			worksheet.getCell(outputRow, 1).value = headers.sectionCode;
			worksheet.getCell(outputRow, 2).value = [headers.sectionNameEn, headers.sectionNameId]
				.filter(Boolean)
				.join("\n");
			styleStructuralRow(worksheet, outputRow, whiteArgb);
			worksheet.getRow(outputRow).height = 32;
			outputRow += 1;
			previousSection = headers.sectionCode;
			previousSubtitle = "";
		}

		if (subtitleKey !== "|" && subtitleKey !== previousSubtitle) {
			worksheet.mergeCells(outputRow, 2, outputRow, 6);
			worksheet.getCell(outputRow, 2).value = [
				headers.subtitleNameEn,
				headers.subtitleNameId
			]
				.filter(Boolean)
				.join("\n");
			styleStructuralRow(worksheet, outputRow, "FFEEF2FF");
			worksheet.getRow(outputRow).height = 32;
			outputRow += 1;
			previousSubtitle = subtitleKey;
		}

		const standardText = [cleanText(question.question_en), cleanText(question.question_id)]
			.filter(Boolean)
			.join("\n");
		const evidence = evidenceText(question);
		const implementation = cleanText(question.implementation);
		const recommendation = cleanText(question.recommendation);
		const row = worksheet.getRow(outputRow);
		row.values = [
			cleanText(question.item_id),
			standardText,
			implementation || "—",
			evidence || "—",
			statusText(question) || "—",
			recommendation || "—"
		];
		row.height = estimateDetailRowHeight([
			standardText,
			implementation,
			evidence,
			recommendation
		]);
		row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
			cell.font = {
				bold: columnNumber === 1 || columnNumber === 5,
				color: { argb: columnNumber === 1 ? blueTextArgb : textArgb }
			};
			cell.alignment = {
				horizontal: columnNumber === 1 || columnNumber === 5 ? "center" : "left",
				vertical: "top",
				wrapText: true
			};
			applyThinBorder(cell);
		});
		outputRow += 1;
	}

	worksheet.autoFilter = {
		from: { row: 4, column: 1 },
		to: { row: 4, column: 6 }
	};
	worksheet.headerFooter.oddFooter = `&LDetail Assessment ACGS ${year}&RHalaman &P dari &N`;
}

export function createAssessmentExcelWorkbook(params: {
	year: number;
	table: AssessmentExcelTable;
	query: string;
	questions: AssessmentItem[];
}): ExcelJS.Workbook {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "GCG Monitoring System";
	workbook.created = new Date();
	workbook.modified = new Date();
	workbook.calcProperties.fullCalcOnLoad = true;

	if (params.table === "score") {
		workbook.title = `Skor Capaian Assessment ACGS ${params.year}`;
		workbook.subject = `Skor Capaian Assessment ACGS Tahun ${params.year}`;
		createScoreWorksheet(workbook, params.year, params.questions);
	} else {
		workbook.title = `Detail Assessment ACGS ${params.year}`;
		workbook.subject = `Detail Assessment ACGS Tahun ${params.year}`;
		createDetailWorksheet(workbook, params.year, params.query, params.questions);
	}

	return workbook;
}

export async function createAssessmentExcelFile(params: {
	year: number;
	table: AssessmentExcelTable;
	query: string;
	questions: AssessmentItem[];
}): Promise<Uint8Array> {
	const workbook = createAssessmentExcelWorkbook(params);
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}
