import { randomUUID } from "node:crypto";
import { error, json } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { RequestHandler } from "./$types.js";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const ALLOWED_FILETYPE_EXTS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);
const EVIDENCE_BUCKET = "gcg-evidence";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Sesi tidak valid. Silakan masuk kembali.");
	}

	if (!hasPermission(locals.auth.role, "assessment:write")) {
		throw error(403, "Anda tidak memiliki izin (role) untuk mengunggah bukti.");
	}

	let body: {
		fileName: string;
		fileSize: number;
		fileType: string;
		year: number;
		itemUid: string;
		ext: string;
	};

	try {
		body = await request.json();
	} catch {
		throw error(400, "Invalid JSON payload");
	}

	if (!body.year || !body.itemUid || !body.fileName || !body.fileType || !body.ext) {
		throw error(400, "Incomplete payload");
	}

	if (body.fileSize > MAX_EVIDENCE_BYTES) {
		throw error(400, "Ukuran file bukti maksimal 15 MB.");
	}

	const ext = body.ext.toLowerCase();
	if (!ALLOWED_FILETYPE_EXTS.has(ext)) {
		throw error(400, "Ekstensi file tidak didukung. Unggah PDF, JPG, PNG, atau WEBP.");
	}

	const adminDb = createAdminServerClient();
	const objectPath = `aoi/${body.year}/${body.itemUid.replace(/[^a-zA-Z0-9_-]/g, "_")}/${randomUUID()}.${ext}`;

	const { data, error: urlError } = await adminDb.storage
		.from(EVIDENCE_BUCKET)
		.createSignedUploadUrl(objectPath);

	if (urlError || !data?.signedUrl) {
		console.error("Failed to create signed upload url:", urlError?.message);
		throw error(500, "Gagal membuat URL keamanan server. Silakan coba lagi.");
	}

	return json({ signedUrl: data.signedUrl, path: objectPath });
};
