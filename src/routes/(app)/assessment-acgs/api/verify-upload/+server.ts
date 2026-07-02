import { error, json } from "@sveltejs/kit";
import { Buffer } from "node:buffer";
import { fileTypeFromBuffer } from "file-type";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canUploadAssessmentEvidence } from "$lib/server/evidence-access.server.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { RequestHandler } from "./$types.js";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const ALLOWED_FILETYPE_EXTS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);
const ALLOWED_MIME_BY_EXT: Record<string, string> = {
	pdf: "application/pdf",
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp"
};
const EVIDENCE_BUCKET = "gcg-evidence";
const STORAGE_PATH_RE = /^[A-Za-z0-9/_\-.]+$/;

type VerifyUploadBody = {
	path?: unknown;
	fileName?: unknown;
	fileSize?: unknown;
	fileType?: unknown;
	year?: unknown;
	questionCode?: unknown;
	ext?: unknown;
};

function cleanStoragePath(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const path = value.trim();
	if (!path || path.length > 512) return null;
	if (path.startsWith("/") || path.includes("\\") || path.split("/").includes("..")) return null;
	if (!STORAGE_PATH_RE.test(path)) return null;
	return path;
}

function parseAssessmentPath(path: string): { year: number; questionCode: string; ext: string } | null {
	const segments = path.split("/");
	if (segments.length !== 4 || segments[0] !== "assessment") return null;
	const year = Number(segments[1]);
	const questionCode = segments[2];
	const ext = segments[3].split(".").pop()?.toLowerCase() ?? "";
	if (!Number.isInteger(year) || year < 2000 || year > 2200 || !questionCode || !ext) return null;
	return { year, questionCode, ext };
}

async function removeInvalidObject(path: string): Promise<void> {
	const adminDb = createAdminServerClient();
	await adminDb.storage.from(EVIDENCE_BUCKET).remove([path]);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw error(401, "Sesi tidak valid. Silakan masuk kembali.");
	}
	if (!hasPermission(locals.auth.role, "assessment:write")) {
		throw error(403, "Anda tidak memiliki izin untuk memvalidasi bukti.");
	}

	let body: VerifyUploadBody;
	try {
		body = await request.json();
	} catch {
		throw error(400, "Payload JSON tidak valid");
	}

	const path = cleanStoragePath(body.path);
	const declaredExt = typeof body.ext === "string" ? body.ext.toLowerCase() : "";
	const declaredMime = typeof body.fileType === "string" ? body.fileType.toLowerCase() : "";
	const declaredSize = typeof body.fileSize === "number" ? body.fileSize : 0;
	const targetYear = typeof body.year === "number" ? body.year : 0;
	const questionCode = typeof body.questionCode === "string" ? body.questionCode.trim() : "";
	if (!path) throw error(400, "Path file tidak valid");

	const parsed = parseAssessmentPath(path);
	if (!parsed) {
		await removeInvalidObject(path);
		throw error(400, "Path evidence tidak sesuai format assessment.");
	}
	if (targetYear !== parsed.year || !questionCode) {
		await removeInvalidObject(path);
		throw error(400, "Target assessment tidak valid.");
	}

	const ext = declaredExt || parsed.ext;
	if (!ALLOWED_FILETYPE_EXTS.has(ext) || ext !== parsed.ext) {
		await removeInvalidObject(path);
		throw error(400, "Ekstensi file tidak didukung.");
	}
	if (declaredMime !== ALLOWED_MIME_BY_EXT[ext]) {
		await removeInvalidObject(path);
		throw error(400, "Tipe file tidak sesuai dengan ekstensi.");
	}
	if (declaredSize <= 0 || declaredSize > MAX_EVIDENCE_BYTES) {
		await removeInvalidObject(path);
		throw error(400, "Ukuran file bukti maksimal 15 MB.");
	}

	const access = await canUploadAssessmentEvidence(locals.auth, targetYear, questionCode);
	if (!access.allowed) {
		await removeInvalidObject(path);
		throw error(access.status, access.message);
	}

	const adminDb = createAdminServerClient();
	const { data, error: downloadError } = await adminDb.storage.from(EVIDENCE_BUCKET).download(path);
	if (downloadError || !data) {
		throw error(500, "Gagal membaca file bukti dari storage.");
	}

	const buffer = Buffer.from(await data.arrayBuffer());
	if (buffer.length <= 0 || buffer.length > MAX_EVIDENCE_BYTES) {
		await removeInvalidObject(path);
		throw error(400, "Ukuran file bukti tidak valid.");
	}

	const detected = await fileTypeFromBuffer(buffer);
	if (!detected || detected.mime !== ALLOWED_MIME_BY_EXT[ext]) {
		await removeInvalidObject(path);
		throw error(400, "Konten file tidak sesuai dengan tipe yang diizinkan.");
	}

	return json({ ok: true });
};
