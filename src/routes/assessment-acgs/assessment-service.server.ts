import { env } from "$env/dynamic/private";
import { createAdminServerClient } from "$lib/server/auth.js";
import {
	buildFlatRowsForYear,
	isAcgsQuestionRow,
	mergeQuestionDefaultsFromMaster
} from "./acgs-defaults.js";

/** Flat `acgs_assessments`: master rows + answers; `uid` / `row_uid` = row PK for updates. */
export type FlatAssessmentRow = Record<string, unknown> & {
	uid?: string;
	id?: string;
	row_uid?: string;
	type?: string;
	status?: string | null;
	item_id?: string | null;
	sort_order?: number | null;
};

function normalizeRow(item: FlatAssessmentRow): FlatAssessmentRow {
	const rowUid = (item.uid ?? item.id) as string | undefined;
	if (!rowUid) {
		return { ...item };
	}

	const questionLike = isAcgsQuestionRow(item);
	const uiStatus =
		questionLike && item.status ? String(item.status).toUpperCase() : item.status;

	const base: FlatAssessmentRow = {
		...item,
		row_uid: rowUid
	};

	if (questionLike) {
		return { ...base, id: rowUid, status: uiStatus };
	}

	const displayId = String(item.item_id ?? item.label ?? rowUid);
	return { ...base, id: displayId };
}

function distinctYears(rows: { year?: number | null }[] | null): number[] {
	if (!rows?.length) return [];
	const years = new Set<number>();
	for (const row of rows) {
		const y = row.year;
		if (typeof y === "number" && !Number.isNaN(y)) years.add(y);
	}
	return [...years].sort((a, b) => b - a);
}

function applyAcgsDefaults(rows: FlatAssessmentRow[]): FlatAssessmentRow[] {
	return rows.map((item) => {
		const patch = mergeQuestionDefaultsFromMaster(item);
		return Object.keys(patch).length ? { ...item, ...patch } : item;
	});
}

function acgsTemplateYear(): number {
	const raw = env.ACGS_TEMPLATE_YEAR ?? "2026";
	const n = parseInt(String(raw), 10);
	return Number.isFinite(n) && n >= 2000 && n <= 2200 ? n : 2026;
}

const OMIT_ON_CLONE = new Set(["uid", "id", "created_at", "updated_at"]);

function rowForCloneInsert(row: Record<string, unknown>, targetYear: number): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(row)) {
		if (OMIT_ON_CLONE.has(k)) continue;
		out[k] = v;
	}
	out.year = targetYear;
	return out;
}

async function insertAcgsChunks(
	adminDb: ReturnType<typeof createAdminServerClient>,
	rows: Record<string, unknown>[]
): Promise<Error | null> {
	const chunkSize = 100;
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		const { error } = await adminDb.from("acgs_assessments").insert(chunk);
		if (error) return new Error(error.message);
	}
	return null;
}

async function ensureYearPopulated(
	adminDb: ReturnType<typeof createAdminServerClient>,
	targetYear: number
): Promise<Error | null> {
	const templateYear = acgsTemplateYear();

	if (templateYear !== targetYear) {
		const { data: template, error: selErr } = await adminDb
			.from("acgs_assessments")
			.select("*")
			.eq("year", templateYear)
			.order("sort_order");

		if (selErr) return new Error(selErr.message);
		if (template?.length) {
			const rows = template.map((row) =>
				rowForCloneInsert(row as Record<string, unknown>, targetYear)
			);
			return insertAcgsChunks(adminDb, rows);
		}
	}

	return insertAcgsChunks(adminDb, buildFlatRowsForYear(targetYear));
}

export async function getAssessmentData(year: number) {
	const adminDb = createAdminServerClient();

	let [{ data: yearRows, error: yearError }, { data, error }] = await Promise.all([
		adminDb.from("acgs_assessments").select("year"),
		adminDb.from("acgs_assessments").select("*").eq("year", year).order("sort_order")
	]);

	let availableYears = distinctYears(yearRows);
	if (yearError) {
		return { data: [] as FlatAssessmentRow[], availableYears, error: yearError };
	}

	if (error) {
		return { data: [] as FlatAssessmentRow[], availableYears, error };
	}

	const yearOk = Number.isFinite(year) && year >= 2000 && year <= 2200;

	if (yearOk && (!data || data.length === 0)) {
		const populateErr = await ensureYearPopulated(adminDb, year);
		if (populateErr) {
			return { data: [] as FlatAssessmentRow[], availableYears, error: populateErr };
		}

		const [{ data: yearRows2, error: yErr2 }, { data: data2, error: err2 }] = await Promise.all([
			adminDb.from("acgs_assessments").select("year"),
			adminDb.from("acgs_assessments").select("*").eq("year", year).order("sort_order")
		]);
		if (yErr2) {
			return { data: [] as FlatAssessmentRow[], availableYears, error: yErr2 };
		}
		if (err2) {
			return { data: [] as FlatAssessmentRow[], availableYears, error: err2 };
		}
		availableYears = distinctYears(yearRows2);
		data = data2 ?? [];
	}

	if (!data?.length) {
		return { data: [], availableYears, error: null };
	}

	const normalized = data.map((item) => normalizeRow(item as FlatAssessmentRow));
	const result = applyAcgsDefaults(normalized);
	return { data: result, availableYears, error: null };
}
