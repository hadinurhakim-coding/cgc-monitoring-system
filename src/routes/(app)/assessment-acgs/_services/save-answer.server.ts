import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole } from "$lib/server/rbac.js";
import { syncAoiItemsForYear } from "../../area-of-improvement/_services/load-aoi.server.js";
import { persistYearSummary } from "../_lib/acgs-summary.server.js";
import { canKeepRecommendationForNonNoStatus } from "../_lib/recommendation-rules.js";
import { getAssessmentQuestionRowsForYear } from "./assessment-service.server.js";

const ALLOWED_FIELDS = new Set(["implementation", "evidence", "status", "recommendation"]);
const CLEAR_RECOMMENDATION_STATUSES = new Set(["YES", "NA"]);

type AdminDb = ReturnType<typeof createAdminServerClient>;

type ItemLookup = {
	uid: string;
	type: string | null;
	item_id: string | null;
};

type AnswerLookup = {
	uid: string;
	year: number;
	item_uid: string;
	status: string | null;
	recommendation: string | null;
};

export type SaveAnswerAuth = {
	userId: string | null;
	role: string | null;
	email: string | null;
	divisionId: string | null;
};

function normalizeStatusInput(status: string): "YES" | "NO" | "NA" | "" | null {
	const normalized = status.trim().toUpperCase();
	if (!normalized) return "";
	if (normalized === "Y") return "YES";
	if (normalized === "N") return "NO";
	if (normalized === "YES" || normalized === "NO" || normalized === "NA") return normalized;
	return null;
}

function isNoStatus(status: string | null | undefined): boolean {
	const normalized = normalizeStatusInput(String(status ?? ""));
	return normalized === "NO";
}

function validYear(year: number): boolean {
	return Number.isInteger(year) && year >= 2000 && year <= 2200;
}

function isQuestionType(type: string | null | undefined): boolean {
	const value = String(type ?? "").toLowerCase();
	return value === "question" || value === "acgs";
}

async function findAnswerByUid(admin: AdminDb, uid: string): Promise<AnswerLookup | null> {
	if (!uid) return null;
	const { data, error } = await admin
		.from("acgs_assessment_answers")
		.select("uid,year,item_uid,status,recommendation")
		.eq("uid", uid)
		.maybeSingle();
	if (error) throw new Error(error.message);
	return (data as AnswerLookup | null) ?? null;
}

async function findItem(admin: AdminDb, itemUid: string): Promise<ItemLookup | null> {
	if (!itemUid) return null;
	const { data, error } = await admin
		.from("acgs_items")
		.select("uid,type,item_id")
		.eq("uid", itemUid)
		.eq("is_active", true)
		.maybeSingle();
	if (error) throw new Error(error.message);
	return (data as ItemLookup | null) ?? null;
}

async function findAnswerForItemYear(
	admin: AdminDb,
	itemUid: string,
	year: number
): Promise<AnswerLookup | null> {
	const { data, error } = await admin
		.from("acgs_assessment_answers")
		.select("uid,year,item_uid,status,recommendation")
		.eq("item_uid", itemUid)
		.eq("year", year)
		.is("division_id", null)
		.maybeSingle();
	if (error) throw new Error(error.message);
	return (data as AnswerLookup | null) ?? null;
}

async function saveAnswerValue(params: {
	admin: AdminDb;
	existing: AnswerLookup | null;
	itemUid: string;
	year: number;
	field: string;
	value: string;
	auth: SaveAnswerAuth;
	clearRecommendation: boolean;
}): Promise<{ answerUid: string; error: Error | null }> {
	const now = new Date().toISOString();
	const patch: Record<string, unknown> = {
		[params.field]: params.value,
		updated_by: params.auth.userId,
		updated_at: now
	};
	if (params.clearRecommendation) patch.recommendation = "";

	if (params.existing) {
		const { data, error } = await params.admin
			.from("acgs_assessment_answers")
			.update(patch)
			.eq("uid", params.existing.uid)
			.select("uid")
			.single();
		if (error) return { answerUid: params.existing.uid, error: new Error(error.message) };
		const row = data as { uid?: string } | null;
		return { answerUid: row?.uid ?? params.existing.uid, error: null };
	}

	const insertRow: Record<string, unknown> = {
		year: params.year,
		item_uid: params.itemUid,
		division_id: null,
		implementation: "",
		evidence: "",
		status: "",
		recommendation: "",
		notes: null,
		created_by: params.auth.userId,
		updated_by: params.auth.userId,
		created_at: now,
		updated_at: now,
		[params.field]: params.value
	};
	if (params.clearRecommendation) insertRow.recommendation = "";

	const { data, error } = await params.admin
		.from("acgs_assessment_answers")
		.insert(insertRow)
		.select("uid")
		.single();
	if (error) return { answerUid: "", error: new Error(error.message) };
	const row = data as { uid?: string } | null;
	return { answerUid: row?.uid ?? "", error: null };
}

export async function saveAssessmentAnswer(
	auth: SaveAnswerAuth,
	input: { row_uid: string; item_uid?: string; year: number; field: string; value: string }
): Promise<{ answerUid: string | null; error: Error | null }> {
	if (!auth.userId) return { answerUid: null, error: new Error("Tidak terautentikasi") };
	if (!hasPermission(auth.role, "assessment:write")) {
		return { answerUid: null, error: new Error("Izin ditolak") };
	}
	if (!ALLOWED_FIELDS.has(input.field)) {
		return { answerUid: null, error: new Error("Field tidak valid") };
	}

	const admin = createAdminServerClient();
	const rowUid = input.row_uid?.trim() ?? "";
	const inputItemUid = input.item_uid?.trim() ?? "";
	let itemUid = inputItemUid || rowUid;
	let year = input.year;
	let answerFromUid: AnswerLookup | null = null;

	try {
		answerFromUid = await findAnswerByUid(admin, rowUid);
		if (answerFromUid && !inputItemUid) itemUid = answerFromUid.item_uid;
		if (answerFromUid && !validYear(year)) year = answerFromUid.year;

		if (!itemUid) return { answerUid: null, error: new Error("item_uid wajib diisi") };
		if (!validYear(year)) return { answerUid: null, error: new Error("Tahun tidak valid") };

		const item = await findItem(admin, itemUid);
		if (!item?.uid || !isQuestionType(item.type)) {
			return { answerUid: null, error: new Error("Item assessment tidak ditemukan") };
		}
		const existing = answerFromUid?.item_uid === itemUid && answerFromUid.year === year
			? answerFromUid
			: await findAnswerForItemYear(admin, itemUid, year);

		let valueToSave = input.value;
		let clearRecommendation = false;
		if (input.field === "status") {
			const normalizedStatus = normalizeStatusInput(input.value);
			if (normalizedStatus == null) {
				return { answerUid: null, error: new Error("Status tidak valid") };
			}
			valueToSave = normalizedStatus;
			clearRecommendation =
				CLEAR_RECOMMENDATION_STATUSES.has(normalizedStatus) &&
				!canKeepRecommendationForNonNoStatus({
					year,
					itemId: item.item_id,
					status: normalizedStatus
				});
		}

		if (
			input.field === "recommendation" &&
			input.value.trim() &&
			!isNoStatus(existing?.status) &&
			!canKeepRecommendationForNonNoStatus({
				year,
				itemId: item.item_id,
				status: existing?.status
			})
		) {
			return {
				answerUid: null,
				error: new Error("Rekomendasi hanya bisa diisi ketika status NO")
			};
		}

		const saveRes = await saveAnswerValue({
			admin,
			existing,
			itemUid,
			year,
			field: input.field,
			value: valueToSave,
			auth,
			clearRecommendation
		});
		if (saveRes.error) return { answerUid: null, error: saveRes.error };

		if (isAdminRole(auth.role)) {
			const { questions, error: loadErr } = await getAssessmentQuestionRowsForYear(admin, year);
			if (!loadErr && questions.length) {
				const { error: summaryErr } = await persistYearSummary(admin, year, questions);
				if (summaryErr) {
					console.warn("[acgs_year_summaries] upsert failed:", summaryErr.message);
				}
			}
		}

		if (input.field === "implementation" || input.field === "recommendation") {
			const syncErr = await syncAoiItemsForYear(year, {
				userId: auth.userId,
				email: auth.email,
				role: auth.role,
				divisionId: auth.divisionId,
				isAuthenticated: true
			});
			if (syncErr) {
				console.warn("[aoi_items] sync after assessment save failed:", syncErr.message);
			}
		}

		return { answerUid: saveRes.answerUid || null, error: null };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Gagal menyimpan jawaban";
		return { answerUid: null, error: new Error(message) };
	}
}
