import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { addAoiItem } from "../../_services/add-aoi-item.server.js";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Tidak terautentikasi");
	}

	let body: { year?: unknown; sectionId?: unknown; standarLabel?: unknown; partId?: unknown; levelLabel?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON");
	}

	const year = typeof body.year === "number" ? body.year : parseInt(String(body.year ?? ""), 10);
	if (!Number.isFinite(year)) throw error(400, "year tidak valid");

	const sectionId = typeof body.sectionId === "string" ? body.sectionId.trim() : "";
	const standarLabel = typeof body.standarLabel === "string" ? body.standarLabel.trim() : "";
	const partId = typeof body.partId === "string" ? body.partId.trim() : "";
	const levelLabel = typeof body.levelLabel === "string" ? body.levelLabel.trim() : "";

	if (!sectionId || !standarLabel || !partId || !levelLabel) {
		throw error(400, "sectionId, standarLabel, partId, dan levelLabel wajib diisi");
	}

	const { data: item, error: addErr } = await addAoiItem(
		locals.auth,
		{ year, sectionId, standarLabel, partId, levelLabel }
	);

	if (addErr) {
		const msg = addErr.message;
		if (msg === "Tidak terautentikasi") throw error(401, msg);
		if (msg === "Izin ditolak") throw error(403, msg);
		throw error(400, msg);
	}

	return json({ ok: true, item });
};
