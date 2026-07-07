import { PAGE_CACHE_SCHEMA_VERSION, type PageCacheMeta } from "$lib/page-cache.js";

const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;

export function createPageCacheMeta(route: string, dataVersion: string): PageCacheMeta {
	const now = new Date();
	return {
		route,
		dataVersion,
		cachedAt: now.toISOString(),
		expiresAt: new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
		schemaVersion: PAGE_CACHE_SCHEMA_VERSION
	};
}

export function latestIsoVersion(values: Array<string | null | undefined>, fallback: string): string {
	let latest = "";
	for (const value of values) {
		if (!value) continue;
		if (!latest || value > latest) latest = value;
	}
	return latest || fallback;
}
