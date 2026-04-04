import { dev } from "$app/environment";
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import type { User } from "@supabase/supabase-js";

/**
 * getClientAddress() dapat throw (mis. header proxy hilang, health check, prerender).
 * Jangan biarkan itu merusak seluruh request — kembalikan null dan lewati binding IP.
 */
function safeGetClientAddress(event: RequestEvent): string | null {
	try {
		return event.getClientAddress();
	} catch (e) {
		console.warn("getClientAddress failed:", e);
		return null;
	}
}
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	createAdminServerClient,
	createAnonServerClient
} from "$lib/server/auth.js";

function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
	const secure = !dev;
	const baseCookie = {
		path: "/",
		httpOnly: true,
		secure,
		sameSite: "lax" as const
	};

	cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
		...baseCookie,
		maxAge: 60 * 60
	});
	cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
		...baseCookie,
		maxAge: 60 * 60 * 24 * 30
	});
}

export function clearAuthCookies(cookies: Cookies) {
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
}

/** Normalisasi ringan untuk perbandingan IP dari inet / getClientAddress. */
function normalizeIp(ip: string): string {
	return ip.trim().toLowerCase();
}

/**
 * Fase C: setelah refresh token dipakai, bandingkan dengan baseline login terakhir.
 * Menolak hanya jika IP dan User-Agent keduanya berubah (mengurangi false positive: ganti IP saja atau UA saja tetap diizinkan).
 */
function auditBindingAllows(
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

export async function resolveAuthFromCookies(event: RequestEvent): Promise<void> {
	const accessToken = event.cookies.get(ACCESS_TOKEN_COOKIE);
	const refreshToken = event.cookies.get(REFRESH_TOKEN_COOKIE);

	if (!accessToken && !refreshToken) {
		return;
	}

	const anonClient = createAnonServerClient();
	let resolvedAccessToken = accessToken ?? "";
	let resolvedRefreshToken = refreshToken ?? "";
	let authUser: User | null = null;
	let didRefresh = false;

	if (accessToken) {
		const { data: userData, error: userError } = await anonClient.auth.getUser(accessToken);
		authUser = userData.user;

		if (!authUser && refreshToken && userError) {
			const { data: refreshed, error: refreshError } = await anonClient.auth.refreshSession({
				refresh_token: refreshToken
			});
			didRefresh = true;
			if (!refreshError && refreshed.session?.access_token && refreshed.session?.refresh_token) {
				resolvedAccessToken = refreshed.session.access_token;
				resolvedRefreshToken = refreshed.session.refresh_token;
				authUser = refreshed.user ?? null;
			} else {
				authUser = null;
			}
		}
	} else if (refreshToken) {
		const { data: refreshed, error: refreshError } = await anonClient.auth.refreshSession({
			refresh_token: refreshToken
		});
		didRefresh = true;
		if (!refreshError && refreshed.session?.access_token && refreshed.session?.refresh_token) {
			resolvedAccessToken = refreshed.session.access_token;
			resolvedRefreshToken = refreshed.session.refresh_token;
			authUser = refreshed.user ?? null;
		}
	}

	if (!authUser) {
		clearAuthCookies(event.cookies);
		return;
	}

	if (didRefresh) {
		const adminClient = createAdminServerClient();
		const { data: audit } = await adminClient
			.from("auth_login_audits")
			.select("ip_address, user_agent")
			.eq("user_id", authUser.id)
			.maybeSingle();

		const storedIp = audit?.ip_address != null ? String(audit.ip_address) : null;
		const storedUa = audit?.user_agent != null ? String(audit.user_agent) : null;

		if (storedIp !== null && storedUa !== null && storedUa.length > 0) {
			const currentIp = safeGetClientAddress(event);
			const currentUa = event.request.headers.get("user-agent") ?? "";
			if (currentIp !== null && !auditBindingAllows(storedIp, storedUa, currentIp, currentUa)) {
				clearAuthCookies(event.cookies);
				return;
			}
		}

		setAuthCookies(event.cookies, resolvedAccessToken, resolvedRefreshToken);
	}

	const adminClient = createAdminServerClient();
	const { data: userRow } = await adminClient
		.from("users")
		.select("id,email,role,division_id")
		.eq("id", authUser.id)
		.maybeSingle();

	if (!userRow) {
		clearAuthCookies(event.cookies);
		return;
	}

	event.locals.auth = {
		userId: authUser.id,
		email: authUser.email ?? null,
		role: userRow.role ?? null,
		divisionId: userRow.division_id ?? null,
		isAuthenticated: true
	};
}
