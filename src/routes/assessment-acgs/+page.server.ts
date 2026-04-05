import type { PageServerLoad } from "./$types.js";
import { getAssessmentPageData } from "./assessment-service.server.js";

export const load: PageServerLoad = async ({ url, locals }) => {
	const authUser = {
		id: locals.auth.userId,
		email: locals.auth.email,
		role: locals.auth.role,
		divisionId: locals.auth.divisionId
	};

	const currentYear = new Date().getFullYear();
	const yearStr = url.searchParams.get("year") || currentYear.toString();
	const year = parseInt(yearStr, 10);

	const search = url.searchParams.get("q") ?? "";

	const payload = await getAssessmentPageData(year, { search });

	if (payload.error) {
		return {
			authUser,
			summaryMetrics: payload.summaryMetrics,
			assessmentQuestions: [] as typeof payload.questions,
			questionsTotal: 0,
			search: search.trim(),
			availableYears: payload.availableYears,
			year,
			loadError: payload.error.message ?? "Gagal memuat data assessment"
		};
	}

	return {
		authUser,
		summaryMetrics: payload.summaryMetrics,
		assessmentQuestions: payload.questions,
		questionsTotal: payload.questionsTotal,
		search: payload.search,
		availableYears: payload.availableYears,
		year,
		loadError: null as string | null
	};
};
