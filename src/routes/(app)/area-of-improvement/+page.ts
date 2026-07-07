import { resolve } from "$app/paths";
import { createPageCacheKey, type PageCacheScope } from "$lib/client/encrypted-page-cache.js";
import { loadCachedPageData } from "$lib/client/cached-page-load.js";
import type { PageCacheMeta } from "$lib/page-cache.js";
import type { AoiItem } from "./_lib/types.js";
import type { PageLoad } from "./$types.js";

const ROUTE = "/area-of-improvement";

type AoiDataPayload = {
	items: AoiItem[];
	availableYears: number[];
	year: number;
	loadError: string | null;
	cacheMeta: PageCacheMeta;
};

function resolveYear(value: string | null): number {
	const currentYear = new Date().getFullYear();
	const parsed = Number.parseInt(value ?? String(currentYear), 10);
	return Number.isFinite(parsed) ? parsed : currentYear;
}

export const load: PageLoad = async ({ url, fetch, parent }) => {
	const { authUser } = await parent();
	const year = resolveYear(url.searchParams.get("year"));
	const scope: PageCacheScope = {
		userId: authUser?.id ?? null,
		role: authUser?.role ?? null,
		divisionId: authUser?.divisionId ?? null
	};
	const cacheKey = createPageCacheKey({ ...scope, route: ROUTE, year });
	const dataUrl = `${resolve("/area-of-improvement/api/data")}?year=${year}`;
	const payload = await loadCachedPageData<AoiDataPayload>({
		fetcher: fetch,
		url: dataUrl,
		cacheKey,
		scope,
		route: ROUTE
	});

	return {
		authUser,
		...payload,
		cacheKey,
		cacheScope: scope,
		dataUrl,
		cacheState: payload.cacheState,
		refreshError: payload.refreshError
	};
};
