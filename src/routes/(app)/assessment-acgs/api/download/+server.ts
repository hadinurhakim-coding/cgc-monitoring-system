import { error, redirect } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { RequestHandler } from "./$types.js";

const EVIDENCE_BUCKET = "gcg-evidence";

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.auth.isAuthenticated) throw error(401, "Sesi tidak valid");

	if (!hasPermission(locals.auth.role, "assessment:read")) {
		throw error(403, "Akses ditolak");
	}

	const path = url.searchParams.get("path");
	if (!path) throw error(400, "Path wajib diisi");

	const adminDb = createAdminServerClient();
	const { data, error: urlError } = await adminDb.storage
		.from(EVIDENCE_BUCKET)
		.createSignedUrl(path, 60, {
			download: true
		});

	if (urlError || !data?.signedUrl) {
		console.error("Download Error:", urlError?.message);
		throw error(500, "Gagal mendapatkan tautan file aman.");
	}

	throw redirect(302, data.signedUrl);
};
