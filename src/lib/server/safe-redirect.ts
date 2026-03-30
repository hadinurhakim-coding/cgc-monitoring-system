/**
 * FIX: CRIT-04 — Validasi redirect yang ketat untuk mencegah Open Redirect.
 *
 * Validasi ini menggantikan check sederhana `startsWith("/")` yang bisa di-bypass
 * dengan payloads seperti `/\evil.com`, `/%2f%2fevil.com`, dll.
 *
 * Pendekatan: whitelist prefix path yang diizinkan + decode check.
 */

const ALLOWED_PREFIXES = ["/dashboard", "/assessment-acgs", "/account"];

export function isSafeRedirect(path: string | null | undefined): string {
	if (!path) return "/dashboard";

	// Must start with single slash followed by valid URL characters
	if (!/^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/.test(path)) return "/dashboard";

	// Prevent double-slash and backslash after URL decoding
	try {
		const decoded = decodeURIComponent(path);
		if (decoded.startsWith("//") || decoded.includes("\\")) return "/dashboard";
	} catch {
		// Invalid URL encoding — reject
		return "/dashboard";
	}

	// Whitelist known path prefixes
	if (!ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) return "/dashboard";

	return path;
}
