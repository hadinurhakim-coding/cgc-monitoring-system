import { error, json } from "@sveltejs/kit";
import { hasPermission } from "$lib/server/rbac.js";
import { getAssessmentPageData } from "../../_services/load-assessment.server.js";
import type { RequestHandler } from "./$types.js";

/** On-demand recompute ringkasan tahun (persist ke `acgs_year_summaries` lewat alur load). */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.userId) throw error(401, "Tidak terautentikasi");
	if (!hasPermission(locals.auth.role, "assessment:write")) throw error(403, "Izin ditolak");

	let year: number;
	try {
		const body = await request.json();
		year = Number(body?.year);
	} catch {
		throw error(400, "Body JSON tidak valid");
	}
	if (!Number.isFinite(year) || year < 2000 || year > 2200) {
		throw error(400, "Parameter year tidak valid");
	}

	const payload = await getAssessmentPageData(year, {});
	if (payload.error) {
		throw error(500, payload.error.message ?? "Gagal recompute");
	}

	return json({ ok: true, year });
};
