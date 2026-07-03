import { error, json } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { isAdminRole } from "$lib/server/rbac.js";
import { getAssessmentPageData } from "../../_services/load-assessment.server.js";
import { persistYearSummary } from "../../_lib/acgs-summary.server.js";
import type { RequestHandler } from "./$types.js";

/** On-demand recompute ringkasan tahun — persist ke `acgs_year_summaries`. */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.userId) throw error(401, "Tidak terautentikasi");
	if (!isAdminRole(locals.auth.role)) throw error(403, "Recompute ringkasan global hanya untuk admin");

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

	const payload = await getAssessmentPageData(year, locals.auth, {});
	if (payload.error) {
		throw error(500, payload.error.message ?? "Gagal recompute");
	}

	const adminDb = createAdminServerClient();
	const { score_pct, overall_score, max_score, error: persistErr } = await persistYearSummary(
		adminDb,
		year,
		payload.questions
	);

	if (persistErr) {
		throw error(500, persistErr.message);
	}

	return json({ ok: true, year, score_pct, overall_score, max_score });
};
