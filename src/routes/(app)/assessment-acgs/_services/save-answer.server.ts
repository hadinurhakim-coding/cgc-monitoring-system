import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";

const ALLOWED_FIELDS = new Set(["implementation", "evidence", "status", "recommendation"]);

export type SaveAnswerAuth = {
	userId: string | null;
	role: string | null;
	email: string | null;
	divisionId: string | null;
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

	const { data: prevRow, error: prevErr } = await admin
		.from("acgs_assessments")
		.select("uid,year,item_id,implementation,evidence,status,recommendation")
		.eq("uid", rowUid)
		.maybeSingle();

	if (prevErr) {
		return { error: new Error(prevErr.message) };
	}
	if (!prevRow?.uid) {
		return { error: new Error("Row tidak ditemukan") };
	}

	const oldValue =
		input.field === "implementation"
			? String(prevRow.implementation ?? "")
			: input.field === "evidence"
				? String(prevRow.evidence ?? "")
				: input.field === "status"
					? String(prevRow.status ?? "")
					: String(prevRow.recommendation ?? "");

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

	// Audit log: siapa mengubah apa, kapan.
	const userEmail = auth.email ?? "";
	const year = Number(prevRow.year ?? 0);
	const itemId = prevRow.item_id != null ? String(prevRow.item_id) : null;
	const newValue = input.field === "status" ? input.value.toLowerCase() : input.value;

	const { error: auditErr } = await admin.from("assessment_change_logs").insert({
		user_id: auth.userId,
		user_email: userEmail,
		division_id: auth.divisionId,
		assessment_uid: prevRow.uid,
		year: Number.isFinite(year) ? year : 0,
		item_id: itemId,
		field: input.field,
		old_value: oldValue,
		new_value: newValue
	});

	if (auditErr) {
		console.warn("[assessment_change_logs] insert failed:", auditErr.message);
	}
	return { error: null };
}
