import { fail, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";
import type { Actions, PageServerLoad } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";
const RECENT_PIN_COOKIE = "gcg-recent-pin";

export const load: PageServerLoad = async ({ cookies }) => {
	const recentEmail = cookies.get(RECENT_PIN_COOKIE);
	return {
		recentEmail
	};
};

export const actions: Actions = {
	sendPin: async ({ request, url, cookies }) => {
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "/dashboard";
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

		// Jika gagal di tahap email, kembalikan step: "email" as const
		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { error: "Format email tidak valid.", email, step: "email" as const });
		}

		// FIX: CRIT-06 — Rate limiting untuk mencegah email flooding / OTP fatigue
		const { allowed: sendAllowed } = checkRateLimit(`otp-send:${email}`, 5, 15 * 60 * 1000);
		if (!sendAllowed) {
			return fail(429, {
				error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit.",
				email,
				step: "email" as const
			});
		}

		// FIX: CRIT-02 — Client dibuat per-request, bukan module-level singleton
		const adminClient = createAdminServerClient();
		const authClient = createAnonServerClient();

		const { data: registeredUser, error: lookupError } = await adminClient
			.from("users")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (lookupError) {
			console.error("User lookup failed:", lookupError.message);
			return fail(500, { error: "Terjadi gangguan sistem. Coba lagi beberapa saat.", email, step: "email" as const });
		}

		if (!registeredUser) {
			return fail(404, { error: "Email belum terdaftar. Hubungi administrator.", email, step: "email" as const });
		}

		const { error: otpError } = await authClient.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false
			}
		});

		if (otpError) {
			console.error("OTP send failed:", otpError.message);
			return fail(400, { error: "Gagal mengirim PIN. Silakan coba lagi.", email, step: "email" as const });
		}

		// Save the email in a cookie for 1 hour to prevent resending unnecessarily
		const secure = process.env.NODE_ENV === "production";
		cookies.set(RECENT_PIN_COOKIE, email, {
			path: "/",
			httpOnly: true,
			secure,
			sameSite: "lax",
			maxAge: 60 * 60 // 1 hour
		});

		return {
			success: "PIN berhasil dikirim. Silakan cek email Anda.",
			email,
			step: "pin" as const
		};
	},

	verifyPin: async ({ request, url, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const email = String(formData.get("email") || "").trim().toLowerCase();
		const pin = String(formData.get("pin") || "").replace(/\D/g, "");

		// FIX: CRIT-04 — Validasi redirect yang ketat (whitelist prefix)
		const nextPath = isSafeRedirect(url.searchParams.get("redirectTo"));

		// FIX: CRIT-06 — Rate limiting untuk mencegah brute-force OTP
		const { allowed: verifyAllowed } = checkRateLimit(`otp-verify:${email}`, 10, 15 * 60 * 1000);
		if (!verifyAllowed) {
			return fail(429, {
				error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
				email,
				step: "pin" as const
			});
		}

		if (!pin || !/^\d{6,8}$/.test(pin)) {
			return fail(400, { error: "PIN harus terdiri dari 6–8 digit angka.", email, step: "pin" as const });
		}

		// FIX: CRIT-02 — Client dibuat per-request, bukan module-level singleton
		const adminClient = createAdminServerClient();
		const authClient = createAnonServerClient();

		const { data, error } = await authClient.auth.verifyOtp({
			email,
			token: pin,
			type: "email"
		});

		if (error || !data.session || !data.user) {
			return fail(401, { error: "PIN tidak valid atau sudah kedaluwarsa.", email, step: "pin" as const });
		}

		const secure = !dev;
		const cookieBase = { path: "/", httpOnly: true, secure, sameSite: "lax" as const };

		cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, { ...cookieBase, maxAge: 60 * 60 });
		cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

		// Remove the recent pin cookie after successful login
		cookies.delete(RECENT_PIN_COOKIE, { path: "/" });

		// Try to record login audit if table exists, ignore if not
		try {
			const forwardedFor = request.headers.get("x-forwarded-for");
			const ip = forwardedFor?.split(",")[0]?.trim() || getClientAddress();
			const userAgent = request.headers.get("user-agent");

			await adminClient.from("auth_login_audits").upsert(
				{
					user_id: data.user.id,
					email: data.user.email ?? "",
					provider: "email_pin",
					last_login_at: new Date().toISOString(),
					ip_address: ip,
					user_agent: userAgent
				},
				{ onConflict: "user_id" }
			);
		} catch (e) {
			console.error("Failed to record audit login", e);
		}

		throw redirect(303, nextPath);
	}
};