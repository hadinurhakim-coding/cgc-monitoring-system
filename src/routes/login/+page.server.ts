import { fail, redirect } from "@sveltejs/kit";
import { createClient } from "@supabase/supabase-js";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";
import type { Actions } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Assuming a standard way to set cookies since $lib/server/auth doesn't exist
// based on previous file exploration.
const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export const actions: Actions = {
	sendPin: async ({ request, url }) => {
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "/dashboard";
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, {
				error: "Format email tidak valid.",
				email,
				step: "email" as const
			});
		}

		const { data: registeredUser, error: lookupError } = await adminClient
			.from("users")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (lookupError) {
			console.error("User lookup failed:", lookupError.message);
			return fail(500, {
				error: "Terjadi gangguan sistem. Coba lagi beberapa saat.",
				step: "email" as const
			});
		}

		if (!registeredUser) {
			return fail(404, {
				error: "Email belum terdaftar. Hubungi admin untuk aktivasi akun.",
				email,
				step: "email" as const
			});
		}

		const { error: otpError } = await authClient.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false
			}
		});

		if (otpError) {
			console.error("OTP send failed:", otpError.message);

			let errorMessage = "Gagal mengirim PIN. Silakan coba lagi.";

			if (otpError.message.toLowerCase().includes("rate limit")) {
				errorMessage = "Terlalu banyak permintaan pengiriman email. Silakan tunggu beberapa saat.";
			} else if (otpError.message) {
				errorMessage = `Gagal mengirim: ${otpError.message}`;
			}

			return fail(400, {
				error: errorMessage,
				email,
				step: "email" as const
			});
		}

		return {
			success: "PIN berhasil dikirim. Silakan cek email Anda.",
			email,
			step: "pin" as const
		};
	},

	verifyPin: async ({ request, url, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const email = String(formData.get("email") || "").trim().toLowerCase();
		const pin = String(formData.get("pin") || "").trim();
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";

		if (!pin || pin.length !== 6) {
			return fail(400, { error: "PIN harus terdiri dari 6 digit angka.", email, step: "pin" as const });
		}

		const { data, error } = await authClient.auth.verifyOtp({
			email,
			token: pin,
			type: "email"
		});

		if (error || !data.session || !data.user) {
			return fail(401, { error: "PIN tidak valid atau sudah kedaluwarsa.", email, step: "pin" as const });
		}

		const secure = process.env.NODE_ENV === "production";
		const cookieBase = { path: "/", httpOnly: true, secure, sameSite: "lax" as const };

		cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, { ...cookieBase, maxAge: 60 * 60 });
		cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

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
