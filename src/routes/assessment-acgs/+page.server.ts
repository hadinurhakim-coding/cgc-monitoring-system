import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "$env/static/private";
import type { PageServerLoad } from "./$types.js";

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
	section_id: string;
	code: string;
	question_en: string;
	question_id: string;
	sort_order: number;
};

export const load: PageServerLoad = async ({ url }) => {
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
			.select("section_id,code,question_en,question_id,sort_order")
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

	return {
		selectedYear,
		parts: normalizedParts
	};
};
