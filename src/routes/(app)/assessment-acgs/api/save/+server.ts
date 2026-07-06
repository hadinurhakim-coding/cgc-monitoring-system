import { error, json } from "@sveltejs/kit";
import { saveAssessmentAnswer } from "../../_services/save-answer.server.js";
import type { RequestHandler } from "./$types.js";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Tidak terautentikasi");
	}

	let body: { row_uid?: string; item_uid?: string | null; year?: unknown; field?: string; value?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON");
	}

	const row_uid = typeof body.row_uid === "string" ? body.row_uid : "";
	const item_uid = typeof body.item_uid === "string" ? body.item_uid : "";
	const year = typeof body.year === "number" ? body.year : Number(body.year);
	const field = typeof body.field === "string" ? body.field : "";
	const value = typeof body.value === "string" ? body.value : "";

	const { answerUid, error: saveErr } = await saveAssessmentAnswer(
		{
			userId: locals.auth.userId,
			role: locals.auth.role,
			email: locals.auth.email,
			divisionId: locals.auth.divisionId
		},
		{ row_uid, item_uid, year, field, value }
	);

	if (saveErr) {
		const msg = saveErr.message;
		if (msg === "Tidak terautentikasi") throw error(401, msg);
		if (msg === "Izin ditolak") throw error(403, msg);
		throw error(400, msg);
	}

	return json({ ok: true, answerUid });
};
