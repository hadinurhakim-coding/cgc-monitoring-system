import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { saveKeterangan } from "../../_services/save-keterangan.server.js";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Tidak terautentikasi");
	}

	let body: { year?: unknown; partId?: unknown; keterangan?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON");
	}

	const year = typeof body.year === "number" ? body.year : parseInt(String(body.year ?? ""), 10);
	if (!Number.isFinite(year)) throw error(400, "year tidak valid");

	const partId = typeof body.partId === "string" ? body.partId.trim() : "";
	const keterangan = typeof body.keterangan === "string" ? body.keterangan : "";

	if (!partId) throw error(400, "partId wajib diisi");

	const { error: saveErr } = await saveKeterangan(
		locals.auth,
		{ year, partId, keterangan }
	);

	if (saveErr) {
		const msg = saveErr.message;
		if (msg === "Tidak terautentikasi") throw error(401, msg);
		if (msg === "Izin ditolak") throw error(403, msg);
		throw error(400, msg);
	}

	return json({ ok: true });
};
