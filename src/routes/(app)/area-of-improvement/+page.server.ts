import type { PageServerLoad } from "./$types.js";
import { getAoiPageData } from "./_services/load-aoi.server.js";
import type { AoiItem } from "./_lib/types.js";

export const load: PageServerLoad = async ({ url, locals }) => {
	const currentYear = new Date().getFullYear();
	const year = parseInt(url.searchParams.get("year") ?? String(currentYear), 10);

	const authUser = {
		id: locals.auth.userId,
		email: locals.auth.email,
		role: locals.auth.role,
		divisionId: locals.auth.divisionId,
	};

	const payload = await getAoiPageData(Number.isFinite(year) ? year : currentYear, locals.auth);

	if (payload.error) {
		return {
			authUser,
			items: [] as AoiItem[],
			availableYears: payload.availableYears,
			year: Number.isFinite(year) ? year : currentYear,
			loadError: payload.error.message,
		};
	}

	return {
		authUser,
		items: payload.items,
		availableYears: payload.availableYears,
		year: Number.isFinite(year) ? year : currentYear,
		loadError: null as string | null,
	};
};
