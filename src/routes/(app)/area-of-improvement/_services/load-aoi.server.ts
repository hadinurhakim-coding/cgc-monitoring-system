import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole, isAuthenticated, scopedDivisionId, type AuthContext } from "$lib/server/rbac.js";
import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
import { STATUS_REKOMENDASI_OPTIONS } from "../_lib/types.js";

type AdminDb = ReturnType<typeof createAdminServerClient>;

type AssessmentAoiSourceRow = {
	answerUid: string;
	itemUid: string;
	divisionId: string | null;
	aoiCode: string;
	areaOfImprovement: string;
	faktaTemuan: string;
	rekomendasi: string;
	levelLabel: string;
	partId: string;
	sectionId: string;
	standarLabel: string;
	sortOrder: number;
};

type AoiDbRow = {
	uid: string;
	year: number;
	item_uid: string;
	assessment_answer_uid: string;
	division_id: string | null;
	sort_order: number | null;
	area_of_improvement_override: string;
	created_at: string;
	updated_at: string;
	created_by: string | null;
	updated_by: string | null;
};

type ExistingAoiRow = {
	uid: string;
	item_uid: string;
	assessment_answer_uid: string;
	sort_order: number | null;
	is_active: boolean;
};

type AoiFollowupRow = {
	aoi_item_uid: string;
	fakta_temuan_override: string;
	tindak_lanjut_rekomendasi: string;
	pic: string;
	status_rekomendasi: StatusRekomendasi;
	eviden: string;
	updated_at: string;
};

function norm(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback = 0): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function nullableString(value: unknown): string | null {
	return typeof value === "string" && value ? value : null;
}

function isValidRecommendation(value: unknown): boolean {
	const text = norm(value);
	return text !== "" && text !== "-";
}

function normalizeStatus(value: unknown): StatusRekomendasi {
	const status = norm(value);
	return (STATUS_REKOMENDASI_OPTIONS as readonly string[]).includes(status)
		? (status as StatusRekomendasi)
		: "Belum ditindaklanjuti";
}

function toAoiItem(
	row: AoiDbRow,
	source: AssessmentAoiSourceRow,
	followup: AoiFollowupRow | undefined
): AoiItem {
	const areaOverride = norm(row.area_of_improvement_override);
	const areaOfImprovement = areaOverride || source.areaOfImprovement;

	return {
		uid: row.uid,
		year: row.year,
		sort_order: row.sort_order,
		division_id: row.division_id,
		aoi_code: source.aoiCode,
		area_of_improvement: areaOfImprovement,
		level_label: source.levelLabel,
		part_id: source.partId,
		section_id: source.sectionId,
		standar_label: areaOfImprovement ? `${source.aoiCode} - ${areaOfImprovement}` : source.aoiCode,
		fakta_temuan: norm(followup?.fakta_temuan_override) || source.faktaTemuan,
		rekomendasi: source.rekomendasi,
		tindak_lanjut_rekomendasi: followup?.tindak_lanjut_rekomendasi ?? "",
		pic: followup?.pic ?? "",
		status_rekomendasi: followup?.status_rekomendasi ?? "Belum ditindaklanjuti",
		eviden: followup?.eviden ?? "",
		created_at: row.created_at,
		updated_at: row.updated_at,
		followup_updated_at: followup?.updated_at ?? row.updated_at,
		created_by: row.created_by,
		updated_by: row.updated_by,
	};
}

async function getItemsByUid(
	admin: AdminDb,
	itemUids: string[]
): Promise<{ byUid: Map<string, Record<string, unknown>>; error: Error | null }> {
	if (itemUids.length === 0) return { byUid: new Map(), error: null };

	const { data, error } = await admin
		.from("acgs_items")
		.select("uid,item_id,question_id,level_label,part_id,section_id,sort_order,type")
		.in("uid", itemUids);

	if (error) return { byUid: new Map(), error: new Error(error.message) };

	const byUid = new Map<string, Record<string, unknown>>();
	for (const row of (data ?? []) as Record<string, unknown>[]) {
		const uid = norm(row.uid);
		if (uid) byUid.set(uid, row);
	}

	return { byUid, error: null };
}

async function getAssessmentAoiSourceRows(
	admin: AdminDb,
	year: number,
	divisionId: string | null
): Promise<{ sources: AssessmentAoiSourceRow[]; error: Error | null }> {
	let query = admin
		.from("acgs_assessment_answers")
		.select("uid,year,item_uid,division_id,implementation,recommendation")
		.eq("year", year)
		.not("recommendation", "is", null)
		.neq("recommendation", "");

	if (divisionId) {
		query = query.or(`division_id.is.null,division_id.eq.${divisionId}`);
	} else {
		query = query.is("division_id", null);
	}

	const { data: answerRows, error } = await query;
	if (error) return { sources: [], error: new Error(error.message) };

	const answers = ((answerRows ?? []) as Record<string, unknown>[]).filter((row) =>
		isValidRecommendation(row.recommendation)
	);
	const itemUids = [...new Set(answers.map((row) => norm(row.item_uid)).filter(Boolean))];
	const { byUid, error: itemErr } = await getItemsByUid(admin, itemUids);
	if (itemErr) return { sources: [], error: itemErr };

	const sources: AssessmentAoiSourceRow[] = [];
	for (const answer of answers) {
		const itemUid = norm(answer.item_uid);
		const item = byUid.get(itemUid);
		if (!item) continue;

		const type = norm(item.type);
		if (type !== "question" && type !== "acgs") continue;

		const aoiCode = norm(item.item_id);
		if (!aoiCode) continue;

		const questionId = norm(item.question_id);
		const sortOrder = numberValue(item.sort_order);
		sources.push({
			answerUid: norm(answer.uid),
			itemUid,
			divisionId: nullableString(answer.division_id),
			aoiCode,
			areaOfImprovement: questionId,
			faktaTemuan: norm(answer.implementation),
			rekomendasi: norm(answer.recommendation),
			levelLabel: norm(item.level_label),
			partId: norm(item.part_id),
			sectionId: norm(item.section_id),
			standarLabel: questionId ? `${aoiCode} - ${questionId}` : aoiCode,
			sortOrder,
		});
	}

	sources.sort((a, b) => a.sortOrder - b.sortOrder || a.aoiCode.localeCompare(b.aoiCode));
	return { sources, error: null };
}

async function syncAoiItemsFromAssessment(
	admin: AdminDb,
	auth: AuthContext,
	year: number,
	sources: AssessmentAoiSourceRow[]
): Promise<Error | null> {
	const divisionId = isAdminRole(auth.role) ? null : auth.divisionId;
	let existingQuery = admin
		.from("aoi_items")
		.select("uid,item_uid,assessment_answer_uid,sort_order,is_active")
		.eq("year", year);
	if (divisionId) {
		existingQuery = existingQuery.eq("division_id", divisionId);
	} else {
		existingQuery = existingQuery.is("division_id", null);
	}

	const { data: existingRows, error: existingErr } = await existingQuery;
	if (existingErr) return new Error(existingErr.message);

	const sourceByItemUid = sourceMapByItemUid(sources);
	const existingByItemUid = new Map<string, ExistingAoiRow>();
	for (const row of (existingRows ?? []) as ExistingAoiRow[]) {
		if (row.item_uid && row.uid) existingByItemUid.set(row.item_uid, row);
	}

	const inserts = sources
		.filter((source) => !existingByItemUid.has(source.itemUid))
		.map((source) => ({
			year,
			item_uid: source.itemUid,
			assessment_answer_uid: source.answerUid,
			division_id: divisionId,
			sort_order: source.sortOrder,
			created_by: auth.userId,
			updated_by: auth.userId,
		}));

	if (inserts.length > 0) {
		const { error } = await admin.from("aoi_items").insert(inserts);
		if (error) return new Error(error.message);
	}

	for (const source of sources) {
		const existing = existingByItemUid.get(source.itemUid);
		if (!existing) continue;
		if (
			existing.assessment_answer_uid === source.answerUid &&
			existing.sort_order === source.sortOrder &&
			existing.is_active
		) {
			continue;
		}

		const { error } = await admin
			.from("aoi_items")
			.update({
				assessment_answer_uid: source.answerUid,
				sort_order: source.sortOrder,
				is_active: true,
				updated_by: auth.userId,
			})
			.eq("uid", existing.uid);
		if (error) return new Error(error.message);
	}

	const staleUids = [...existingByItemUid.values()]
		.filter((row) => row.is_active && !sourceByItemUid.has(row.item_uid))
		.map((row) => row.uid);
	if (staleUids.length > 0) {
		const { error } = await admin
			.from("aoi_items")
			.update({
				is_active: false,
				updated_by: auth.userId,
			})
			.in("uid", staleUids);
		if (error) return new Error(error.message);
	}

	return null;
}

async function ensureFollowups(
	admin: AdminDb,
	auth: AuthContext,
	aoiItemUids: string[]
): Promise<Error | null> {
	if (aoiItemUids.length === 0) return null;

	const { data, error } = await admin
		.from("aoi_followups")
		.select("aoi_item_uid")
		.in("aoi_item_uid", aoiItemUids);

	if (error) return new Error(error.message);

	const existing = new Set(
		((data ?? []) as Record<string, unknown>[]).map((row) => norm(row.aoi_item_uid)).filter(Boolean)
	);
	const inserts = aoiItemUids
		.filter((uid) => !existing.has(uid))
		.map((uid) => ({
			aoi_item_uid: uid,
			created_by: auth.userId,
			updated_by: auth.userId,
		}));

	if (inserts.length === 0) return null;

	const { error: insertErr } = await admin.from("aoi_followups").insert(inserts);
	return insertErr ? new Error(insertErr.message) : null;
}

function sourceMapByItemUid(sources: AssessmentAoiSourceRow[]): Map<string, AssessmentAoiSourceRow> {
	const map = new Map<string, AssessmentAoiSourceRow>();
	for (const source of sources) {
		map.set(source.itemUid, source);
	}
	return map;
}

async function getFollowupsByAoiUid(
	admin: AdminDb,
	aoiItemUids: string[]
): Promise<{ followups: Map<string, AoiFollowupRow>; error: Error | null }> {
	if (aoiItemUids.length === 0) return { followups: new Map(), error: null };

	const { data, error } = await admin
		.from("aoi_followups")
		.select("aoi_item_uid,fakta_temuan_override,tindak_lanjut_rekomendasi,pic,status_rekomendasi,eviden,updated_at")
		.in("aoi_item_uid", aoiItemUids);

	if (error) return { followups: new Map(), error: new Error(error.message) };

	const followups = new Map<string, AoiFollowupRow>();
	for (const raw of (data ?? []) as Record<string, unknown>[]) {
		const aoiItemUid = norm(raw.aoi_item_uid);
		if (!aoiItemUid) continue;
		followups.set(aoiItemUid, {
			aoi_item_uid: aoiItemUid,
			fakta_temuan_override: norm(raw.fakta_temuan_override),
			tindak_lanjut_rekomendasi: norm(raw.tindak_lanjut_rekomendasi),
			pic: norm(raw.pic),
			status_rekomendasi: normalizeStatus(raw.status_rekomendasi),
			eviden: norm(raw.eviden),
			updated_at: norm(raw.updated_at),
		});
	}

	return { followups, error: null };
}

export async function getAoiPageData(year: number, auth: AuthContext): Promise<{
	items: AoiItem[];
	availableYears: number[];
	error: Error | null;
}>;
export async function getAoiPageData(year: number, auth: AuthContext, opts: { syncFromAssessment?: boolean }): Promise<{
	items: AoiItem[];
	availableYears: number[];
	error: Error | null;
}>;
export async function getAoiPageData(
	year: number,
	auth: AuthContext,
	opts: { syncFromAssessment?: boolean } = {}
): Promise<{
	items: AoiItem[];
	availableYears: number[];
	error: Error | null;
}> {
	if (!isAuthenticated(auth)) {
		return { items: [], availableYears: [], error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:read")) {
		return { items: [], availableYears: [], error: new Error("Izin ditolak") };
	}

	const admin = createAdminServerClient();
	const divisionId = scopedDivisionId(auth);
	if (!isAdminRole(auth.role) && !divisionId) {
		return { items: [], availableYears: [], error: null };
	}

	const sourceDivisionId = isAdminRole(auth.role) ? null : divisionId;
	const { sources, error: sourceErr } = await getAssessmentAoiSourceRows(admin, year, sourceDivisionId);
	if (sourceErr) return { items: [], availableYears: [], error: sourceErr };

	if (opts.syncFromAssessment) {
		const syncErr = await syncAoiItemsFromAssessment(admin, auth, year, sources);
		if (syncErr) return { items: [], availableYears: [], error: syncErr };
	}

	let rowsQuery = admin
		.from("aoi_items")
		.select("uid,year,item_uid,assessment_answer_uid,division_id,sort_order,area_of_improvement_override,created_at,updated_at,created_by,updated_by")
		.eq("year", year)
		.eq("is_active", true)
		.order("sort_order", { ascending: true, nullsFirst: false })
		.order("created_at", { ascending: true });
	let yearsQuery = admin.from("aoi_items").select("year").order("year", { ascending: false });
	if (!isAdminRole(auth.role) && divisionId) {
		rowsQuery = rowsQuery.eq("division_id", divisionId);
		yearsQuery = yearsQuery.eq("division_id", divisionId);
	} else {
		rowsQuery = rowsQuery.is("division_id", null);
		yearsQuery = yearsQuery.is("division_id", null);
	}

	const [{ data: rows, error: rowsErr }, { data: yearRows, error: yearErr }] = await Promise.all([
		rowsQuery,
		yearsQuery,
	]);

	if (rowsErr) return { items: [], availableYears: [], error: new Error(rowsErr.message) };
	if (yearErr) return { items: [], availableYears: [], error: new Error(yearErr.message) };

	const aoiRows = (rows ?? []) as AoiDbRow[];
	const aoiItemUids = aoiRows.map((row) => row.uid).filter(Boolean);
	const followupErr = await ensureFollowups(admin, auth, aoiItemUids);
	if (followupErr) return { items: [], availableYears: [], error: followupErr };

	const { followups, error: followupsErr } = await getFollowupsByAoiUid(admin, aoiItemUids);
	if (followupsErr) return { items: [], availableYears: [], error: followupsErr };

	const sourceByItemUid = sourceMapByItemUid(sources);
	const items = aoiRows
		.map((row) => {
			const source = sourceByItemUid.get(row.item_uid);
			return source ? toAoiItem(row, source, followups.get(row.uid)) : null;
		})
		.filter((item): item is AoiItem => item !== null);

	const years = new Set<number>();
	for (const r of (yearRows ?? []) as Record<string, unknown>[]) {
		const y = Number(r.year);
		if (Number.isFinite(y)) years.add(y);
	}
	if (sources.length > 0) years.add(year);
	const availableYears = [...years].sort((a, b) => b - a);

	return { items, availableYears, error: null };
}

export async function syncAoiItemsForYear(year: number, auth: AuthContext): Promise<Error | null> {
	if (!isAuthenticated(auth)) return new Error("Tidak terautentikasi");
	if (!hasPermission(auth.role, "assessment:write")) return new Error("Izin ditolak");

	const admin = createAdminServerClient();
	const divisionId = scopedDivisionId(auth);
	if (!isAdminRole(auth.role) && !divisionId) return null;

	const sourceDivisionId = isAdminRole(auth.role) ? null : divisionId;
	const { sources, error } = await getAssessmentAoiSourceRows(admin, year, sourceDivisionId);
	if (error) return error;
	return syncAoiItemsFromAssessment(admin, auth, year, sources);
}
