import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	createAdminServerClient,
	createAnonServerClient
} from "$lib/server/auth.js";
import { isSafeRedirect } from "$lib/server/safe-redirect.js";
import type { RequestHandler } from "./$types.js";

const ALLOWED_OTP_TYPES = new Set(["email", "magiclink"]);

export const GET: RequestHandler = async ({ url, getClientAddress, request, cookies }) => {
	const tokenHash = url.searchParams.get("token_hash") ?? url.searchParams.get("token");
	const type = url.searchParams.get("type");

	const next = isSafeRedirect(url.searchParams.get("next"));

	if (!tokenHash || !type || !ALLOWED_OTP_TYPES.has(type)) {
		throw redirect(303, "/login?error=Tautan+tidak+valid+atau+kedaluwarsa");
	}

	const anonClient = createAnonServerClient();
	const { data, error } = await anonClient.auth.verifyOtp({
		token_hash: tokenHash,
		type: type as "email" | "magiclink"
	});

	if (error || !data.session || !data.user) {
		throw redirect(303, "/login?error=Gagal+verifikasi+magic+link");
	}

	const adminClient = createAdminServerClient();
	const { data: userRow, error: userLookupError } = await adminClient
		.from("users")
		.select("id")
		.eq("id", data.user.id)
		.maybeSingle();

	if (userLookupError) {
		console.error("auth/callback user lookup failed:", userLookupError.message);
		throw redirect(303, "/login?error=Terjadi+gangguan+sistem");
	}

	if (!userRow) {
		throw redirect(303, "/login?error=Akun+tidak+terdaftar+di+sistem+aplikasi");
	}

	const secure = !dev;
	const cookieBase = {
		path: "/",
		httpOnly: true,
		secure,
		sameSite: "lax" as const
	};
	cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
		...cookieBase,
		maxAge: 60 * 60
	});
	cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
		...cookieBase,
		maxAge: 60 * 60 * 24 * 30
	});

	const ip = getClientAddress();
	const userAgent = request.headers.get("user-agent");

	try {
		await adminClient.from("auth_login_audits").upsert(
			{
				user_id: data.user.id,
				email: data.user.email ?? "",
				provider: "magic_link",
				last_login_at: new Date().toISOString(),
				ip_address: ip,
				user_agent: userAgent
			},
			{ onConflict: "user_id" }
		);
	} catch (e) {
		console.error("Failed to record audit login", e);
	}

	throw redirect(303, next);
};
