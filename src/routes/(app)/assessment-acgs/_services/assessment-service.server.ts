import { env } from "$env/dynamic/private";
import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAuthenticated, type AuthContext } from "$lib/server/rbac.js";
import { assessmentData, type AssessmentItem as MasterAssessmentItem } from "../_data/assessment-master.js";
import { isAcgsQuestionRow, mergeQuestionDefaultsFromMaster } from "../_data/acgs-defaults.js";
import { attachResolvedAcgsHeaders } from "./resolve-headers.server.js";

export const MAX_ASSESSMENT_QUESTIONS_PAGE_SIZE = 200;

const QUESTION_TYPES = ["question", "acgs"] as const;

type AdminDb = ReturnType<typeof createAdminServerClient>;

type AcgsItemRow = {
	uid: string;
	type: string;
	sort_order: number;
	level_label: string | null;
	part_id: string | null;
	section_id: string | null;
	item_id: string | null;
	label: string | null;
	name_en: string | null;
	name_id: string | null;
	full_name_en: string | null;
	full_name_id: string | null;
	question_en: string | null;
	question_id: string | null;
};

type AcgsAnswerRow = {
	uid: string;
	year: number;
	item_uid: string;
	division_id: string | null;
	implementation: string | null;
	evidence: string | null;
	status: string | null;
	recommendation: string | null;
	notes: string | null;
	created_at?: string | null;
	updated_at?: string | null;
};

export type FlatAssessmentRow = Record<string, unknown> & {
	uid?: string;
	id?: string;
	row_uid?: string;
	item_uid?: string;
	answer_uid?: string | null;
	type?: string;
	status?: string | null;
	item_id?: string | null;
	sort_order?: number | null;
	year?: number | null;
};

function mergeMasterOnLoadEnabled(): boolean {
	return String(env.ACGS_MERGE_MASTER_ON_LOAD ?? "").toLowerCase() === "true";
}

function validYear(year: number): boolean {
	return Number.isInteger(year) && year >= 2000 && year <= 2200;
}

function typeOf(item: MasterAssessmentItem): string {
	return String(item.type ?? "");
}

function nullable(value: string | null | undefined): string | null {
	const text = value ?? null;
	return text === "" ? null : text;
}

function masterItemRow(item: MasterAssessmentItem, index: number): Record<string, unknown> {
	return {
		type: typeOf(item),
		sort_order: index,
		level_label: nullable(item.level),
		part_id: nullable(item.part),
		section_id: nullable(item.section),
		item_id: nullable(item.id),
		label: nullable(item.label),
		name_en: nullable(item.name_en),
		name_id: nullable(item.name_id),
		full_name_en: nullable(item.full_name_en),
		full_name_id: nullable(item.full_name_id),
		question_en: nullable(item.question_en),
		question_id: nullable(item.question_id),
		is_active: true
	};
}

async function insertItemChunks(adminDb: AdminDb, rows: Record<string, unknown>[]): Promise<Error | null> {
	const chunkSize = 100;
	for (let i = 0; i < rows.length; i += chunkSize) {
		const chunk = rows.slice(i, i + chunkSize);
		const { error } = await adminDb.from("acgs_items").insert(chunk);
		if (error) return new Error(error.message);
	}
	return null;
}

async function ensureAcgsItemsSeeded(adminDb: AdminDb): Promise<Error | null> {
	const { count, error } = await adminDb
		.from("acgs_items")
		.select("uid", { count: "exact", head: true });
	if (error) return new Error(error.message);
	if ((count ?? 0) > 0) return null;
	return insertItemChunks(adminDb, assessmentData.map(masterItemRow));
}

function distinctYears(rows: { year?: number | null }[] | null, selectedYear: number): number[] {
	const years = new Set<number>();
	if (validYear(selectedYear)) years.add(selectedYear);
	const currentYear = new Date().getFullYear();
	if (validYear(currentYear)) years.add(currentYear);
	for (const row of rows ?? []) {
		const y = row.year;
		if (typeof y === "number" && validYear(y)) years.add(y);
	}
	return [...years].sort((a, b) => b - a);
}

async function loadAvailableYears(
	adminDb: AdminDb,
	selectedYear: number
): Promise<{ availableYears: number[]; error: Error | null }> {
	const { data, error } = await adminDb.from("acgs_assessment_answers").select("year");
	if (error) return { availableYears: distinctYears([], selectedYear), error: new Error(error.message) };
	return { availableYears: distinctYears(data ?? [], selectedYear), error: null };
}

async function fetchActiveItems(adminDb: AdminDb): Promise<{ data: AcgsItemRow[]; error: Error | null }> {
	const { data, error } = await adminDb
		.from("acgs_items")
		.select(
			"uid,type,sort_order,level_label,part_id,section_id,item_id,label,name_en,name_id,full_name_en,full_name_id,question_en,question_id"
		)
		.eq("is_active", true)
		.order("sort_order", { ascending: true });
	if (error) return { data: [], error: new Error(error.message) };
	return { data: (data ?? []) as AcgsItemRow[], error: null };
}

async function fetchAnswersForYear(
	adminDb: AdminDb,
	year: number
): Promise<{ data: AcgsAnswerRow[]; error: Error | null }> {
	const { data, error } = await adminDb
		.from("acgs_assessment_answers")
		.select(
			"uid,year,item_uid,division_id,implementation,evidence,status,recommendation,notes,created_at,updated_at"
		)
		.eq("year", year);
	if (error) return { data: [], error: new Error(error.message) };
	return { data: (data ?? []) as AcgsAnswerRow[], error: null };
}

function normalizedStatus(status: string | null | undefined): string {
	const value = String(status ?? "").trim().toUpperCase();
	if (value === "Y") return "YES";
	if (value === "N") return "NO";
	return value;
}

function mergedRow(item: AcgsItemRow, answer: AcgsAnswerRow | undefined, year: number): FlatAssessmentRow {
	const questionLike = isAcgsQuestionRow(item);
	const rowUid = answer?.uid ?? item.uid;
	const base: FlatAssessmentRow = {
		uid: item.uid,
		item_uid: item.uid,
		answer_uid: answer?.uid ?? null,
		row_uid: rowUid,
		type: item.type,
		sort_order: item.sort_order,
		year,
		level_label: item.level_label,
		part_id: item.part_id,
		section_id: item.section_id,
		item_id: item.item_id,
		label: item.label,
		name_en: item.name_en,
		name_id: item.name_id,
		full_name_en: item.full_name_en,
		full_name_id: item.full_name_id,
		question_en: item.question_en,
		question_id: item.question_id,
		implementation: answer?.implementation ?? "",
		evidence: answer?.evidence ?? "",
		status: normalizedStatus(answer?.status),
		recommendation: answer?.recommendation ?? "",
		notes: answer?.notes ?? null,
		created_at: answer?.created_at ?? null,
		updated_at: answer?.updated_at ?? null
	};

	if (questionLike) return { ...base, id: rowUid };
	return { ...base, id: String(item.item_id ?? item.label ?? item.uid) };
}

function buildSubtitleMapFromTrail(
	rows: FlatAssessmentRow[]
): Map<string, { name_en?: string; name_id?: string } | null> {
	let lastSub: { name_en?: string; name_id?: string } | null = null;
	const map = new Map<string, { name_en?: string; name_id?: string } | null>();
	for (const row of rows) {
		const t = String(row.type ?? "").toLowerCase();
		if (t === "subtitle") {
			lastSub = {
				name_en: row.name_en != null ? String(row.name_en) : undefined,
				name_id: row.name_id != null ? String(row.name_id) : undefined
			};
		} else if (isAcgsQuestionRow(row) && row.uid) {
			map.set(String(row.uid), lastSub);
		}
	}
	return map;
}

function applyAcgsDefaults(rows: FlatAssessmentRow[]): FlatAssessmentRow[] {
	return rows.map((item) => {
		const patch = mergeQuestionDefaultsFromMaster(item);
		return Object.keys(patch).length ? { ...item, ...patch } : item;
	});
}

function processRowsForClient(rows: FlatAssessmentRow[]): FlatAssessmentRow[] {
	const withDefaults = mergeMasterOnLoadEnabled() ? applyAcgsDefaults(rows) : rows;
	const withHeaders = attachResolvedAcgsHeaders(withDefaults);
	const subMap = buildSubtitleMapFromTrail(withHeaders);
	return withHeaders.map((row) => {
		if (!isAcgsQuestionRow(row)) return row;
		const itemUid = String(row.uid ?? "");
		return {
			...row,
			acgs_subtitle_context: itemUid ? (subMap.get(itemUid) ?? null) : null
		} as FlatAssessmentRow;
	});
}

async function loadAssessmentRows(
	adminDb: AdminDb,
	year: number
): Promise<{ rows: FlatAssessmentRow[]; error: Error | null }> {
	const [itemsRes, answersRes] = await Promise.all([
		fetchActiveItems(adminDb),
		fetchAnswersForYear(adminDb, year)
	]);
	if (itemsRes.error) return { rows: [], error: itemsRes.error };
	if (answersRes.error) return { rows: [], error: answersRes.error };

	const answersByItemUid = new Map<string, AcgsAnswerRow>();
	for (const answer of answersRes.data) {
		if (answer.division_id == null) answersByItemUid.set(answer.item_uid, answer);
	}

	const rows = itemsRes.data.map((item) => mergedRow(item, answersByItemUid.get(item.uid), year));
	return { rows: processRowsForClient(rows), error: null };
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

export async function getAssessmentPageData(
	year: number,
	auth: AuthContext,
	opts?: { search?: string }
): Promise<AssessmentPagePayload> {
	const adminDb = createAdminServerClient();
	const search = (opts?.search ?? "").trim();

	if (!isAuthenticated(auth)) {
		return {
			availableYears: [],
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: new Error("Tidak terautentikasi")
		};
	}

	if (!hasPermission(auth.role, "assessment:read")) {
		return {
			availableYears: [],
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: new Error("Izin ditolak")
		};
	}

	if (!validYear(year)) {
		return {
			availableYears: [],
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: new Error("Tahun tidak valid")
		};
	}

	const seedErr = await ensureAcgsItemsSeeded(adminDb);
	const yearsRes = await loadAvailableYears(adminDb, year);
	if (seedErr) {
		return {
			availableYears: yearsRes.availableYears,
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: seedErr
		};
	}
	if (yearsRes.error) {
		return {
			availableYears: yearsRes.availableYears,
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: yearsRes.error
		};
	}

	const rowsRes = await loadAssessmentRows(adminDb, year);
	if (rowsRes.error) {
		return {
			availableYears: yearsRes.availableYears,
			questions: [],
			questionsTotal: 0,
			questionsOffset: 0,
			questionsLimit: 0,
			search,
			error: rowsRes.error
		};
	}

	const questions = rowsRes.rows.filter((row) => isAcgsQuestionRow(row));
	return {
		availableYears: yearsRes.availableYears,
		questions,
		questionsTotal: questions.length,
		questionsOffset: 0,
		questionsLimit: questions.length,
		search,
		error: null
	};
}

export async function getAssessmentData(year: number, auth: AuthContext) {
	const adminDb = createAdminServerClient();
	if (!isAuthenticated(auth)) {
		return { data: [] as FlatAssessmentRow[], availableYears: [], error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:read")) {
		return { data: [] as FlatAssessmentRow[], availableYears: [], error: new Error("Izin ditolak") };
	}

	const seedErr = await ensureAcgsItemsSeeded(adminDb);
	const yearsRes = await loadAvailableYears(adminDb, year);
	if (seedErr) return { data: [] as FlatAssessmentRow[], availableYears: yearsRes.availableYears, error: seedErr };
	if (yearsRes.error) {
		return { data: [] as FlatAssessmentRow[], availableYears: yearsRes.availableYears, error: yearsRes.error };
	}

	const rowsRes = await loadAssessmentRows(adminDb, year);
	return {
		data: rowsRes.rows,
		availableYears: yearsRes.availableYears,
		error: rowsRes.error
	};
}

export async function getAssessmentQuestionRowsForYear(
	adminDb: AdminDb,
	year: number
): Promise<{ questions: FlatAssessmentRow[]; error: Error | null }> {
	const seedErr = await ensureAcgsItemsSeeded(adminDb);
	if (seedErr) return { questions: [], error: seedErr };
	const rowsRes = await loadAssessmentRows(adminDb, year);
	if (rowsRes.error) return { questions: [], error: rowsRes.error };
	return {
		questions: rowsRes.rows.filter((row) => isAcgsQuestionRow(row)),
		error: null
	};
}
