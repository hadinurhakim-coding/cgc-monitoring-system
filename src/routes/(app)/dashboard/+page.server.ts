import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole, scopedDivisionId } from "$lib/server/rbac.js";
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
	actor_user_id: string | null;
	actor_email: string;
	actor_role: string | null;
	division_id: string | null;
	page_path: string;
	action: string;
	entity_type: string;
	entity_id: string;
	entity_label: string | null;
	year: number;
	field: string;
	old_value: string | null;
	new_value: string | null;
	metadata: Record<string, unknown>;
};

const AUDIT_PAGE_PATHS = new Set([
	"/assessment-acgs",
	"/area-of-improvement",
	"/monitoring-aoi"
]);

const AUDIT_FIELDS = new Set([
	"implementation",
	"evidence",
	"status",
	"recommendation",
	"fakta_temuan",
	"tindak_lanjut_rekomendasi",
	"pic",
	"target_waktu_penyelesaian",
	"status_rekomendasi",
	"eviden",
	"keterangan"
]);

function sanitizeAuditSearch(value: string): string {
	return value
		.trim()
		.slice(0, 80)
		.replace(/[^a-zA-Z0-9@._/\s-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function auditFieldAlias(value: string): string | null {
	const normalized = value.trim().toLocaleLowerCase("id-ID");
	if (["implementasi", "penerapan"].some((term) => normalized.includes(term))) return "implementation";
	if (["bukti", "dokumen"].some((term) => normalized.includes(term))) return "evidence";
	if (normalized.includes("fakta temuan")) return "fakta_temuan";
	if (normalized.includes("tindak lanjut")) return "tindak_lanjut_rekomendasi";
	if (normalized.includes("penanggung jawab") || normalized === "pic") return "pic";
	if (normalized.includes("target") && normalized.includes("selesai")) return "target_waktu_penyelesaian";
	if (normalized.includes("progress")) return "status_rekomendasi";
	if (normalized.includes("eviden")) return "eviden";
	if (normalized.includes("keterangan")) return "keterangan";
	if (normalized.includes("status")) return "status";
	if (normalized.includes("rekomendasi")) return "recommendation";
	return null;
}

function auditPageAlias(value: string): string | null {
	const normalized = value.trim().toLocaleLowerCase("id-ID");
	if (normalized.includes("assessment") || normalized.includes("acgs")) return "/assessment-acgs";
	if (normalized.includes("monitoring")) return "/monitoring-aoi";
	if (normalized.includes("area of improvement") || normalized === "aoi") {
		return "/area-of-improvement";
	}
	return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	if (!hasPermission(locals.auth.role, "dashboard:read")) {
		throw error(403, "Akses dashboard ditolak");
	}

	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE) ?? "";
	const admin = createAdminServerClient();

	const nowYear = new Date().getFullYear();
	const yearStr = url.searchParams.get("year") ?? String(nowYear);
	const selectedYear = /^\d{4}$/.test(yearStr) ? parseInt(yearStr, 10) : nowYear;
	const search = sanitizeAuditSearch(url.searchParams.get("q") ?? "");
	const sourceParam = url.searchParams.get("source") ?? "";
	const fieldParam = url.searchParams.get("field") ?? "";
	const sourceFilter = AUDIT_PAGE_PATHS.has(sourceParam) ? sourceParam : "all";
	const fieldFilter = AUDIT_FIELDS.has(fieldParam) ? fieldParam : "all";

	const canAct = locals.auth.role === "admin" || locals.auth.role === "bpo";
	const isAdmin = isAdminRole(locals.auth.role);
	const divisionId = scopedDivisionId(locals.auth);

	// 1) Tren tahunan (global) — tidak pakai filter divisi.
	const { data: trendRows, error: trendErr } = isAdmin
		? await admin
			.from("acgs_year_summaries")
			.select("year,question_count,points_sum,score_pct,payload,updated_at")
			.order("year", { ascending: true })
		: { data: [], error: null };

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
		.from("application_audit_logs")
		.select(
			"id,created_at,actor_user_id,actor_email,actor_role,division_id,page_path,action,entity_type,entity_id,entity_label,year,field,old_value,new_value,metadata"
		)
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

	if (sourceFilter !== "all") auditQ = auditQ.eq("page_path", sourceFilter);
	if (fieldFilter !== "all") auditQ = auditQ.eq("field", fieldFilter);

	if (search) {
		// Search fokus untuk audit table.
		// supabase-js: or() pakai string filter.
		const q = search;
		if (q) {
			const fieldAlias = auditFieldAlias(q);
			const pageAlias = auditPageAlias(q);
			const filters = [
				`actor_email.ilike.%${q}%`,
				`actor_role.ilike.%${q}%`,
				`page_path.ilike.%${q}%`,
				`action.ilike.%${q}%`,
				`entity_type.ilike.%${q}%`,
				`entity_label.ilike.%${q}%`,
				`field.ilike.%${q}%`,
				`old_value.ilike.%${q}%`,
				`new_value.ilike.%${q}%`
			];
			if (fieldAlias) filters.push(`field.eq.${fieldAlias}`);
			if (pageAlias) filters.push(`page_path.eq.${pageAlias}`);
			auditQ = auditQ.or(filters.join(","));
		}
	}

	const { data: auditRows, error: auditErr } = await auditQ;
	if (auditErr) console.warn("[dashboard] application_audit_logs query failed:", auditErr.message);

	const activity = (auditRows ?? []).map((r) => ({
		id: Number(r.id),
		created_at: String(r.created_at ?? ""),
		actor_user_id: r.actor_user_id != null ? String(r.actor_user_id) : null,
		actor_email: String(r.actor_email ?? ""),
		actor_role: r.actor_role != null ? String(r.actor_role) : null,
		division_id: r.division_id != null ? String(r.division_id) : null,
		page_path: String(r.page_path ?? ""),
		action: String(r.action ?? ""),
		entity_type: String(r.entity_type ?? ""),
		entity_id: String(r.entity_id ?? ""),
		entity_label: r.entity_label != null ? String(r.entity_label) : null,
		year: Number(r.year ?? selectedYear),
		field: String(r.field ?? ""),
		old_value: r.old_value != null ? String(r.old_value) : null,
		new_value: r.new_value != null ? String(r.new_value) : null,
		metadata: isRecord(r.metadata) ? r.metadata : {}
	})) satisfies AuditRow[];

	return {
		canAct,
		selectedYear,
		search,
		sourceFilter,
		fieldFilter,
		limitedByDivision: !isAdmin,
		trend,
		activity,
		accessToken
	};
};
