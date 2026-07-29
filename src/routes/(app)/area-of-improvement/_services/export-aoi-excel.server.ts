import ExcelJS from "exceljs";
import { extractEvidenceFiles, extractEvidenceText } from "$lib/evidence-utils.js";
import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";

const headerRowNumber = 4;
const columnCount = 11;

const columnWidths = {
	no: 7,
	aoiCode: 14,
	areaOfImprovement: 42,
	faktaTemuan: 38,
	rekomendasi: 38,
	tindakLanjut: 38,
	pic: 24,
	status: 32,
	targetWaktu: 24,
	eviden: 34,
	keterangan: 34,
} as const;

function parseExcelDate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return null;
	}

	return date;
}

function evidenceForExport(value: string): string {
	const text = extractEvidenceText(value);
	const fileNames = extractEvidenceFiles(value).map((file) => file.name);
	return [text, fileNames.length > 0 ? `Lampiran: ${fileNames.join(", ")}` : ""]
		.filter(Boolean)
		.join("\n");
}

function statusFill(status: StatusRekomendasi): string {
	const fills: Record<StatusRekomendasi, string> = {
		"Telah ditindaklanjuti 100%": "DCFCE7",
		"On Progress": "DBEAFE",
		"Tidak dapat ditindaklanjuti 100%": "FEF3C7",
		"Belum ditindaklanjuti": "E2E8F0",
	};
	return fills[status];
}

function estimateWrappedLines(value: string, width: number): number {
	const usableWidth = Math.max(width - 2, 8);
	return value.split(/\r?\n/).reduce((lineCount, line) => {
		return lineCount + Math.max(1, Math.ceil(line.length / usableWidth));
	}, 0);
}

function estimateRowHeight(values: Array<{ value: string; width: number }>): number {
	const lines = Math.max(...values.map(({ value, width }) => estimateWrappedLines(value, width)));
	return Math.min(300, Math.max(30, lines * 15));
}

function addDataRows(worksheet: ExcelJS.Worksheet, items: AoiItem[]): void {
	for (const [index, item] of items.entries()) {
		const targetDate = parseExcelDate(item.target_waktu_penyelesaian);
		const eviden = evidenceForExport(item.eviden);
		const row = worksheet.addRow({
			no: index + 1,
			aoiCode: item.aoi_code,
			areaOfImprovement: item.area_of_improvement,
			faktaTemuan: item.fakta_temuan,
			rekomendasi: item.rekomendasi,
			tindakLanjut: item.tindak_lanjut_rekomendasi,
			pic: item.pic,
			status: item.status_rekomendasi,
			targetWaktu: targetDate ?? item.target_waktu_penyelesaian,
			eviden,
			keterangan: item.keterangan,
		});

		row.alignment = { vertical: "top", wrapText: true };
		row.eachCell((cell) => {
			cell.border = {
				top: { style: "thin", color: { argb: "FFD1D5DB" } },
				left: { style: "thin", color: { argb: "FFD1D5DB" } },
				bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
				right: { style: "thin", color: { argb: "FFD1D5DB" } },
			};
		});
		row.getCell("no").alignment = { horizontal: "center", vertical: "top" };
		row.getCell("aoiCode").alignment = {
			horizontal: "center",
			vertical: "top",
			wrapText: true,
		};
		row.getCell("status").fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: `FF${statusFill(item.status_rekomendasi)}` },
		};
		row.getCell("targetWaktu").numFmt = targetDate ? "[$-421]dd mmmm yyyy" : "General";
		row.height = estimateRowHeight([
			{ value: item.area_of_improvement, width: columnWidths.areaOfImprovement },
			{ value: item.fakta_temuan, width: columnWidths.faktaTemuan },
			{ value: item.rekomendasi, width: columnWidths.rekomendasi },
			{ value: item.tindak_lanjut_rekomendasi, width: columnWidths.tindakLanjut },
			{ value: item.pic, width: columnWidths.pic },
			{ value: item.status_rekomendasi, width: columnWidths.status },
			{ value: eviden, width: columnWidths.eviden },
			{ value: item.keterangan, width: columnWidths.keterangan },
		]);
	}
}

export function createAoiExcelWorkbook(
	year: number,
	query: string,
	items: AoiItem[],
): ExcelJS.Workbook {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "GCG Monitoring System";
	workbook.subject = `Area of Improvement Tahun ${year}`;
	workbook.title = `Area of Improvement ${year}`;
	workbook.created = new Date();

	const worksheet = workbook.addWorksheet("Area of Improvement", {
		properties: { defaultRowHeight: 20 },
		pageSetup: {
			orientation: "landscape",
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 0,
			paperSize: 9,
		},
		views: [{ state: "frozen", xSplit: 2, ySplit: headerRowNumber, activeCell: "C5" }],
	});

	worksheet.columns = [
		{ key: "no", width: columnWidths.no },
		{ key: "aoiCode", width: columnWidths.aoiCode },
		{ key: "areaOfImprovement", width: columnWidths.areaOfImprovement },
		{ key: "faktaTemuan", width: columnWidths.faktaTemuan },
		{ key: "rekomendasi", width: columnWidths.rekomendasi },
		{ key: "tindakLanjut", width: columnWidths.tindakLanjut },
		{ key: "pic", width: columnWidths.pic },
		{ key: "status", width: columnWidths.status },
		{ key: "targetWaktu", width: columnWidths.targetWaktu },
		{ key: "eviden", width: columnWidths.eviden },
		{ key: "keterangan", width: columnWidths.keterangan },
	];

	worksheet.mergeCells(1, 1, 1, columnCount);
	const titleCell = worksheet.getCell("A1");
	titleCell.value = `DATA AREA OF IMPROVEMENT - TAHUN ${year}`;
	titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
	titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002060" } };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(1).height = 30;

	worksheet.mergeCells(2, 1, 2, columnCount);
	const filterCell = worksheet.getCell("A2");
	filterCell.value = query ? `Filter aktif: ${query}` : "Seluruh data AOI";
	filterCell.font = { italic: true, color: { argb: "FF475569" } };
	filterCell.alignment = { vertical: "middle" };

	const headerRow = worksheet.getRow(headerRowNumber);
	headerRow.values = [
		"No",
		"No AOI",
		"Area of Improvement",
		"Fakta Temuan",
		"Rekomendasi",
		"Tindak Lanjut atas Rekomendasi",
		"Penanggung Jawab",
		"Progress Tindak Lanjut",
		"Target Waktu Penyelesaian",
		"Eviden",
		"Keterangan",
	];
	headerRow.height = 34;
	headerRow.eachCell((cell) => {
		cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002060" } };
		cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
		cell.border = {
			top: { style: "thin", color: { argb: "FFFFFFFF" } },
			left: { style: "thin", color: { argb: "FFFFFFFF" } },
			bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
			right: { style: "thin", color: { argb: "FFFFFFFF" } },
		};
	});

	worksheet.autoFilter = {
		from: { row: headerRowNumber, column: 1 },
		to: { row: headerRowNumber, column: columnCount },
	};
	worksheet.headerFooter.oddFooter = `&LArea of Improvement ${year}&RHalaman &P dari &N`;
	addDataRows(worksheet, items);

	return workbook;
}

export async function createAoiExcelFile(
	year: number,
	query: string,
	items: AoiItem[],
): Promise<Uint8Array> {
	const workbook = createAoiExcelWorkbook(year, query, items);
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}
