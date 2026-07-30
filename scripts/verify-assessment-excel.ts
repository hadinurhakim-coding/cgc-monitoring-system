import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
	createAssessmentExcelWorkbook,
	type AssessmentExcelTable
} from "../src/routes/(app)/assessment-acgs/_services/export-excel.server.js";
import type { AssessmentItem } from "../src/routes/(app)/assessment-acgs/_lib/types.js";

const outputDirectory = resolve(".tmp-assessment-excel-verification");

function question(params: {
	itemId: string;
	partCode: string;
	partName: string;
	sectionCode: string;
	status: string;
	implementation?: string;
	evidence?: string;
	recommendation?: string;
}): AssessmentItem {
	return {
		type: "question",
		item_id: params.itemId,
		question_en: `English question for ${params.itemId}`,
		question_id: `Pertanyaan Bahasa Indonesia untuk ${params.itemId}`,
		implementation: params.implementation ?? "Implementasi contoh",
		evidence: params.evidence ?? "Evidence contoh\n[FILE:sample/evidence.pdf|Evidence.pdf]",
		status: params.status,
		recommendation: params.recommendation ?? "",
		acgs_resolved_level: { label: params.partCode.includes("(") ? "LEVEL 2" : "LEVEL 1" },
		acgs_resolved_part: {
			item_id: params.partCode,
			full_name_en: params.partName,
			full_name_id: `Terjemahan ${params.partName}`
		},
		acgs_resolved_section: {
			item_id: params.sectionCode,
			name_en: `Section ${params.sectionCode}`,
			name_id: `Bagian ${params.sectionCode}`
		}
	};
}

const questions: AssessmentItem[] = [
	question({ itemId: "A.1.1", partCode: "PART A", partName: "Rights of Shareholders", sectionCode: "A.1", status: "YES" }),
	question({ itemId: "B.1.1", partCode: "PART B", partName: "Sustainability and Resilience", sectionCode: "B.1", status: "NA" }),
	question({ itemId: "C.1.1", partCode: "PART C", partName: "Disclosure and Transparency", sectionCode: "C.1", status: "NO", recommendation: "Perlu perbaikan" }),
	question({ itemId: "D.1.1", partCode: "PART D", partName: "Responsibilities of the Board", sectionCode: "D.1", status: "YES" }),
	question({ itemId: "(B)A.1.1", partCode: "PART (B)A", partName: "Bonus", sectionCode: "(B)A.1", status: "YES" }),
	question({ itemId: "(P)A.1.1", partCode: "PART (P)A", partName: "Penalty", sectionCode: "(P)A.1", status: "YES" })
];

await mkdir(outputDirectory, { recursive: true });

for (const table of ["score", "detail"] satisfies AssessmentExcelTable[]) {
	const workbook = createAssessmentExcelWorkbook({
		year: 2026,
		table,
		query: table === "detail" ? "contoh" : "",
		questions
	});
	await workbook.xlsx.writeFile(resolve(outputDirectory, `${table}.xlsx`));
}

console.log(outputDirectory);
