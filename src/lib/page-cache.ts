export const PAGE_CACHE_SCHEMA_VERSION = 2;

export type PageCacheMeta = {
	route: string;
	dataVersion: string;
	cachedAt: string;
	expiresAt: string;
	schemaVersion: number;
};

export type PageCacheState = "fresh" | "cached" | "error";
