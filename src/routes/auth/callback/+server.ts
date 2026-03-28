import { redirect } from "@sveltejs/kit";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	createAdminServerClient,
	createAnonServerClient
} from "$lib/server/auth.js";
import type { RequestHandler } from "./$types.js";

export const GET: RequestHandler = async ({ url, getClientAddress, request, cookies }) => {
	const tokenHash = url.searchParams.get("token_hash") ?? url.searchParams.get("token");
	const type = url.searchParams.get("type");
	const nextParam = url.searchParams.get("next");
	const next =
		nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

	if (!tokenHash || !type) {
		throw redirect(303, "/login?error=Token+magic+link+tidak+valid");
	}

	const anonClient = createAnonServerClient();
	const { data, error } = await anonClient.auth.verifyOtp({
		token_hash: tokenHash,
		type: type as "magiclink" | "recovery" | "invite" | "email_change" | "email"
	});

	if (error || !data.session || !data.user) {
		throw redirect(303, "/login?error=Gagal+verifikasi+magic+link");
	}

	const secure = process.env.NODE_ENV === "production";
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

	const adminClient = createAdminServerClient();
	const forwardedFor = request.headers.get("x-forwarded-for");
	const ip = forwardedFor?.split(",")[0]?.trim() || getClientAddress();
	const userAgent = request.headers.get("user-agent");

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

	throw redirect(303, next);
};
