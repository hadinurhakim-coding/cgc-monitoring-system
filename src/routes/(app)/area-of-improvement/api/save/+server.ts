import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { saveAoiField } from "../../_services/save-aoi-field.server.js";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Tidak terautentikasi");
	}

	let body: { uid?: unknown; field?: unknown; value?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON");
	}

	const uid = typeof body.uid === "string" ? body.uid : "";
	const field = typeof body.field === "string" ? body.field : "";
	const value = typeof body.value === "string" ? body.value : "";

	const { error: saveErr } = await saveAoiField(
		locals.auth,
		{ uid, field, value }
	);

	if (saveErr) {
		const msg = saveErr.message;
		if (msg === "Tidak terautentikasi") throw error(401, msg);
		if (msg === "Izin ditolak") throw error(403, msg);
		throw error(400, msg);
	}

	return json({ ok: true });
};
