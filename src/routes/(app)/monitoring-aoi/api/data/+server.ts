import { json } from "@sveltejs/kit";
import { createPageCacheMeta } from "$lib/server/page-cache-meta.server.js";
import { emptyStatusCounts } from "../../_lib/types.js";
import { getMonitoringPageData } from "../../_services/load-monitoring.server.js";
import type { RequestHandler } from "./$types.js";

const ROUTE = "/monitoring-aoi";

function resolveYear(value: string | null): number {
	const currentYear = new Date().getFullYear();
	const parsed = Number.parseInt(value ?? String(currentYear), 10);
	return Number.isFinite(parsed) ? parsed : currentYear;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const year = resolveYear(url.searchParams.get("year"));
	const payload = await getMonitoringPageData(year, locals.auth);

	return json({
		levels: payload.error ? [] : payload.levels,
		grandTotal: payload.error
			? { jumlahAoi: 0, statusCounts: emptyStatusCounts() }
			: payload.grandTotal,
		availableYears: payload.availableYears,
		year,
		loadError: payload.error?.message ?? null,
		cacheMeta: createPageCacheMeta(ROUTE, payload.dataVersion)
	});
};
