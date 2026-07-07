import { browser } from "$app/environment";
import type { PageCacheMeta, PageCacheState } from "$lib/page-cache.js";
import {
	readEncryptedPageCache,
	writeEncryptedPageCache,
	type PageCacheScope
} from "$lib/client/encrypted-page-cache.js";

type CacheablePayload = {
	cacheMeta: PageCacheMeta;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type CachedPageResult<T extends CacheablePayload> = T & {
	cacheState: PageCacheState;
	refreshError: string | null;
};

async function fetchPayload<T extends CacheablePayload>(fetcher: Fetcher, url: string): Promise<T> {
	const response = await fetcher(url, {
		headers: { Accept: "application/json" },
		credentials: "include"
	});
	if (!response.ok) {
		const text = await response.text().catch(() => response.statusText);
		throw new Error(text || `HTTP ${response.status}`);
	}
	return (await response.json()) as T;
}

export async function loadCachedPageData<T extends CacheablePayload>(params: {
	fetcher: Fetcher;
	url: string;
	cacheKey: string;
	scope: PageCacheScope;
	route: string;
}): Promise<CachedPageResult<T>> {
	if (browser) {
		const cached = await readEncryptedPageCache<T>(params.cacheKey, params.scope);
		if (cached) {
			return {
				...cached.payload,
				cacheState: "cached",
				refreshError: null
			};
		}
	}

	const payload = await fetchPayload<T>(params.fetcher, params.url);
	if (browser) {
		await writeEncryptedPageCache(
			params.cacheKey,
			params.scope,
			params.route,
			payload,
			payload.cacheMeta.dataVersion
		);
	}

	return {
		...payload,
		cacheState: "fresh",
		refreshError: null
	};
}

export async function refreshCachedPageData<T extends CacheablePayload>(params: {
	url: string;
	cacheKey: string;
	scope: PageCacheScope;
	route: string;
}): Promise<CachedPageResult<T>> {
	const payload = await fetchPayload<T>(fetch, params.url);
	await writeEncryptedPageCache(
		params.cacheKey,
		params.scope,
		params.route,
		payload,
		payload.cacheMeta.dataVersion
	);
	return {
		...payload,
		cacheState: "fresh",
		refreshError: null
	};
}
