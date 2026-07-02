import type { PageServerLoad } from "./$types.js";
import { getMonitoringPageData } from "./_services/load-monitoring.server.js";
import type { AoiLevelGroup, MonitoringGrandTotal } from "./_lib/types.js";
import { emptyStatusCounts } from "./_lib/types.js";

export const load: PageServerLoad = async ({ url, locals }) => {
	const currentYear = new Date().getFullYear();
	const year = parseInt(url.searchParams.get("year") ?? String(currentYear), 10);
	const resolvedYear = Number.isFinite(year) ? year : currentYear;

	const authUser = {
		id: locals.auth.userId,
		email: locals.auth.email,
		role: locals.auth.role,
		divisionId: locals.auth.divisionId,
	};

	const payload = await getMonitoringPageData(resolvedYear, locals.auth);

	if (payload.error) {
		return {
			authUser,
			levels: [] as AoiLevelGroup[],
			grandTotal: { jumlahAoi: 0, statusCounts: emptyStatusCounts() } satisfies MonitoringGrandTotal,
			availableYears: payload.availableYears,
			year: resolvedYear,
			loadError: payload.error.message,
		};
	}

	return {
		authUser,
		levels: payload.levels,
		grandTotal: payload.grandTotal,
		availableYears: payload.availableYears,
		year: resolvedYear,
		loadError: null as string | null,
	};
};
