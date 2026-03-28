import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "$env/static/private";
import type { Actions, PageServerLoad } from "./$types.js";

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

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
const EVIDENCE_BUCKET = "gcg-evidance";
const ALLOWED_EVIDENCE_MIME = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]);

function getDivisionFilter(divisionId: string | null) {
	if (divisionId) return { key: "eq", value: divisionId } as const;
	return { key: "is", value: null } as const;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw redirect(303, "/login");
	}

	const selectedYearParam = Number(url.searchParams.get("year"));
	const currentYear = new Date().getFullYear();
	const selectedYear = Number.isFinite(selectedYearParam) ? selectedYearParam : currentYear;

	const [{ data: parts, error: partsError }, { data: sections, error: sectionsError }] = await Promise.all([
		adminClient.from("acgs_parts").select("code,title_en,title_id,sort_order").order("sort_order"),
		adminClient
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
		const { data: questionRows, error: questionsError } = await adminClient
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
	let assessmentQuery = adminClient
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
		const { data: answers } = await adminClient
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
		answersByCode,
		authUser: {
			id: locals.auth.userId,
			email: locals.auth.email,
			role: locals.auth.role,
			divisionId: locals.auth.divisionId
		}
	};
};

async function ensureEvidenceBucket() {
	const { data: buckets, error } = await adminClient.storage.listBuckets();
	if (error) {
		console.error("Failed to list storage buckets:", error.message);
		return;
	}

	const exists = buckets?.some((bucket) => bucket.name === EVIDENCE_BUCKET);
	if (exists) return;

	const { error: createError } = await adminClient.storage.createBucket(EVIDENCE_BUCKET, {
		public: false,
		fileSizeLimit: `${MAX_EVIDENCE_BYTES}`,
		allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]
	});
	if (createError) console.error("Failed to create evidence bucket:", createError.message);
}

export const actions: Actions = {
	saveAnswer: async ({ request, locals }) => {
		if (!locals.auth.isAuthenticated || !locals.auth.userId) {
			return fail(401, { error: "Sesi login tidak valid. Silakan login ulang." });
		}

		const formData = await request.formData();
		const year = Number(formData.get("year"));
		const questionCode = String(formData.get("question_code") ?? "").trim();
		const implementation = String(formData.get("implementation") ?? "").trim();
		const evidenceNote = String(formData.get("evidence_note") ?? "").trim();
		const existingEvidence = String(formData.get("existing_evidence") ?? "").trim();
		const recommendation = String(formData.get("recommendation") ?? "").trim();
		const rawStatus = String(formData.get("status") ?? "").trim().toLowerCase();
		const file = formData.get("evidence_file");

		if (!Number.isFinite(year)) {
			return fail(400, { error: "Tahun tidak valid." });
		}

		if (!questionCode) {
			return fail(400, { error: "Kode pertanyaan tidak valid." });
		}

		const status = rawStatus === "yes" || rawStatus === "no" || rawStatus === "na" ? rawStatus : null;
		if (!status) {
			return fail(400, { error: "Status wajib diisi (YES/NO/N/A)." });
		}

		if (!implementation) {
			return fail(400, { error: "Kolom implementasi wajib diisi." });
		}

		let uploadedPath = "";

		if (file instanceof File && file.size > 0) {
			if (file.size > MAX_EVIDENCE_BYTES) {
				return fail(400, { error: "Ukuran file bukti maksimal 15 MB." });
			}
			if (file.type && !ALLOWED_EVIDENCE_MIME.has(file.type)) {
				return fail(400, { error: "Format file tidak didukung. Gunakan PDF/JPG/PNG/WEBP." });
			}

			await ensureEvidenceBucket();
			const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
			const safeExt = extension ? extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "bin";
			const objectPath = `assessment/${year}/${questionCode}/${randomUUID()}.${safeExt || "bin"}`;
			const buffer = Buffer.from(await file.arrayBuffer());

			const { error: uploadError } = await adminClient.storage
				.from(EVIDENCE_BUCKET)
				.upload(objectPath, buffer, {
					contentType: file.type || "application/octet-stream",
					upsert: false
				});

			if (uploadError) {
				console.error("Evidence upload failed:", uploadError.message);
				return fail(500, { error: "Gagal upload file evidence." });
			}

			uploadedPath = objectPath;
		}

		const { data: question, error: questionError } = await adminClient
			.from("acgs_questions")
			.select("id")
			.eq("code", questionCode)
			.maybeSingle();
		if (questionError || !question?.id) {
			return fail(400, { error: "Pertanyaan tidak ditemukan." });
		}

		let assessmentId = "";
		const divisionFilter = getDivisionFilter(locals.auth.divisionId);
		let existingAssessmentQuery = adminClient
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
			const { data: newAssessment, error: createAssessmentError } = await adminClient
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

		let finalEvidence = evidenceNote || existingEvidence;
		if (uploadedPath) {
			finalEvidence = evidenceNote ? `${evidenceNote}\n[FILE] ${uploadedPath}` : `[FILE] ${uploadedPath}`;
		}

		const { data: existingAnswer } = await adminClient
			.from("acgs_assessment_answers")
			.select("id")
			.eq("assessment_id", assessmentId)
			.eq("question_id", question.id)
			.maybeSingle();

		const { error: upsertError } = await adminClient.from("acgs_assessment_answers").upsert(
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
