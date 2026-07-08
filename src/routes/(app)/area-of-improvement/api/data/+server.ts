import { json } from "@sveltejs/kit";
import { createPageCacheMeta, latestIsoVersion } from "$lib/server/page-cache-meta.server.js";
import { getAoiPageData } from "../../_services/load-aoi.server.js";
import type { RequestHandler } from "./$types.js";

const ROUTE = "/area-of-improvement";

function resolveYear(value: string | null): number {
	const currentYear = new Date().getFullYear();
	const parsed = Number.parseInt(value ?? String(currentYear), 10);
	return Number.isFinite(parsed) ? parsed : currentYear;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const year = resolveYear(url.searchParams.get("year"));
	const payload = await getAoiPageData(year, locals.auth, { syncFromAssessment: true });
	const version = latestIsoVersion(
		[
			...payload.items.map((item) => item.updated_at),
			...payload.items.map((item) => item.followup_updated_at),
		],
		`${ROUTE}:${year}:${payload.items.length}:${payload.availableYears.join(",")}`
	);

	return json({
		items: payload.error ? [] : payload.items,
		availableYears: payload.availableYears,
		year,
		loadError: payload.error?.message ?? null,
		cacheMeta: createPageCacheMeta(ROUTE, version)
	});
};
