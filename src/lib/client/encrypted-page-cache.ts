import { browser } from "$app/environment";
import { PAGE_CACHE_SCHEMA_VERSION, type PageCacheMeta } from "$lib/page-cache.js";

const DB_NAME = "gcg-page-cache";
const DB_VERSION = 1;
const STORE_NAME = "entries";
const KEY_PREFIX = "gcg-page-cache-key";
const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;

export type PageCacheScope = {
	userId: string | null;
	role: string | null;
	divisionId: string | null;
};

export type PageCacheKeyParts = PageCacheScope & {
	route: string;
	year?: number | null;
	search?: string | null;
	variant?: string | null;
};

type CacheEntry = {
	key: string;
	scope: string;
	route: string;
	iv: string;
	ciphertext: string;
	dataVersion: string;
	cachedAt: string;
	expiresAt: string;
	schemaVersion: number;
};

export type PageCacheHit<T> = {
	payload: T;
	meta: PageCacheMeta;
};

function scopeId(scope: PageCacheScope): string {
	return [
		scope.userId ?? "anonymous",
		scope.role ?? "no-role",
		scope.divisionId ?? "global"
	].join("|");
}

export function createPageCacheKey(parts: PageCacheKeyParts): string {
	return [
		`v${PAGE_CACHE_SCHEMA_VERSION}`,
		scopeId(parts),
		parts.route,
		parts.year ?? "all-years",
		parts.search?.trim() ?? "",
		parts.variant?.trim() ?? ""
	].join("|");
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function hasCrypto(): boolean {
	return Boolean(browser && globalThis.crypto?.subtle && globalThis.crypto.getRandomValues);
}

async function getSessionKey(scope: string): Promise<CryptoKey | null> {
	if (!hasCrypto()) return null;

	const storageKey = `${KEY_PREFIX}:${scope}`;
	let rawKey = sessionStorage.getItem(storageKey);
	if (!rawKey) {
		const bytes = new Uint8Array(32);
		globalThis.crypto.getRandomValues(bytes);
		rawKey = bytesToBase64(bytes);
		sessionStorage.setItem(storageKey, rawKey);
	}

	return globalThis.crypto.subtle.importKey(
		"raw",
		bytesToBuffer(base64ToBytes(rawKey)),
		{ name: "AES-GCM" },
		false,
		["encrypt", "decrypt"]
	);
}

function openCacheDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (!browser) {
			reject(new Error("IndexedDB hanya tersedia di browser"));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error ?? new Error("Gagal membuka cache lokal"));
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "key" });
			}
		};
	});
}

async function getEntry(key: string): Promise<CacheEntry | null> {
	const db = await openCacheDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const request = tx.objectStore(STORE_NAME).get(key);
		request.onerror = () => reject(request.error ?? new Error("Gagal membaca cache lokal"));
		request.onsuccess = () => resolve((request.result as CacheEntry | undefined) ?? null);
		tx.oncomplete = () => db.close();
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? new Error("Transaksi cache gagal"));
		};
	});
}

async function putEntry(entry: CacheEntry): Promise<void> {
	const db = await openCacheDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).put(entry);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? new Error("Gagal menulis cache lokal"));
		};
	});
}

async function deleteEntry(key: string): Promise<void> {
	const db = await openCacheDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).delete(key);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? new Error("Gagal menghapus cache lokal"));
		};
	});
}

export async function readEncryptedPageCache<T>(
	key: string,
	scope: PageCacheScope
): Promise<PageCacheHit<T> | null> {
	try {
		const entry = await getEntry(key);
		if (!entry || entry.scope !== scopeId(scope)) return null;
		if (entry.schemaVersion !== PAGE_CACHE_SCHEMA_VERSION) {
			await deleteEntry(key);
			return null;
		}
		if (Date.parse(entry.expiresAt) <= Date.now()) {
			await deleteEntry(key);
			return null;
		}

		const cryptoKey = await getSessionKey(entry.scope);
		if (!cryptoKey) return null;
		const iv = base64ToBytes(entry.iv);
		const ciphertext = base64ToBytes(entry.ciphertext);

		const decrypted = await globalThis.crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: bytesToBuffer(iv) },
			cryptoKey,
			bytesToBuffer(ciphertext)
		);
		const payload = JSON.parse(new TextDecoder().decode(decrypted)) as T;
		return {
			payload,
			meta: {
				route: entry.route,
				dataVersion: entry.dataVersion,
				cachedAt: entry.cachedAt,
				expiresAt: entry.expiresAt,
				schemaVersion: entry.schemaVersion
			}
		};
	} catch {
		await deleteEncryptedPageCache(key);
		return null;
	}
}

export async function writeEncryptedPageCache<T>(
	key: string,
	scope: PageCacheScope,
	route: string,
	payload: T,
	dataVersion: string,
	ttlMs = DEFAULT_TTL_MS
): Promise<void> {
	try {
		const resolvedScope = scopeId(scope);
		const cryptoKey = await getSessionKey(resolvedScope);
		if (!cryptoKey) return;

		const iv = new Uint8Array(12);
		globalThis.crypto.getRandomValues(iv);
		const encoded = new TextEncoder().encode(JSON.stringify(payload));
		const encrypted = await globalThis.crypto.subtle.encrypt(
			{ name: "AES-GCM", iv: bytesToBuffer(iv) },
			cryptoKey,
			bytesToBuffer(encoded)
		);
		const now = new Date();
		const expiresAt = new Date(now.getTime() + ttlMs);

		await putEntry({
			key,
			scope: resolvedScope,
			route,
			iv: bytesToBase64(iv),
			ciphertext: bytesToBase64(new Uint8Array(encrypted)),
			dataVersion,
			cachedAt: now.toISOString(),
			expiresAt: expiresAt.toISOString(),
			schemaVersion: PAGE_CACHE_SCHEMA_VERSION
		});
	} catch {
		// Cache failure must never block the application.
	}
}

export async function deleteEncryptedPageCache(key: string): Promise<void> {
	try {
		await deleteEntry(key);
	} catch {
		// Ignore cache cleanup failures.
	}
}

export async function deleteEncryptedPageCacheByRoute(scope: PageCacheScope, route: string): Promise<void> {
	if (!browser) return;
	const resolvedScope = scopeId(scope);
	try {
		const db = await openCacheDb();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);
			const request = store.openCursor();
			request.onerror = () => reject(request.error ?? new Error("Gagal membaca cache lokal"));
			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor) return;
				const entry = cursor.value as CacheEntry;
				if (entry.scope === resolvedScope && entry.route === route) cursor.delete();
				cursor.continue();
			};
			tx.oncomplete = () => {
				db.close();
				resolve();
			};
			tx.onerror = () => {
				db.close();
				reject(tx.error ?? new Error("Transaksi cleanup cache gagal"));
			};
		});
	} catch {
		// Ignore cache cleanup failures.
	}
}

export async function clearEncryptedPageCacheForUser(userId: string | null): Promise<void> {
	if (!browser) return;
	const prefix = userId ? `${userId}|` : "";
	try {
		const db = await openCacheDb();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			const store = tx.objectStore(STORE_NAME);
			const request = store.openCursor();
			request.onerror = () => reject(request.error ?? new Error("Gagal membersihkan cache lokal"));
			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor) return;
				const entry = cursor.value as CacheEntry;
				if (!prefix || entry.scope.startsWith(prefix)) cursor.delete();
				cursor.continue();
			};
			tx.oncomplete = () => {
				db.close();
				resolve();
			};
			tx.onerror = () => {
				db.close();
				reject(tx.error ?? new Error("Transaksi cleanup cache gagal"));
			};
		});
		for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
			const key = sessionStorage.key(i);
			if (key?.startsWith(KEY_PREFIX)) sessionStorage.removeItem(key);
		}
	} catch {
		// Logout must continue even if browser storage cleanup fails.
	}
}
