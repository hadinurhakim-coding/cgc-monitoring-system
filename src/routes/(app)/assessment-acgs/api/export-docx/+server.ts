import { error } from "@sveltejs/kit";
import { hasPermission } from "$lib/server/rbac.js";
import { isAcgsQuestionRow } from "../../_lib/acgs-question-utils.js";
import { buildAcgsAssessmentDocx } from "../../_services/export-docx.server.js";
import { getAssessmentData } from "../../_services/load-assessment.server.js";
import type { AssessmentItem } from "../../_lib/types.js";
import type { RequestHandler } from "./$types.js";

function validYear(value: string | null): number | null {
	const year = Number(value);
	if (!Number.isInteger(year) || year < 2000 || year > 2200) return null;
	return year;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Tidak terautentikasi");
	}
	if (!hasPermission(locals.auth.role, "assessment:read")) {
		throw error(403, "Izin ditolak");
	}

	const year = validYear(url.searchParams.get("year"));
	if (!year) throw error(400, "Parameter year tidak valid");

	const payload = await getAssessmentData(year, locals.auth);
	if (payload.error) {
		throw error(500, payload.error.message);
	}

	const questions = payload.data.filter(isAcgsQuestionRow) as AssessmentItem[];
	const buffer = await buildAcgsAssessmentDocx({
		year,
		questions,
		origin: url.origin
	});
	const filename = `assessment-acgs-${year}.docx`;

	return new Response(new Uint8Array(buffer), {
		headers: {
			"Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Cache-Control": "no-store"
		}
	});
};
