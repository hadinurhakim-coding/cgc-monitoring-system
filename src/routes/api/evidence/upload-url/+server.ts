import { randomUUID } from "node:crypto";
import { error, json } from "@sveltejs/kit";
import { ACCESS_TOKEN_COOKIE, createUserServerClient } from "$lib/server/auth.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { RequestHandler } from "./$types.js";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const ALLOWED_FILETYPE_EXTS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);
const EVIDENCE_BUCKET = "gcg-evidence";

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
	if (!accessToken) {
		throw error(401, "Sesi tidak valid. Silakan masuk kembali.");
	}

	const db = createUserServerClient(accessToken);
	if (!hasPermission(locals.auth.role, "assessment:write")) {
		throw error(403, "Anda tidak memiliki izin (role) untuk mengunggah bukti.");
	}

	let body: {
		fileName: string;
		fileSize: number;
		fileType: string;
		year: number;
		questionCode: string;
		ext: string;
	};

	try {
		body = await request.json();
	} catch (e) {
		throw error(400, "Invalid JSON payload");
	}

	if (!body.year || !body.questionCode || !body.fileName || !body.fileType || !body.ext) {
		throw error(400, "Incomplete payload");
	}

	if (body.fileSize > MAX_EVIDENCE_BYTES) {
		throw error(400, "Ukuran file bukti maksimal 15 MB.");
	}

	const ext = body.ext.toLowerCase();
	if (!ALLOWED_FILETYPE_EXTS.has(ext)) {
		throw error(400, "Ekstensi file tidak didukung. Unggah PDF, JPG, PNG, atau WEBP.");
	}

	// Create path
	const objectPath = `assessment/${body.year}/${body.questionCode.replace(/[^a-zA-Z0-9_-]/g, "_")}/${randomUUID()}.${ext}`;

	// Request signed URL from Supabase
	const { data, error: urlError } = await db.storage
		.from(EVIDENCE_BUCKET)
		.createSignedUploadUrl(objectPath);

	if (urlError || !data?.signedUrl) {
		console.error("Failed to create signed upload url:", urlError?.message);
		throw error(500, "Gagal membuat URL keamanan server. Silakan coba lagi.");
	}

	return json({
		signedUrl: data.signedUrl,
		path: objectPath
	});
};
