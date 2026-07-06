import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole, isAuthenticated, scopedDivisionId, type AuthContext } from "$lib/server/rbac.js";
import { assessmentData } from "../../assessment-acgs/_data/assessment-master.js";
import {
	canonicalPartIdForAcgsQuestion,
	canonicalSectionIdForAcgsQuestion,
	norm,
} from "../../assessment-acgs/_lib/acgs-question-utils.js";
import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
import { STATUS_REKOMENDASI_OPTIONS } from "../_lib/types.js";

function toAoiItem(raw: Record<string, unknown>): AoiItem {
	const status = String(raw.status_rekomendasi ?? "Belum ditindak-lanjuti");
	const validStatus: StatusRekomendasi = (STATUS_REKOMENDASI_OPTIONS as readonly string[]).includes(status)
		? (status as StatusRekomendasi)
		: "Belum ditindak-lanjuti";

	return {
		uid: String(raw.uid ?? ""),
		year: Number(raw.year ?? 0),
		sort_order: raw.sort_order != null ? Number(raw.sort_order) : null,
		division_id: raw.division_id != null ? String(raw.division_id) : null,
		aoi_code: String(raw.aoi_code ?? raw.section_id ?? ""),
		area_of_improvement: String(raw.area_of_improvement ?? raw.standar_label ?? ""),
		level_label: String(raw.level_label ?? ""),
		part_id: String(raw.part_id ?? ""),
		section_id: String(raw.section_id ?? ""),
		standar_label: String(raw.standar_label ?? ""),
		fakta_temuan: String(raw.fakta_temuan ?? ""),
		rekomendasi: String(raw.rekomendasi ?? ""),
		tindak_lanjut_rekomendasi: String(raw.tindak_lanjut_rekomendasi ?? ""),
		pic: String(raw.pic ?? ""),
		status_rekomendasi: validStatus,
		eviden: String(raw.eviden ?? ""),
		created_at: String(raw.created_at ?? ""),
		updated_at: String(raw.updated_at ?? ""),
		created_by: raw.created_by != null ? String(raw.created_by) : null,
		updated_by: raw.updated_by != null ? String(raw.updated_by) : null,
	};
}

type AssessmentAoiSourceRow = {
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

const masterQuestionByCode = (() => {
	const map = new Map<string, (typeof assessmentData)[number]>();
	for (const item of assessmentData) {
		if (item.type === "question" && item.id) {
			map.set(norm(item.id), item);
		}
	}
	return map;
})();

function sourceRowFromAssessment(raw: Record<string, unknown>): AssessmentAoiSourceRow | null {
	const aoiCode = String(raw.item_id ?? "").trim();
	const rekomendasi = String(raw.recommendation ?? "").trim();
	if (!aoiCode || !rekomendasi) return null;

	const master = masterQuestionByCode.get(aoiCode);
	const questionId = norm(String(raw.question_id ?? "")) || norm(master?.question_id);
	const levelLabel = norm(String(raw.level_label ?? "")) || norm(master?.level);
	const partId = norm(String(raw.part_id ?? "")) || canonicalPartIdForAcgsQuestion({ item_id: aoiCode }) || "";
	const sectionId = norm(String(raw.section_id ?? "")) || canonicalSectionIdForAcgsQuestion({ item_id: aoiCode }) || "";
	const sortOrder = raw.sort_order != null ? Number(raw.sort_order) : 0;

	return {
		aoiCode,
		areaOfImprovement: questionId,
		faktaTemuan: String(raw.implementation ?? ""),
		rekomendasi,
		levelLabel,
		partId,
		sectionId,
		standarLabel: questionId ? `${aoiCode} - ${questionId}` : aoiCode,
		sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
	};
}

async function getAssessmentAoiSourceRows(
	admin: ReturnType<typeof createAdminServerClient>,
	year: number
): Promise<{ sources: AssessmentAoiSourceRow[]; error: Error | null }> {
	const { data, error } = await admin
		.from("acgs_assessments")
		.select("item_id,question_id,implementation,recommendation,level_label,part_id,section_id,sort_order")
		.eq("year", year)
		.in("type", ["question", "acgs"])
		.not("recommendation", "is", null)
		.neq("recommendation", "")
		.order("sort_order", { ascending: true });

	if (error) return { sources: [], error: new Error(error.message) };

	const sources = (data ?? [])
		.map((row) => sourceRowFromAssessment(row as Record<string, unknown>))
		.filter((row): row is AssessmentAoiSourceRow => row !== null);

	return { sources, error: null };
}

async function syncAoiItemsFromAssessment(
	admin: ReturnType<typeof createAdminServerClient>,
	auth: AuthContext,
	year: number,
	sources: AssessmentAoiSourceRow[]
): Promise<Error | null> {
	if (sources.length === 0) return null;

	const divisionId = isAdminRole(auth.role) ? null : auth.divisionId;
	const codes = sources.map((source) => source.aoiCode);
	let existingQuery = admin
		.from("aoi_items")
		.select("uid,aoi_code")
		.eq("year", year)
		.in("aoi_code", codes);
	if (divisionId) {
		existingQuery = existingQuery.eq("division_id", divisionId);
	} else {
		existingQuery = existingQuery.is("division_id", null);
	}

	const { data: existingRows, error: existingErr } = await existingQuery;
	if (existingErr) return new Error(existingErr.message);

	const existingByCode = new Map<string, string>();
	for (const row of existingRows ?? []) {
		const raw = row as Record<string, unknown>;
		const code = String(raw.aoi_code ?? "");
		const uid = String(raw.uid ?? "");
		if (code && uid && !existingByCode.has(code)) existingByCode.set(code, uid);
	}

	const now = new Date().toISOString();
	const inserts = sources
		.filter((source) => !existingByCode.has(source.aoiCode))
		.map((source, index) => ({
			year,
			sort_order: source.sortOrder || index + 1,
			division_id: divisionId,
			aoi_code: source.aoiCode,
			area_of_improvement: source.areaOfImprovement,
			level_label: source.levelLabel,
			part_id: source.partId,
			section_id: source.sectionId,
			standar_label: source.standarLabel,
			fakta_temuan: source.faktaTemuan,
			rekomendasi: source.rekomendasi,
			created_by: auth.userId,
			updated_by: auth.userId,
		}));

	if (inserts.length > 0) {
		const { error } = await admin.from("aoi_items").insert(inserts);
		if (error) return new Error(error.message);
	}

	for (const source of sources) {
		const uid = existingByCode.get(source.aoiCode);
		if (!uid) continue;
		const { error } = await admin
			.from("aoi_items")
			.update({
				sort_order: source.sortOrder,
				area_of_improvement: source.areaOfImprovement,
				level_label: source.levelLabel,
				part_id: source.partId,
				section_id: source.sectionId,
				standar_label: source.standarLabel,
				rekomendasi: source.rekomendasi,
				updated_at: now,
				updated_by: auth.userId,
			})
			.eq("uid", uid);
		if (error) return new Error(error.message);
	}

	return null;
}

function sourceMapByCode(sources: AssessmentAoiSourceRow[]): Map<string, AssessmentAoiSourceRow> {
	const map = new Map<string, AssessmentAoiSourceRow>();
	for (const source of sources) {
		map.set(source.aoiCode, source);
	}
	return map;
}

function applyAssessmentSource(items: AoiItem[], sources: AssessmentAoiSourceRow[]): AoiItem[] {
	const sourceByCode = sourceMapByCode(sources);
	return items
		.filter((item) => sourceByCode.has(item.aoi_code))
		.map((item) => {
			const source = sourceByCode.get(item.aoi_code);
			if (!source) return item;
			return {
				...item,
				sort_order: source.sortOrder,
				area_of_improvement: source.areaOfImprovement,
				level_label: source.levelLabel,
				part_id: source.partId,
				section_id: source.sectionId,
				standar_label: source.standarLabel,
				rekomendasi: source.rekomendasi,
			};
		});
}

export async function getAoiPageData(year: number, auth: AuthContext): Promise<{
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

	const { sources, error: sourceErr } = await getAssessmentAoiSourceRows(admin, year);
	if (sourceErr) return { items: [], availableYears: [], error: sourceErr };
	const syncErr = await syncAoiItemsFromAssessment(admin, auth, year, sources);
	if (syncErr) return { items: [], availableYears: [], error: syncErr };

	let rowsQuery = admin
		.from("aoi_items")
		.select("*")
		.eq("year", year)
		.order("sort_order", { ascending: true, nullsFirst: false })
		.order("created_at", { ascending: true });
	let yearsQuery = admin
		.from("aoi_items")
		.select("year")
		.order("year", { ascending: false });
	if (!isAdminRole(auth.role) && divisionId) {
		rowsQuery = rowsQuery.eq("division_id", divisionId);
		yearsQuery = yearsQuery.eq("division_id", divisionId);
	}

	const [{ data: rows, error: rowsErr }, { data: yearRows, error: yearErr }] = await Promise.all([
		rowsQuery,
		yearsQuery,
	]);

	if (rowsErr) return { items: [], availableYears: [], error: new Error(rowsErr.message) };
	if (yearErr) return { items: [], availableYears: [], error: new Error(yearErr.message) };

	const items = (rows ?? []).map((r) => toAoiItem(r as Record<string, unknown>));

	const years = new Set<number>();
	for (const r of yearRows ?? []) {
		const y = Number((r as Record<string, unknown>).year);
		if (Number.isFinite(y)) years.add(y);
	}
	if (sources.length > 0) years.add(year);
	const availableYears = [...years].sort((a, b) => b - a);

	return {
		items: applyAssessmentSource(items, sources),
		availableYears,
		error: null,
	};
}
