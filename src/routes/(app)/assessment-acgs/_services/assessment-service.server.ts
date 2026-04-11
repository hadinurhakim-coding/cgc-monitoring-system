import { env } from "$env/dynamic/private";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { attachResolvedAcgsHeaders } from "./resolve-headers.server.js";
import { buildFlatRowsForYear, isAcgsQuestionRow, mergeQuestionDefaultsFromMaster } from "../_data/acgs-defaults.js";

export const MAX_ASSESSMENT_QUESTIONS_PAGE_SIZE = 200;

const QUESTION_TYPES = ["question", "acgs"] as const;

/**
 * Snapshot per tahun: UI harus sama dengan isi DB. Secara default tidak ada overlay teks dari master.
 * Set `ACGS_MERGE_MASTER_ON_LOAD=true` hanya untuk backfill/dev (isi pertanyaan kosong dari master saat GET).
 */
function mergeMasterOnLoadEnabled(): boolean {
	return String(env.ACGS_MERGE_MASTER_ON_LOAD ?? "").toLowerCase() === "true";
}

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

const OMIT_ON_CLONE = new Set(["uid", "id", "created_at", "updated_at", "search_vector"]);

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

/**
 * Tahun kosong diisi penuh: (1) salin semua baris dari tahun template `ACGS_TEMPLATE_YEAR` (default 2026)
 * jika template ≠ target dan data template ada; (2) jika tidak, insert dari master TypeScript (`buildFlatRowsForYear`).
 */
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

async function loadAssessmentYearState(
	adminDb: ReturnType<typeof createAdminServerClient>,
	year: number
): Promise<{ availableYears: number[]; error: Error | null }> {
	const [{ data: yearRows, error: yearError }, { data: sample, error: sampleErr }] = await Promise.all([
		adminDb.from("acgs_assessments").select("year"),
		adminDb.from("acgs_assessments").select("uid").eq("year", year).limit(1)
	]);

	if (yearError) {
		return { availableYears: [], error: new Error(yearError.message) };
	}
	if (sampleErr) {
		return { availableYears: distinctYears(yearRows), error: new Error(sampleErr.message) };
	}

	let availableYears = distinctYears(yearRows);
	const yearOk = Number.isFinite(year) && year >= 2000 && year <= 2200;

	if (yearOk && (!sample || sample.length === 0)) {
		const populateErr = await ensureYearPopulated(adminDb, year);
		if (populateErr) {
			return { availableYears, error: populateErr };
		}
		const { data: yearRows2, error: yErr2 } = await adminDb.from("acgs_assessments").select("year");
		if (yErr2) {
			return { availableYears, error: new Error(yErr2.message) };
		}
		availableYears = distinctYears(yearRows2);
	}

	return { availableYears, error: null };
}

async function fetchSubtitleTrailRows(
	adminDb: ReturnType<typeof createAdminServerClient>,
	year: number
): Promise<{ uid?: string; type?: string; name_en?: string; name_id?: string }[]> {
	const qb = adminDb
		.from("acgs_assessments")
		.select("uid,type,name_en,name_id,sort_order")
		.eq("year", year)
		.order("sort_order", { ascending: true });
	const { data, error } = await qb;
	if (error) {
		console.error("fetchSubtitleTrailRows:", error.message);
		return [];
	}
	return data ?? [];
}

function buildSubtitleMapFromTrail(
	rows: { uid?: string; type?: string; name_en?: string | null; name_id?: string | null }[]
): Map<string, { name_en?: string; name_id?: string } | null> {
	let lastSub: { name_en?: string; name_id?: string } | null = null;
	const map = new Map<string, { name_en?: string; name_id?: string } | null>();
	for (const row of rows) {
		const t = String(row.type ?? "").toLowerCase();
		if (t === "subtitle") {
			lastSub = {
				name_en: row.name_en ?? undefined,
				name_id: row.name_id ?? undefined
			};
		} else if (isAcgsQuestionRow(row) && row.uid) {
			map.set(String(row.uid), lastSub);
		}
	}
	return map;
}

/** Semua baris question/acgs untuk tahun (chunked, untuk UI client-side filter). */
async function fetchAllAssessmentQuestionRowsRaw(
	adminDb: ReturnType<typeof createAdminServerClient>,
	year: number
): Promise<{ data: Record<string, unknown>[]; error: Error | null }> {
	const chunkSize = MAX_ASSESSMENT_QUESTIONS_PAGE_SIZE;
	const all: Record<string, unknown>[] = [];
	for (let offset = 0; ; offset += chunkSize) {
		const { data, error } = await adminDb
			.from("acgs_assessments")
			.select("*")
			.eq("year", year)
			.in("type", [...QUESTION_TYPES])
			.order("sort_order", { ascending: true })
			.range(offset, offset + chunkSize - 1);
		if (error) return { data: [], error: new Error(error.message) };
		const rows = data ?? [];
		if (rows.length === 0) break;
		all.push(...rows);
		if (rows.length < chunkSize) break;
	}
	return { data: all, error: null };
}

function processQuestionRowsForClient(
	rows: FlatAssessmentRow[],
	subMap: Map<string, { name_en?: string; name_id?: string } | null>
): FlatAssessmentRow[] {
	let out = rows.map((item) => normalizeRow(item));
	if (mergeMasterOnLoadEnabled()) {
		out = applyAcgsDefaults(out);
	}
	out = attachResolvedAcgsHeaders(out);
	return out.map((q) => {
		const uid = String(q.uid ?? "");
		const ctx = uid ? (subMap.get(uid) ?? null) : null;
		return {
			...q,
			acgs_subtitle_context: ctx
		} as FlatAssessmentRow;
	});
}

async function loadAssessmentQuestions(
	adminDb: ReturnType<typeof createAdminServerClient>,
	year: number
): Promise<{
	questions: FlatAssessmentRow[];
	error: Error | null;
}> {
	const [trailRows, pageRes] = await Promise.all([
		fetchSubtitleTrailRows(adminDb, year),
		fetchAllAssessmentQuestionRowsRaw(adminDb, year)
	]);
	if (pageRes.error) {
		return { questions: [], error: pageRes.error };
	}
	const subMap = buildSubtitleMapFromTrail(trailRows);
	const questions = processQuestionRowsForClient(pageRes.data as FlatAssessmentRow[], subMap);
	return { questions, error: null };
}

export type AssessmentPagePayload = {
	availableYears: number[];
	questions: FlatAssessmentRow[];
	questionsTotal: number;
	questionsOffset: number;
	questionsLimit: number;
	search: string;
	error: Error | null;
};

/** Muat seluruh pertanyaan tahun (filter teks di klien). */
export async function getAssessmentPageData(
	year: number,
	opts?: { search?: string }
): Promise<AssessmentPagePayload> {
	const adminDb = createAdminServerClient();
	const state = await loadAssessmentYearState(adminDb, year);
	const search = (opts?.search ?? "").trim();

	const emptyPayload = (): AssessmentPagePayload => ({
		availableYears: state.availableYears,
		questions: [],
		questionsTotal: 0,
		questionsOffset: 0,
		questionsLimit: 0,
		search,
		error: state.error
	});

	if (state.error) {
		return emptyPayload();
	}

	const { questions, error: loadErr } = await loadAssessmentQuestions(adminDb, year);

	if (loadErr) {
		return {
			...emptyPayload(),
			error: loadErr
		};
	}

	return {
		availableYears: state.availableYears,
		questions,
		questionsTotal: questions.length,
		questionsOffset: 0,
		questionsLimit: questions.length,
		search,
		error: null
	};
}

/** Seluruh baris tahun (berat). Gunakan harga jika benar-benar perlu data penuh. */
export async function getAssessmentData(year: number) {
	const adminDb = createAdminServerClient();
	const state = await loadAssessmentYearState(adminDb, year);
	if (state.error) {
		return { data: [] as FlatAssessmentRow[], availableYears: state.availableYears, error: state.error };
	}

	const { data, error } = await adminDb
		.from("acgs_assessments")
		.select("*")
		.eq("year", year)
		.order("sort_order", { ascending: true });

	if (error) {
		return { data: [] as FlatAssessmentRow[], availableYears: state.availableYears, error };
	}

	if (!data?.length) {
		return { data: [], availableYears: state.availableYears, error: null };
	}

	const trailRows = await fetchSubtitleTrailRows(adminDb, year);
	const subMap = buildSubtitleMapFromTrail(trailRows);
	const normalized = data.map((item) => normalizeRow(item as FlatAssessmentRow));
	const merged = mergeMasterOnLoadEnabled() ? applyAcgsDefaults(normalized) : normalized;
	const withHeaders = attachResolvedAcgsHeaders(merged);
	const result = withHeaders.map((row) => {
		if (!isAcgsQuestionRow(row)) return row;
		const uid = String(row.uid ?? "");
		const ctx = uid ? subMap.get(uid) : undefined;
		return {
			...row,
			acgs_subtitle_context: ctx !== undefined ? ctx : null
		} as FlatAssessmentRow;
	});

	return { data: result, availableYears: state.availableYears, error: null };
}
