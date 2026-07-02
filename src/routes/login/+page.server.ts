import { fail, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	clearAuthCookies
} from "$lib/server/auth/cookies.js";
import {
	createAdminServerClient,
	createAnonServerClient
} from "$lib/server/auth/clients.js";
import { checkRateLimit } from "$lib/server/rate-limit.js";
import { isSafeRedirect } from "$lib/server/safe-redirect.js";
import type { Actions, PageServerLoad } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECENT_PIN_COOKIE = "gcg-recent-pin";

/** Respons seragam untuk mengurangi enumerasi email (terdaftar vs tidak). */
const SEND_PIN_GENERIC_SUCCESS =
	"Jika email Anda terdaftar, Anda akan menerima PIN di kotak masuk. Periksa juga folder spam.";

export const load: PageServerLoad = async ({ cookies }) => {
	const recentEmail = cookies.get(RECENT_PIN_COOKIE) ?? null;
	return { recentEmail };
};

export const actions: Actions = {
	sendPin: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { error: "Format email tidak valid.", email, step: "email" as const });
		}

		const ip = getClientAddress();
		const { allowed: ipAllowed } = checkRateLimit(`otp-send-ip:${ip}`, 30, 15 * 60 * 1000);
		if (!ipAllowed) {
			return fail(429, {
				error: "Terlalu banyak permintaan dari jaringan ini. Coba lagi dalam 15 menit.",
				email,
				step: "email" as const
			});
		}

		const { allowed: sendAllowed } = checkRateLimit(`otp-send:${email}`, 5, 15 * 60 * 1000);
		if (!sendAllowed) {
			return fail(429, {
				error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit.",
				email,
				step: "email" as const
			});
		}

		const adminClient = createAdminServerClient();
		const authClient = createAnonServerClient();

		const { data: registeredUser, error: lookupError } = await adminClient
			.from("users")
			.select("id,is_active")
			.eq("email", email)
			.maybeSingle();

		if (lookupError) {
			console.error("User lookup failed:", lookupError.message);
			return fail(500, {
				error: "Terjadi gangguan sistem. Coba lagi beberapa saat.",
				email,
				step: "email" as const
			});
		}

		if (!registeredUser || registeredUser.is_active === false) {
			return {
				success: SEND_PIN_GENERIC_SUCCESS,
				email,
				step: "email" as const
			};
		}

		const { error: otpError } = await authClient.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false
			}
		});

		if (otpError) {
			console.error("OTP send failed:", otpError.message);
			return {
				success: SEND_PIN_GENERIC_SUCCESS,
				email,
				step: "email" as const
			};
		}

		const secure = !dev;
		cookies.set(RECENT_PIN_COOKIE, email, {
			path: "/",
			httpOnly: true,
			secure,
			sameSite: "lax",
			maxAge: 60 * 60
		});

		return {
			success: SEND_PIN_GENERIC_SUCCESS,
			email,
			step: "email" as const
		};
	},

	verifyPin: async ({ request, url, cookies, getClientAddress }) => {
		const nextPath = isSafeRedirect(url.searchParams.get("redirectTo"));

		const formData = await request.formData();
		const email = String(formData.get("email") || "").trim().toLowerCase();
		const pin = String(formData.get("pin") || "").replace(/\D/g, "");

		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { error: "Email tidak valid.", email, step: "pin" as const });
		}

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

		const sessionEmail = (data.user.email ?? "").trim().toLowerCase();
		if (sessionEmail !== email) {
			return fail(400, { error: "Email tidak cocok dengan PIN.", email, step: "pin" as const });
		}

		const { data: userRow, error: appUserError } = await adminClient
			.from("users")
			.select("id,is_active")
			.eq("id", data.user.id)
			.maybeSingle();

		if (appUserError) {
			console.error("App user lookup failed:", appUserError.message);
			return fail(500, { error: "Terjadi gangguan sistem. Coba lagi.", email, step: "pin" as const });
		}

		if (!userRow) {
			clearAuthCookies(cookies);
			return fail(403, {
				error: "Akun tidak terdaftar di aplikasi. Hubungi administrator.",
				email,
				step: "pin" as const
			});
		}

		if (userRow.is_active === false) {
			clearAuthCookies(cookies);
			return fail(403, {
				error: "Akun Anda sedang nonaktif. Hubungi administrator.",
				email,
				step: "pin" as const
			});
		}

		const secure = !dev;
		const cookieBase = { path: "/", httpOnly: true, secure, sameSite: "lax" as const };

		cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, { ...cookieBase, maxAge: 60 * 60 });
		cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

		cookies.delete(RECENT_PIN_COOKIE, { path: "/" });

		try {
			const ip = getClientAddress();
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
