import { randomUUID } from "node:crypto";
import { fail, redirect } from "@sveltejs/kit";
import { fileTypeFromBuffer } from "file-type";
import {
	ACCESS_TOKEN_COOKIE,
	createUserServerClient
} from "$lib/server/auth.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { Actions, PageServerLoad } from "./$types.js";

type PartRow = {
	code: string;
	title_en: string;
	title_id: string;
	sort_order: number;
};

type SectionRow = {
	id: string;
	part_code: string;
	code: string;
	title_en: string;
	title_id: string;
	sort_order: number;
};

type QuestionRow = {
	id: string;
	section_id: string;
	code: string;
	question_en: string;
	question_id: string;
	sort_order: number;
};

type AnswerView = {
	implementation: string;
	evidence: string;
	status: "yes" | "no" | "na" | null;
	recommendation: string;
};

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const EVIDENCE_BUCKET = "gcg-evidence";

const MAX_IMPLEMENTATION_LEN = 12_000;
const MAX_RECOMMENDATION_LEN = 12_000;
const MAX_EVIDENCE_NOTE_LEN = 12_000;

function getDivisionFilter(divisionId: string | null) {
	if (divisionId) return { key: "eq", value: divisionId } as const;
	return { key: "is", value: null } as const;
}

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
	if (!accessToken) {
		throw redirect(303, "/login");
	}
	const db = createUserServerClient(accessToken);

	if (!hasPermission(locals.auth.role, "assessment:read")) {
		throw redirect(303, "/dashboard");
	}

	const rawYear = url.searchParams.get("year");
	const currentYear = new Date().getFullYear();
	let selectedYear = currentYear;
	if (rawYear && /^\d{4}$/.test(rawYear)) {
		const yearVal = parseInt(rawYear, 10);
		if (yearVal >= 2000 && yearVal <= currentYear + 5) {
			selectedYear = yearVal;
		}
	}

	const [{ data: parts, error: partsError }, { data: sections, error: sectionsError }] = await Promise.all([
		db.from("acgs_parts").select("code,title_en,title_id,sort_order").order("sort_order"),
		db
			.from("acgs_sections")
			.select("id,part_code,code,title_en,title_id,sort_order")
			.order("part_code")
			.order("sort_order")
	]);

	if (partsError || sectionsError) {
		console.error("Failed to load ACGS master data:", partsError?.message ?? sectionsError?.message);
		return {
			selectedYear,
			parts: [] as Array<PartRow & { sections: Array<SectionRow & { questions: QuestionRow[] }> }>
		};
	}

	const sectionIds = (sections ?? []).map((section) => section.id);
	let questions: QuestionRow[] = [];

	if (sectionIds.length) {
		const { data: questionRows, error: questionsError } = await db
			.from("acgs_questions")
			.select("id,section_id,code,question_en,question_id,sort_order")
			.in("section_id", sectionIds)
			.order("code");

		if (questionsError) {
			console.error("Failed to load ACGS questions:", questionsError.message);
		} else {
			questions = questionRows ?? [];
		}
	}

	const questionsBySection = new Map<string, QuestionRow[]>();
	for (const question of questions) {
		const list = questionsBySection.get(question.section_id) ?? [];
		list.push(question);
		questionsBySection.set(question.section_id, list);
	}

	const sectionsByPart = new Map<string, Array<SectionRow & { questions: QuestionRow[] }>>();
	for (const section of sections ?? []) {
		const list = sectionsByPart.get(section.part_code) ?? [];
		list.push({
			...section,
			questions: questionsBySection.get(section.id) ?? []
		});
		sectionsByPart.set(section.part_code, list);
	}

	const normalizedParts = (parts ?? []).map((part) => ({
		...part,
		sections: sectionsByPart.get(part.code) ?? []
	}));

	let answersByCode: Record<string, AnswerView> = {};
	const divisionFilter = getDivisionFilter(locals.auth.divisionId);
	let assessmentQuery = db
		.from("acgs_assessments")
		.select("id")
		.eq("year", selectedYear)
		.order("created_at", { ascending: true })
		.limit(1);
	assessmentQuery =
		divisionFilter.key === "eq"
			? assessmentQuery.eq("division_id", divisionFilter.value)
			: assessmentQuery.is("division_id", divisionFilter.value);
	const { data: assessment } = await assessmentQuery.maybeSingle();

	if (assessment?.id) {
		const { data: answers } = await db
			.from("acgs_assessment_answers")
			.select("implementation,evidence,status,recommendation,question_id")
			.eq("assessment_id", assessment.id);

		const questionCodeById = new Map(questions.map((question) => [question.id, question.code]));
		answersByCode = Object.fromEntries(
			(answers ?? [])
				.map((answer) => {
					const code = questionCodeById.get(answer.question_id);
					if (!code) return null;
					return [
						code,
						{
							implementation: answer.implementation ?? "",
							evidence: answer.evidence ?? "",
							status: answer.status,
							recommendation: answer.recommendation ?? ""
						} satisfies AnswerView
					];
				})
				.filter((item): item is [string, AnswerView] => item !== null)
		);
	}

	return {
		selectedYear,
		parts: normalizedParts,
		answersByCode
	};
};

export const actions: Actions = {
	saveAnswer: async ({ request, locals, cookies }) => {
		const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
		if (!accessToken) {
			return fail(401, { error: "Sesi tidak valid. Silakan masuk kembali." });
		}
		const db = createUserServerClient(accessToken);

		if (!hasPermission(locals.auth.role, "assessment:write")) {
			return fail(403, { error: "Anda tidak memiliki izin (role) untuk mengubah assessment." });
		}

		const formData = await request.formData();
		const rawYear = String(formData.get("year") ?? "").trim();
		const currentYear = new Date().getFullYear();
		let year = 0;
		if (rawYear && /^\d{4}$/.test(rawYear)) {
			year = parseInt(rawYear, 10);
			if (year < 2000 || year > currentYear + 5) {
				return fail(400, { error: "Tahun di luar batas yang diizinkan." });
			}
		} else {
			return fail(400, { error: "Format tahun tidak valid." });
		}

		const questionCode = String(formData.get("question_code") ?? "").trim();
		const implementation = String(formData.get("implementation") ?? "").trim();
		const evidenceNote = String(formData.get("evidence_note") ?? "").trim();
		const recommendation = String(formData.get("recommendation") ?? "").trim();
		const rawStatus = String(formData.get("status") ?? "").trim().toLowerCase();
		const uploadedPath = String(formData.get("evidence_uploaded_path") ?? "").trim();

		if (!questionCode) {
			return fail(400, { error: "Kode pertanyaan tidak valid." });
		}

		if (implementation.length > MAX_IMPLEMENTATION_LEN) {
			return fail(400, { error: "Teks implementasi terlalu panjang." });
		}
		if (recommendation.length > MAX_RECOMMENDATION_LEN) {
			return fail(400, { error: "Teks rekomendasi terlalu panjang." });
		}
		if (evidenceNote.length > MAX_EVIDENCE_NOTE_LEN) {
			return fail(400, { error: "Catatan bukti terlalu panjang." });
		}

		const status = rawStatus === "yes" || rawStatus === "no" || rawStatus === "na" ? rawStatus : null;
		if (!status) {
			return fail(400, { error: "Status wajib diisi (YES/NO/N/A)." });
		}

		if (!implementation) {
			return fail(400, { error: "Kolom implementasi wajib diisi." });
		}

		const { data: question, error: questionError } = await db
			.from("acgs_questions")
			.select("id")
			.eq("code", questionCode)
			.maybeSingle();
		if (questionError || !question?.id) {
			return fail(400, { error: "Pertanyaan tidak ditemukan." });
		}

		let assessmentId = "";
		const divisionFilter = getDivisionFilter(locals.auth.divisionId);
		let existingAssessmentQuery = db
			.from("acgs_assessments")
			.select("id")
			.eq("year", year)
			.order("created_at", { ascending: true })
			.limit(1);
		existingAssessmentQuery =
			divisionFilter.key === "eq"
				? existingAssessmentQuery.eq("division_id", divisionFilter.value)
				: existingAssessmentQuery.is("division_id", divisionFilter.value);
		const { data: existingAssessment } = await existingAssessmentQuery.maybeSingle();
		if (existingAssessment?.id) {
			assessmentId = existingAssessment.id;
		} else {
			const { data: newAssessment, error: createAssessmentError } = await db
				.from("acgs_assessments")
				.insert({
					year,
					division_id: locals.auth.divisionId,
					status: "draft",
					created_by: locals.auth.userId,
					updated_by: locals.auth.userId
				})
				.select("id")
				.single();
			if (createAssessmentError || !newAssessment?.id) {
				console.error("Failed to create assessment:", createAssessmentError?.message);
				return fail(500, { error: "Gagal membuat data assessment." });
			}
			assessmentId = newAssessment.id;
		}

		let existingEvidence = "";
		if (existingAssessment?.id) {
			const { data: currentAnswer } = await db
				.from("acgs_assessment_answers")
				.select("evidence")
				.eq("assessment_id", assessmentId)
				.eq("question_id", question.id)
				.maybeSingle();
			existingEvidence = currentAnswer?.evidence ?? "";
		}

		let finalEvidence = evidenceNote || existingEvidence;
		if (uploadedPath) {
			finalEvidence = evidenceNote ? `${evidenceNote}\n[FILE] ${uploadedPath}` : `[FILE] ${uploadedPath}`;
		}

		const { data: existingAnswer } = await db
			.from("acgs_assessment_answers")
			.select("id")
			.eq("assessment_id", assessmentId)
			.eq("question_id", question.id)
			.maybeSingle();

		const { error: upsertError } = await db.from("acgs_assessment_answers").upsert(
			{
				assessment_id: assessmentId,
				question_id: question.id,
				implementation,
				evidence: finalEvidence,
				status,
				recommendation,
				updated_by: locals.auth.userId
			},
			{ onConflict: "assessment_id,question_id" }
		);

		if (upsertError) {
			console.error("Failed to save answer:", upsertError.message);
			return fail(500, { error: "Gagal menyimpan jawaban." });
		}

		return {
			success: true,
			questionCode,
			actionType: existingAnswer?.id ? "update" : "create",
			message: existingAnswer?.id ? "Nilai berhasil diperbarui." : "Nilai berhasil disimpan.",
			eventId: randomUUID()
		};
	}
};
