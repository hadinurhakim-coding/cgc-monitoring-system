import { error } from "@sveltejs/kit";
import { hasPermission } from "$lib/server/rbac.js";
import { buildSearchHaystack } from "../../_lib/search-utils.js";
import { isAcgsQuestionRow } from "../../_lib/acgs-question-utils.js";
import {
	createAssessmentExcelFile,
	type AssessmentExcelTable
} from "../../_services/export-excel.server.js";
import { getAssessmentData } from "../../_services/load-assessment.server.js";
import type { AssessmentItem } from "../../_lib/types.js";
import type { RequestHandler } from "./$types.js";

function validYear(value: string | null): number | null {
	const year = Number(value);
	if (!Number.isInteger(year) || year < 2000 || year > 2200) return null;
	return year;
}

function validTable(value: string | null): AssessmentExcelTable | null {
	return value === "score" || value === "detail" ? value : null;
}

function filterQuestions(questions: AssessmentItem[], query: string): AssessmentItem[] {
	if (!query) return questions;
	const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
	return questions.filter((question) => {
		const haystack = buildSearchHaystack(question);
		return tokens.every((token) => haystack.includes(token));
	});
}

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.auth.isAuthenticated) throw error(401, "Tidak terautentikasi");
	if (!hasPermission(locals.auth.role, "assessment:read")) throw error(403, "Izin ditolak");

	const year = validYear(url.searchParams.get("year"));
	if (!year) throw error(400, "Parameter year tidak valid");

	const table = validTable(url.searchParams.get("table"));
	if (!table) throw error(400, "Parameter table tidak valid");

	const query = (url.searchParams.get("q") ?? "").trim().slice(0, 500);
	const payload = await getAssessmentData(year, locals.auth);
	if (payload.error) throw error(500, payload.error.message);

	const allQuestions = payload.data.filter(isAcgsQuestionRow) as AssessmentItem[];
	const questions = table === "detail" ? filterQuestions(allQuestions, query) : allQuestions;
	const file = await createAssessmentExcelFile({ year, table, query, questions });
	const filename =
		table === "score"
			? `skor-capaian-assessment-acgs-${year}.xlsx`
			: `detail-assessment-acgs-${year}${query ? "-filtered" : ""}.xlsx`;

	return new Response(Uint8Array.from(file), {
		headers: {
			"Cache-Control": "private, no-store",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"X-Exported-Rows": String(questions.length)
		}
	});
};
