import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";

const ALLOWED_FIELDS = new Set(["implementation", "evidence", "status", "recommendation"]);

export type SaveAnswerAuth = {
	userId: string | null;
	role: string | null;
};

export async function saveAssessmentAnswer(
	auth: SaveAnswerAuth,
	input: { row_uid: string; field: string; value: string }
): Promise<{ error: Error | null }> {
	if (!auth.userId) {
		return { error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:write")) {
		return { error: new Error("Izin ditolak") };
	}
	const rowUid = input.row_uid?.trim();
	if (!rowUid) {
		return { error: new Error("row_uid wajib diisi") };
	}
	if (!ALLOWED_FIELDS.has(input.field)) {
		return { error: new Error("Field tidak valid") };
	}

	const admin = createAdminServerClient();
	const payload: Record<string, unknown> = {
		updated_at: new Date().toISOString()
	};
	if (input.field === "status") {
		payload.status = input.value.toLowerCase();
	} else {
		payload[input.field] = input.value;
	}

	const { error: dbError } = await admin.from("acgs_assessments").update(payload).eq("uid", rowUid);

	if (dbError) {
		return { error: new Error(dbError.message) };
	}
	return { error: null };
}
