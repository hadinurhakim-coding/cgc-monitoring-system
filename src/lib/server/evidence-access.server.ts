import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canAccessDivision } from "$lib/server/rbac.js";
import { extractEvidenceFiles } from "$lib/evidence-utils.js";

type EvidenceAuth = App.Locals["auth"];

type EvidenceAccessFailureStatus = 400 | 403 | 500;

type EvidenceAccessFailure = {
	allowed: false;
	status: EvidenceAccessFailureStatus;
	message: string;
};

type EvidencePathAccessResult =
	| { allowed: true; path: string }
	| EvidenceAccessFailure;

type EvidenceTargetAccessResult =
	| { allowed: true }
	| { allowed: false; status: EvidenceAccessFailureStatus; message: string };

const MAX_STORAGE_PATH_LENGTH = 512;
const STORAGE_PATH_RE = /^[A-Za-z0-9/_\-.]+$/;
const QUESTION_TYPES = ["question", "acgs"] as const;

function normalizeStoragePath(path: string | null | undefined): string | null {
	const value = path?.trim() ?? "";
	if (!value || value.length > MAX_STORAGE_PATH_LENGTH) return null;
	if (value.startsWith("/") || value.includes("\\") || !STORAGE_PATH_RE.test(value)) return null;
	if (value.split("/").includes("..")) return null;
	return value;
}

function stringField(row: Record<string, unknown>, field: string): string {
	return String(row[field] ?? "");
}

function nullableStringField(row: Record<string, unknown>, field: string): string | null {
	return row[field] != null ? String(row[field]) : null;
}

function evidenceHasPath(evidence: string, path: string): boolean {
	return extractEvidenceFiles(evidence).some((file) => file.path === path);
}

function invalidPath(): EvidenceAccessFailure {
	return { allowed: false, status: 400, message: "Path file tidak valid" };
}

function denied(): EvidenceAccessFailure {
	return { allowed: false, status: 403, message: "Akses file ditolak" };
}

function databaseFailure(message: string): EvidenceAccessFailure {
	console.error("Evidence access validation failed:", message);
	return { allowed: false, status: 500, message: "Gagal memvalidasi akses file" };
}

function validYear(year: number): boolean {
	return Number.isInteger(year) && year >= 2000 && year <= 2200;
}

export async function canAccessAssessmentEvidencePath(
	auth: EvidenceAuth,
	path: string | null | undefined
): Promise<EvidencePathAccessResult> {
	const storagePath = normalizeStoragePath(path);
	if (!storagePath || !storagePath.startsWith("assessment/")) return invalidPath();

	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("acgs_assessments")
		.select("uid,division_id,evidence")
		.ilike("evidence", `%[FILE:${storagePath}%`)
		.limit(50);

	if (error) return databaseFailure(error.message);

	const rows = (data ?? []) as Record<string, unknown>[];
	const allowed = rows.some((row) => {
		const rowDivisionId = nullableStringField(row, "division_id");
		const evidence = stringField(row, "evidence");
		return canAccessDivision(auth, rowDivisionId) && evidenceHasPath(evidence, storagePath);
	});

	return allowed ? { allowed: true, path: storagePath } : denied();
}

export async function canAccessAoiEvidencePath(
	auth: EvidenceAuth,
	path: string | null | undefined
): Promise<EvidencePathAccessResult> {
	const storagePath = normalizeStoragePath(path);
	if (!storagePath || !storagePath.startsWith("aoi/")) return invalidPath();

	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("aoi_items")
		.select("uid,division_id,eviden")
		.ilike("eviden", `%[FILE:${storagePath}%`)
		.limit(50);

	if (error) return databaseFailure(error.message);

	const rows = (data ?? []) as Record<string, unknown>[];
	const allowed = rows.some((row) => {
		const rowDivisionId = nullableStringField(row, "division_id");
		const evidence = stringField(row, "eviden");
		return canAccessDivision(auth, rowDivisionId) && evidenceHasPath(evidence, storagePath);
	});

	return allowed ? { allowed: true, path: storagePath } : denied();
}

export async function canUploadAssessmentEvidence(
	auth: EvidenceAuth,
	year: number,
	questionCode: string
): Promise<EvidenceTargetAccessResult> {
	const normalizedQuestionCode = questionCode.trim();
	if (!validYear(year) || !normalizedQuestionCode) {
		return { allowed: false, status: 400, message: "Target assessment tidak valid" };
	}

	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("acgs_assessments")
		.select("uid,division_id,type")
		.eq("year", year)
		.eq("item_id", normalizedQuestionCode)
		.in("type", [...QUESTION_TYPES])
		.limit(1);

	if (error) return databaseFailure(error.message);

	const row = ((data ?? []) as Record<string, unknown>[])[0];
	if (!row) return denied();

	const rowDivisionId = nullableStringField(row, "division_id");
	return canAccessDivision(auth, rowDivisionId) ? { allowed: true } : denied();
}

export async function canUploadAoiEvidence(
	auth: EvidenceAuth,
	year: number,
	itemUid: string
): Promise<EvidenceTargetAccessResult> {
	const uid = itemUid.trim();
	if (!validYear(year) || !uid) {
		return { allowed: false, status: 400, message: "Target AOI tidak valid" };
	}

	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("aoi_items")
		.select("uid,division_id")
		.eq("year", year)
		.eq("uid", uid)
		.limit(1);

	if (error) return databaseFailure(error.message);

	const row = ((data ?? []) as Record<string, unknown>[])[0];
	if (!row) return denied();

	const rowDivisionId = nullableStringField(row, "division_id");
	return canAccessDivision(auth, rowDivisionId) ? { allowed: true } : denied();
}
