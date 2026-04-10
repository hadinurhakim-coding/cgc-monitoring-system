import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import { persistYearSummary } from "../_lib/acgs-summary.server.js";

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

	// Ambil year untuk recompute ringkasan (row harus ada)
	const { data: prevRow, error: prevErr } = await admin
		.from("acgs_assessments")
		.select("uid,year,item_id")
		.eq("uid", rowUid)
		.maybeSingle();

	if (prevErr) return { error: new Error(prevErr.message) };
	if (!prevRow?.uid) return { error: new Error("Row tidak ditemukan") };

	// UPDATE + audit log ditulis oleh trigger dalam satu transaksi atomik.
	// Tidak perlu insert manual ke assessment_change_logs.
	const { error: rpcErr } = await admin.rpc("save_acgs_assessment_field", {
		p_row_uid:     rowUid,
		p_field:       input.field,
		p_value:       input.value,
		p_user_id:     auth.userId,
		p_user_email:  auth.email ?? "",
		p_division_id: auth.divisionId ?? null
	});

	if (rpcErr) {
		return { error: new Error(rpcErr.message) };
	}

	// Non-fatal: refresh ringkasan tahun setelah save berhasil.
	const year = Number(prevRow.year ?? 0);
	const summaryYear = Number.isFinite(year) && year >= 2000 && year <= 2200 ? year : 0;
	if (summaryYear) {
		const { data: yearQuestions } = await admin
			.from("acgs_assessments")
			.select("type,status,evidence,item_id,part_id,part,level,level_label")
			.eq("year", summaryYear)
			.in("type", ["question", "acgs"]);

		if (yearQuestions?.length) {
			const { error: summaryErr } = await persistYearSummary(admin, summaryYear, yearQuestions);
			if (summaryErr) {
				console.warn("[acgs_year_summaries] upsert failed:", summaryErr.message);
			}
		}
	}

	return { error: null };
}
