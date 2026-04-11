import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { deleteAoiItem } from "../../_services/delete-aoi-item.server.js";

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: { uid?: unknown };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON");
	}

	const uid = typeof body.uid === "string" ? body.uid.trim() : "";
	if (!uid) throw error(400, "uid wajib diisi");

	const { error: delErr } = await deleteAoiItem(
		{
			userId: locals.auth.userId,
			role: locals.auth.role,
			email: locals.auth.email,
			divisionId: locals.auth.divisionId,
		},
		uid
	);

	if (delErr) {
		const msg = delErr.message;
		if (msg === "Tidak terautentikasi") throw error(401, msg);
		if (msg === "Izin ditolak") throw error(403, msg);
		throw error(400, msg);
	}

	return json({ ok: true });
};
