import {
	AlignmentType,
	BorderStyle,
	Document as DocxDocument,
	ExternalHyperlink,
	Packer,
	PageBreak,
	PageOrientation,
	Paragraph,
	ShadingType,
	Table,
	TableCell,
	TableLayoutType,
	TableRow,
	TextRun,
	VerticalAlignTable,
	WidthType
} from "docx";
import { extractEvidenceFiles, extractEvidenceText } from "$lib/evidence-utils.js";
import {
	canonicalPartIdForAcgsQuestion,
	canonicalSectionIdForAcgsQuestion,
	isAcgsQuestionRow,
	norm
} from "../_lib/acgs-question-utils.js";
import { isAcgsNa, isAcgsYes, type GcgScoreRow } from "../_lib/scoring.js";
import type { AssessmentItem } from "../_lib/types.js";

type DocxCellChild = Paragraph | Table;

type GroupMode = "level1" | "bonus" | "penalti";

type GroupScore = {
	total: number;
	na: number;
	tidak: number;
	ya: number;
	scoreMax: number;
	scoreTotal: number;
};

const PAGE_WIDTH_DXA = 15840;
const USABLE_WIDTH_DXA = 14640;
const ACGS_TABLE_WIDTHS = [900, 4400, 2750, 2450, 900, 3240] as const;
const SUMMARY_TABLE_WIDTHS = [1350, 3450, 1550, 1350, 1250, 1250, 1250, 1250] as const;
const PRIMARY = "12225C";
const HEADER_BLUE = "002060";
const LEVEL_FILL = "E2E8F0";
const TOTAL_FILL = "B4C6E7";
const LIGHT_FILL = "F8FAFC";
const BLACK = "000000";
const WHITE = "FFFFFF";
const BLUE_TEXT = "1D4ED8";

function cleanText(value: string | number | null | undefined): string {
	return String(value ?? "")
		.replace(/\s+/g, " ")
		.trim();
}

function statusText(row: AssessmentItem): string {
	const st = cleanText(row.status).toUpperCase();
	if (st === "Y") return "YES";
	if (st === "N") return "NO";
	return st;
}

function fmtComma2(n: number): string {
	return n.toFixed(2).replace(".", ",");
}

function roundDisplayScore(n: number): number {
	return Number(n.toFixed(2));
}

function fmtTotalScore(n: number): string {
	if (n < 0) return `(${fmtComma2(Math.abs(n))})`;
	return fmtComma2(n);
}

function computeGroup(rows: GcgScoreRow[], scoreMax: number, mode: GroupMode): GroupScore {
	const total = rows.length;
	const na = rows.filter(isAcgsNa).length;
	const ya = rows.filter(isAcgsYes).length;
	const tidak = Math.max(0, total - na - ya);
	const rawScoreTotal =
		total === 0 ? 0 : mode === "level1" ? ((na + ya) / total) * scoreMax : (ya / total) * scoreMax;
	const scoreTotal = roundDisplayScore(rawScoreTotal);
	return { total, na, tidak, ya, scoreMax, scoreTotal };
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
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART A")),
		20,
		"level1"
	);
	const partB = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART B")),
		15,
		"level1"
	);
	const partC = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART C")),
		25,
		"level1"
	);
	const partD = computeGroup(
		questionRows.filter((q) => canonicalPartIdForAcgsQuestion(q).startsWith("PART D")),
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
		questionRows.filter((q) => /^PART\s+\(B\)/.test(canonicalPartIdForAcgsQuestion(q))),
		30,
		"bonus"
	);
	const penalti = computeGroup(
		questionRows.filter((q) => /^PART\s+\(P\)/.test(canonicalPartIdForAcgsQuestion(q))),
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

function border(color = BLACK, size = 6): { style: (typeof BorderStyle)[keyof typeof BorderStyle]; size: number; color: string } {
	return { style: BorderStyle.SINGLE, size, color };
}

function textRun(
	text: string,
	opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}
): TextRun {
	return new TextRun({
		text,
		bold: opts.bold,
		color: opts.color ?? BLACK,
		size: opts.size ?? 16,
		italics: opts.italics
	});
}

function para(
	text: string,
	opts: {
		bold?: boolean;
		color?: string;
		size?: number;
		align?: (typeof AlignmentType)[keyof typeof AlignmentType];
		italics?: boolean;
	} = {}
): Paragraph {
	return new Paragraph({
		alignment: opts.align ?? AlignmentType.LEFT,
		spacing: { before: 0, after: 40 },
		children: [textRun(text, opts)]
	});
}

function cell(
	children: DocxCellChild[] | string,
	opts: {
		width?: number;
		fill?: string;
		color?: string;
		bold?: boolean;
		align?: (typeof AlignmentType)[keyof typeof AlignmentType];
		columnSpan?: number;
		size?: number;
		verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
	} = {}
): TableCell {
	const childNodes = typeof children === "string" ? [para(children, opts)] : children;
	return new TableCell({
		children: childNodes,
		width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
		columnSpan: opts.columnSpan,
		verticalAlign: opts.verticalAlign ?? VerticalAlignTable.TOP,
		shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
		margins: { top: 80, bottom: 80, left: 80, right: 80 },
		borders: {
			top: border(),
			bottom: border(),
			left: border(),
			right: border()
		}
	});
}

function row(cells: TableCell[], cantSplit = true): TableRow {
	return new TableRow({ children: cells, cantSplit });
}

function table(rows: TableRow[], widths: readonly number[]): Table {
	return new Table({
		rows,
		width: { size: USABLE_WIDTH_DXA, type: WidthType.DXA },
		columnWidths: widths,
		layout: TableLayoutType.FIXED,
		margins: { top: 80, bottom: 80, left: 80, right: 80 }
	});
}

function summaryDataRow(labelA: string, labelB: string, group: GroupScore | Omit<GroupScore, "scoreMax">, scoreMax: string): TableRow {
	return row([
		cell(labelA, { width: SUMMARY_TABLE_WIDTHS[0], align: AlignmentType.CENTER, size: 18 }),
		cell(labelB, { width: SUMMARY_TABLE_WIDTHS[1], size: 18 }),
		cell(String(group.total), { width: SUMMARY_TABLE_WIDTHS[2], align: AlignmentType.RIGHT, size: 18 }),
		cell(scoreMax, { width: SUMMARY_TABLE_WIDTHS[3], align: AlignmentType.RIGHT, size: 18 }),
		cell(String(group.na), { width: SUMMARY_TABLE_WIDTHS[4], align: AlignmentType.RIGHT, size: 18 }),
		cell(String(group.tidak), { width: SUMMARY_TABLE_WIDTHS[5], align: AlignmentType.RIGHT, size: 18 }),
		cell(String(group.ya), { width: SUMMARY_TABLE_WIDTHS[6], align: AlignmentType.RIGHT, size: 18 }),
		cell(fmtTotalScore(group.scoreTotal), { width: SUMMARY_TABLE_WIDTHS[7], align: AlignmentType.RIGHT, size: 18 })
	]);
}

function buildSummaryTable(questions: AssessmentItem[]): Table {
	const groups = buildSummaryGroups(questions);
	return table(
		[
			row([
				cell("Standar Tata Kelola Perusahaan", {
					width: SUMMARY_TABLE_WIDTHS[0] + SUMMARY_TABLE_WIDTHS[1],
					columnSpan: 2,
					fill: HEADER_BLUE,
					color: WHITE,
					bold: true,
					align: AlignmentType.CENTER
				}),
				cell("Jumlah Pertanyaan", { width: SUMMARY_TABLE_WIDTHS[2], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER }),
				cell("Skor Maksimal", { width: SUMMARY_TABLE_WIDTHS[3], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER }),
				cell("N/A", { width: SUMMARY_TABLE_WIDTHS[4], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER }),
				cell("Tidak", { width: SUMMARY_TABLE_WIDTHS[5], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER }),
				cell("Ya", { width: SUMMARY_TABLE_WIDTHS[6], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER }),
				cell("Total Skor", { width: SUMMARY_TABLE_WIDTHS[7], fill: HEADER_BLUE, color: WHITE, bold: true, align: AlignmentType.CENTER })
			]),
			row([cell("LEVEL 1", { columnSpan: 8, bold: true, fill: WHITE })]),
			summaryDataRow("Bagian A", "Hak-hak dan Perlakuan Setara terhadap Pemegang Saham", groups.partA, "20,00"),
			summaryDataRow("Bagian B", "Keberlanjutan dan Ketahanan", groups.partB, "15,00"),
			summaryDataRow("Bagian C", "Transparansi dan Pengungkapan", groups.partC, "25,00"),
			summaryDataRow("Bagian D", "Tanggung Jawab Dewan", groups.partD, "40,00"),
			row([
				cell("TOTAL LEVEL 1", { columnSpan: 2, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level1.total), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell("100,00", { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level1.na), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level1.tidak), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level1.ya), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(fmtTotalScore(groups.level1.scoreTotal), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL })
			]),
			row([cell("LEVEL 2", { columnSpan: 8, bold: true, fill: WHITE })]),
			summaryDataRow("", "Bonus", groups.bonus, "30"),
			summaryDataRow("", "Penalti", groups.penalti, "-67"),
			row([
				cell("TOTAL LEVEL 2", { columnSpan: 2, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level2.total), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell("30,00", { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level2.na), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level2.tidak), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.level2.ya), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(fmtTotalScore(groups.level2.scoreTotal), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL })
			]),
			row([
				cell("TOTAL", { columnSpan: 2, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.overall.total), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell("130,00", { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.overall.na), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.overall.tidak), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(String(groups.overall.ya), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL }),
				cell(fmtTotalScore(groups.overall.scoreTotal), { align: AlignmentType.RIGHT, bold: true, fill: TOTAL_FILL })
			])
		],
		SUMMARY_TABLE_WIDTHS
	);
}

function displayCode(primary?: string | null, fallback?: string | null): string {
	const p = norm(primary);
	if (p && !/^[0-9a-f-]{36}$/i.test(p)) return p;
	const f = norm(fallback);
	if (f && !/^[0-9a-f-]{36}$/i.test(f)) return f;
	return p || f || "";
}

function partGroupKey(rowData: AssessmentItem | null | undefined): string {
	if (!rowData) return "";
	return norm(rowData.item_id || rowData.part_id || rowData.label || "");
}

function headersForQuestion(q: AssessmentItem): {
	level: { label?: string | null } | null;
	part: AssessmentItem | null;
	section: AssessmentItem | null;
	subtitle: AssessmentItem | null;
} {
	const level = q.acgs_resolved_level ? { label: q.acgs_resolved_level.label } : null;
	const part = q.acgs_resolved_part
		? ({
				item_id: q.acgs_resolved_part.item_id ?? undefined,
				id: q.acgs_resolved_part.id ?? undefined,
				part_id: q.acgs_resolved_part.part_id ?? undefined,
				name_id: q.acgs_resolved_part.name_id ?? undefined,
				full_name_en: q.acgs_resolved_part.full_name_en ?? undefined,
				full_name_id: q.acgs_resolved_part.full_name_id ?? undefined,
				type: "part"
			} satisfies AssessmentItem)
		: null;
	const section = q.acgs_resolved_section
		? ({
				item_id: q.acgs_resolved_section.item_id ?? undefined,
				id: q.acgs_resolved_section.id ?? undefined,
				name_en: q.acgs_resolved_section.name_en ?? undefined,
				name_id: q.acgs_resolved_section.name_id ?? undefined,
				type: "section"
			} satisfies AssessmentItem)
		: null;
	const subtitle = q.acgs_subtitle_context
		? ({
				type: "subtitle",
				name_en: q.acgs_subtitle_context.name_en ?? undefined,
				name_id: q.acgs_subtitle_context.name_id ?? undefined
			} satisfies AssessmentItem)
		: null;
	return { level, part, section, subtitle };
}

function questionCell(q: AssessmentItem): TableCell {
	return cell(
		[
			para(cleanText(q.question_en), { size: 15, bold: true }),
			para(cleanText(q.question_id), { size: 14, color: BLUE_TEXT })
		],
		{ width: ACGS_TABLE_WIDTHS[1] }
	);
}

function evidenceParagraphs(q: AssessmentItem, origin: string): Paragraph[] {
	const text = extractEvidenceText(q.evidence);
	const files = extractEvidenceFiles(q.evidence);
	const output: Paragraph[] = [];
	if (text) output.push(para(text, { size: 14 }));
	for (const file of files) {
		const url = `${origin}/assessment-acgs/api/download?path=${encodeURIComponent(file.path)}`;
		output.push(
			new Paragraph({
				spacing: { before: 0, after: 40 },
				children: [
					new ExternalHyperlink({
						link: url,
						children: [textRun(file.name, { color: BLUE_TEXT, size: 14 })]
					})
				]
			})
		);
	}
	return output.length ? output : [para("", { size: 14 })];
}

function buildAssessmentTable(questions: AssessmentItem[], origin: string): Table {
	const rows: TableRow[] = [
		row([
			cell("ITEM", { width: ACGS_TABLE_WIDTHS[0], fill: PRIMARY, color: WHITE, bold: true, align: AlignmentType.CENTER }),
			cell("STANDAR TATA KELOLA PERUSAHAAN", {
				width: ACGS_TABLE_WIDTHS[1],
				fill: PRIMARY,
				color: WHITE,
				bold: true,
				align: AlignmentType.CENTER
			}),
			cell("IMPLEMENTASI", { width: ACGS_TABLE_WIDTHS[2], fill: PRIMARY, color: WHITE, bold: true, align: AlignmentType.CENTER }),
			cell("EVIDENCE", { width: ACGS_TABLE_WIDTHS[3], fill: PRIMARY, color: WHITE, bold: true, align: AlignmentType.CENTER }),
			cell("STATUS", { width: ACGS_TABLE_WIDTHS[4], fill: PRIMARY, color: WHITE, bold: true, align: AlignmentType.CENTER }),
			cell("REKOMENDASI", { width: ACGS_TABLE_WIDTHS[5], fill: PRIMARY, color: WHITE, bold: true, align: AlignmentType.CENTER })
		])
	];

	let prevLevel = "";
	let prevPart = "";
	let prevSection = "";
	let prevSubtitle = "";

	for (const q of questions) {
		const headers = headersForQuestion(q);
		const levelLabel = norm(headers.level?.label);
		const partKey = partGroupKey(headers.part);
		const sectionKey = canonicalSectionIdForAcgsQuestion(q);
		const subtitleKey = `${norm(headers.subtitle?.name_en)}|${norm(headers.subtitle?.name_id)}`;

		if (levelLabel && levelLabel !== prevLevel) {
			rows.push(row([cell(levelLabel || "LEVEL", { width: ACGS_TABLE_WIDTHS[0], fill: LEVEL_FILL, bold: true, align: AlignmentType.CENTER }), cell("", { columnSpan: 5, fill: LEVEL_FILL })]));
			prevLevel = levelLabel;
			prevPart = "";
			prevSection = "";
			prevSubtitle = "";
		}

		if (partKey && partKey !== prevPart) {
			const part = headers.part;
			rows.push(
				row([
					cell(
						[
							para(displayCode(part?.item_id ?? part?.id, part?.part_id), { bold: true, size: 15, align: AlignmentType.CENTER }),
							para(cleanText(part?.name_id), { bold: true, color: BLUE_TEXT, size: 13, align: AlignmentType.CENTER })
						],
						{ width: ACGS_TABLE_WIDTHS[0], fill: WHITE, align: AlignmentType.CENTER }
					),
					cell(
						[
							para(cleanText(part?.full_name_en), { bold: true, size: 14 }),
							para(cleanText(part?.full_name_id), { bold: true, color: BLUE_TEXT, size: 13 })
						],
						{ width: ACGS_TABLE_WIDTHS[1], fill: LIGHT_FILL }
					),
					cell("", { columnSpan: 4, fill: LIGHT_FILL })
				])
			);
			prevPart = partKey;
			prevSection = "";
			prevSubtitle = "";
		}

		if (sectionKey && sectionKey !== prevSection && headers.section) {
			const section = headers.section;
			rows.push(
				row([
					cell(displayCode(section.item_id, section.id), { width: ACGS_TABLE_WIDTHS[0], fill: LIGHT_FILL, bold: true, align: AlignmentType.CENTER }),
					cell(
						[
							para(cleanText(section.name_en), { bold: true, size: 14 }),
							para(cleanText(section.name_id), { color: BLUE_TEXT, size: 13 })
						],
						{ width: ACGS_TABLE_WIDTHS[1] }
					),
					cell("", { columnSpan: 4 })
				])
			);
			prevSection = sectionKey;
			prevSubtitle = "";
		}

		if (headers.subtitle && subtitleKey !== "|" && subtitleKey !== prevSubtitle) {
			rows.push(
				row([
					cell("", { width: ACGS_TABLE_WIDTHS[0], fill: "EEF2FF" }),
					cell(
						[
							para(cleanText(headers.subtitle.name_en), { bold: true, size: 13 }),
							para(cleanText(headers.subtitle.name_id), { bold: true, color: BLUE_TEXT, size: 13 })
						],
						{ width: ACGS_TABLE_WIDTHS[1], fill: "EEF2FF" }
					),
					cell("", { columnSpan: 4, fill: "EEF2FF" })
				])
			);
			prevSubtitle = subtitleKey;
		}

		rows.push(
			row([
				cell(displayCode(q.item_id, null), { width: ACGS_TABLE_WIDTHS[0], align: AlignmentType.CENTER, bold: true, color: BLUE_TEXT, size: 14 }),
				questionCell(q),
				cell(cleanText(q.implementation), { width: ACGS_TABLE_WIDTHS[2], size: 14 }),
				cell(evidenceParagraphs(q, origin), { width: ACGS_TABLE_WIDTHS[3] }),
				cell(statusText(q), { width: ACGS_TABLE_WIDTHS[4], align: AlignmentType.CENTER, bold: true, size: 15 }),
				cell(cleanText(q.recommendation), { width: ACGS_TABLE_WIDTHS[5], size: 14 })
			])
		);
	}

	return table(rows, ACGS_TABLE_WIDTHS);
}

export async function buildAcgsAssessmentDocx(params: {
	year: number;
	questions: AssessmentItem[];
	origin: string;
}): Promise<Buffer> {
	const title = `Tabel Skor Capaian Assessment ACGS PT PLN (Persero), Tahun Buku ${params.year}`;
	const doc = new DocxDocument({
		creator: "GCG Monitoring System",
		title,
		description: "Export Assessment ACGS",
		styles: {
			default: {
				document: {
					run: { font: "Arial", size: 16 },
					paragraph: { spacing: { before: 0, after: 80 } }
				}
			}
		},
		sections: [
			{
				properties: {
					page: {
						size: { orientation: PageOrientation.LANDSCAPE, width: PAGE_WIDTH_DXA, height: 12240 },
						margin: { top: 720, right: 600, bottom: 720, left: 600 }
					}
				},
				children: [
					para(title, { bold: true, size: 28, align: AlignmentType.CENTER, color: BLACK }),
					buildSummaryTable(params.questions),
					new Paragraph({ children: [new PageBreak()] }),
					para(`Assessment ACGS PT PLN (Persero), Tahun Buku ${params.year}`, {
						bold: true,
						size: 24,
						align: AlignmentType.CENTER
					}),
					buildAssessmentTable(params.questions, params.origin)
				]
			}
		]
	});

	return Packer.toBuffer(doc);
}
