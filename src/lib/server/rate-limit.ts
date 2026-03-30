/**
 * FIX: CRIT-06 + CRIT-09 — In-memory rate limiter untuk OTP endpoints.
 *
 * Mencegah:
 * - Brute-force OTP (verifyPin)
 * - Email flooding / OTP fatigue attack (sendPin)
 *
 * FIX CRIT-09:
 * - DIHAPUS: setInterval (timer leak di serverless, keep container alive)
 * - DITAMBAHKAN: MAX_ENTRIES cap (mencegah DoS via memory exhaustion)
 * - Menggunakan lazy cleanup saat Map penuh
 *
 * CATATAN: Ini adalah rate limiter single-instance (in-memory).
 * Untuk deployment multi-instance, gunakan solusi distributed (Redis/Upstash).
 */

const MAX_ENTRIES = 10_000;
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Lazy cleanup — hanya dijalankan saat Map mendekati batas.
 * Menghapus semua entry yang sudah expired.
 */
function lazyCleanup() {
	const now = Date.now();
	for (const [key, entry] of attempts) {
		if (now > entry.resetAt) attempts.delete(key);
	}
}

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
		// Safety valve: jika Map penuh, coba lazy cleanup dulu
		if (attempts.size >= MAX_ENTRIES) {
			lazyCleanup();
			// Jika masih penuh setelah cleanup, tolak untuk mencegah DoS
			if (attempts.size >= MAX_ENTRIES) {
				return { allowed: false, retryAfterSeconds: 60 };
			}
		}
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
