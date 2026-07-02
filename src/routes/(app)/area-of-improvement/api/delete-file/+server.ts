import { error, json } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canAccessAoiEvidencePath } from "$lib/server/evidence-access.server.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { RequestHandler } from "./$types.js";

const EVIDENCE_BUCKET = "gcg-evidence";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Sesi tidak valid. Silakan masuk kembali.");
	}

	if (!hasPermission(locals.auth.role, "assessment:write")) {
		throw error(403, "Anda tidak memiliki izin untuk menghapus file.");
	}

	const adminDb = createAdminServerClient();

	let body: { path?: string };
	try {
		body = await request.json();
	} catch {
		throw error(400, "Payload JSON tidak valid");
	}

	if (!body.path) {
		throw error(400, "Path file tidak disediakan");
	}

	const access = await canAccessAoiEvidencePath(locals.auth, body.path);
	if (!access.allowed) {
		throw error(access.status, access.message);
	}

	const { error: deleteError } = await adminDb.storage
		.from(EVIDENCE_BUCKET)
		.remove([access.path]);

	if (deleteError) {
		console.error("Gagal menghapus file dari storage:", deleteError.message);
		throw error(500, "Gagal menghapus file secara fisik dari server.");
	}

	return json({ success: true });
};
