import { fail, redirect } from "@sveltejs/kit";
import {
	createAdminServerClient,
	createAnonServerClient,
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE
} from "$lib/server/auth.js";
import type { Actions } from "./$types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminClient = createAdminServerClient();
const authClient = createAnonServerClient();

export const actions: Actions = {
	sendPin: async ({ request }) => {
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

		// Jika gagal di tahap email, kembalikan step: "email"
		if (!email || !EMAIL_REGEX.test(email)) {
			return fail(400, { error: "Format email tidak valid.", email, step: "email" });
		}

		const { data: registeredUser, error: lookupError } = await adminClient
			.from("users")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (lookupError) {
			console.error("User lookup failed:", lookupError.message);
			return fail(500, { error: "Terjadi gangguan sistem. Coba lagi beberapa saat.", email, step: "email" });
		}

		if (!registeredUser) {
			return fail(404, { error: "Email belum terdaftar. Hubungi administrator.", email, step: "email" });
		}

		const { error: otpError } = await authClient.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false
			}
		});

		if (otpError) {
			console.error("OTP send failed:", otpError.message);
			return fail(400, { error: "Gagal mengirim PIN. Silakan coba lagi.", email, step: "email" });
		}

		// Jika sukses, ubah state menjadi step: "pin" agar UI berubah
		return { success: "PIN berhasil dikirim. Silakan cek email Anda.", email, step: "pin" };
	},

	verifyPin: async ({ request, url, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const email = String(formData.get("email") || "").trim().toLowerCase();
		const pin = String(formData.get("pin") || "").replace(/\D/g, "");

		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";

		if (!pin || !/^\d{6,8}$/.test(pin)) {
			return fail(400, { error: "PIN harus terdiri dari 6–8 digit angka.", email, step: "pin" });
		}

		const { data, error } = await authClient.auth.verifyOtp({
			email,
			token: pin,
			type: "email"
		});

		if (error || !data.session || !data.user) {
			return fail(401, { error: "PIN tidak valid atau sudah kedaluwarsa.", email, step: "pin" });
		}

		const secure = process.env.NODE_ENV === "production";
		const cookieBase = { path: "/", httpOnly: true, secure, sameSite: "lax" as const };

		cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, { ...cookieBase, maxAge: 60 * 60 });
		cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

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

		throw redirect(303, nextPath);
	}
};