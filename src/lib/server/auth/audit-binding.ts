/**
 * IP/UA audit binding logic — server-side only.
 * Satu file, satu tanggung jawab: validasi binding IP + User-Agent saat token refresh.
 *
 * Menolak hanya jika IP dan User-Agent keduanya berubah
 * (mengurangi false positive: ganti IP saja atau UA saja tetap diizinkan).
 */
import type { RequestEvent } from "@sveltejs/kit";

/** Normalisasi ringan untuk perbandingan IP dari inet / getClientAddress. */
function normalizeIp(ip: string): string {
	return ip.trim().toLowerCase();
}

/**
 * Bandingkan IP+UA saat ini dengan baseline login terakhir.
 * Returns `true` jika request diizinkan, `false` jika harus ditolak.
 */
export function auditBindingAllows(
	storedIp: string,
	storedUa: string,
	currentIp: string,
	currentUa: string
): boolean {
	const sip = normalizeIp(storedIp);
	const cip = normalizeIp(currentIp);
	const sua = storedUa.trim();
	const cua = currentUa.trim();

	if (sip === cip && sua === cua) return true;
	if (sip !== cip && sua !== cua) return false;
	return true;
}

/**
 * getClientAddress() dapat throw (mis. header proxy hilang, health check, prerender).
 * Jangan biarkan itu merusak seluruh request — kembalikan null dan lewati binding IP.
 */
export function safeGetClientAddress(event: RequestEvent): string | null {
	try {
		return event.getClientAddress();
	} catch (e) {
		console.warn("getClientAddress failed:", e);
		return null;
	}
}
