import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import { ACCESS_TOKEN_COOKIE } from "$lib/server/auth/cookies.js";

type TrendPoint = {
	year: number;
	question_count: number;
	points_sum: number;
	score_pct: number;
	overall_score: number;
	payload: Record<string, unknown>;
	updated_at: string;
};

type AuditRow = {
	id: number;
	created_at: string;
	user_id: string;
	user_email: string;
	division_id: string | null;
	assessment_uid: string;
	year: number;
	item_id: string | null;
	field: string;
	old_value: string | null;
	new_value: string | null;
};

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	if (!hasPermission(locals.auth.role, "dashboard:read")) {
		throw error(403, "Akses dashboard ditolak");
	}

	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE) ?? "";
	const admin = createAdminServerClient();

	const nowYear = new Date().getFullYear();
	const yearStr = url.searchParams.get("year") ?? String(nowYear);
	const selectedYear = /^\d{4}$/.test(yearStr) ? parseInt(yearStr, 10) : nowYear;
	const search = (url.searchParams.get("q") ?? "").trim();

	const canAct = locals.auth.role === "admin" || locals.auth.role === "bpo";
	const isAdmin = locals.auth.role === "admin";
	const divisionId = locals.auth.divisionId;

	// 1) Tren tahunan (global) — tidak pakai filter divisi.
	const { data: trendRows, error: trendErr } = await admin
		.from("acgs_year_summaries")
		.select("year,question_count,points_sum,score_pct,payload,updated_at")
		.order("year", { ascending: true });

	if (trendErr) console.warn("[dashboard] acgs_year_summaries query failed:", trendErr.message);

	const trend = (trendRows ?? []).map((r) => {
		const payload = (r.payload ?? {}) as Record<string, unknown>;
		return {
			year: Number(r.year),
			question_count: Number(r.question_count ?? 0),
			points_sum: Number(r.points_sum ?? 0),
			score_pct: Number(r.score_pct ?? 0),
			overall_score: Number((payload as Record<string, unknown>)?.overallScore ?? 0),
			payload,
			updated_at: String(r.updated_at ?? "")
		};
	}) satisfies TrendPoint[];

	// 2) Aktivitas terbaru (audit log) — dibatasi divisi untuk bpo/viewer.
	let auditQ = admin
		.from("assessment_change_logs")
		.select("id,created_at,user_id,user_email,division_id,assessment_uid,year,item_id,field,old_value,new_value")
		.order("created_at", { ascending: false })
		.eq("year", selectedYear)
		.limit(20);

	if (!isAdmin) {
		// bpo/viewer: hanya divisi sendiri
		if (!divisionId) {
			auditQ = auditQ.limit(0);
		} else {
			auditQ = auditQ.eq("division_id", divisionId);
		}
	}

	if (search) {
		// Search fokus untuk audit table.
		// supabase-js: or() pakai string filter.
		const q = search.replace(/[,]/g, " ").trim();
		if (q) {
			auditQ = auditQ.or(`user_email.ilike.%${q}%,field.ilike.%${q}%,item_id.ilike.%${q}%`);
		}
	}

	const { data: auditRows, error: auditErr } = await auditQ;
	if (auditErr) console.warn("[dashboard] assessment_change_logs query failed:", auditErr.message);

	const activity = (auditRows ?? []).map((r) => ({
		id: Number(r.id),
		created_at: String(r.created_at ?? ""),
		user_id: String(r.user_id ?? ""),
		user_email: String(r.user_email ?? ""),
		division_id: r.division_id != null ? String(r.division_id) : null,
		assessment_uid: String(r.assessment_uid ?? ""),
		year: Number(r.year ?? selectedYear),
		item_id: r.item_id != null ? String(r.item_id) : null,
		field: String(r.field ?? ""),
		old_value: r.old_value != null ? String(r.old_value) : null,
		new_value: r.new_value != null ? String(r.new_value) : null
	})) satisfies AuditRow[];

	return {
		canAct,
		selectedYear,
		search,
		trend,
		activity,
		accessToken
	};
};
