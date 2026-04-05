import type { PageServerLoad } from "./$types.js";
import { getAssessmentData } from "./assessment-service.server.js";

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

	const { data: assessmentData, availableYears, error } = await getAssessmentData(year);

	if (error) {
		return {
			authUser,
			assessmentData: [],
			availableYears,
			year,
			loadError: error.message ?? "Gagal memuat data assessment"
		};
	}

	return {
		authUser,
		assessmentData,
		availableYears,
		year,
		loadError: null as string | null
	};
};
