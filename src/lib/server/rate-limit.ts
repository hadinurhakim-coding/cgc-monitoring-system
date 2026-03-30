/**
 * FIX: CRIT-06 — In-memory rate limiter untuk OTP endpoints.
 *
 * Mencegah:
 * - Brute-force OTP (verifyPin)
 * - Email flooding / OTP fatigue attack (sendPin)
 *
 * CATATAN: Ini adalah rate limiter single-instance (in-memory).
 * Untuk deployment multi-instance, gunakan solusi distributed (Redis/Upstash).
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

// Bersihkan entri expired secara periodik (setiap 5 menit)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of attempts) {
		if (now > entry.resetAt) {
			attempts.delete(key);
		}
	}
}, CLEANUP_INTERVAL_MS);

/**
 * Cek apakah request masih diizinkan berdasarkan rate limit.
 *
 * @param key - Identifier unik (contoh: `otp-send:user@email.com`)
 * @param maxAttempts - Jumlah percobaan maksimal dalam window
 * @param windowMs - Window waktu dalam millisecond (default: 15 menit)
 * @returns Object dengan `allowed` (boolean) dan `retryAfterSeconds` (number)
 */
export function checkRateLimit(
	key: string,
	maxAttempts: number = 5,
	windowMs: number = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
	const now = Date.now();
	const entry = attempts.get(key);

	// Entri belum ada atau sudah expired — reset counter
	if (!entry || now > entry.resetAt) {
		attempts.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSeconds: 0 };
	}

	// Sudah melebihi batas — reject
	if (entry.count >= maxAttempts) {
		return {
			allowed: false,
			retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000)
		};
	}

	// Masih dalam batas — increment counter
	entry.count++;
	return { allowed: true, retryAfterSeconds: 0 };
}
