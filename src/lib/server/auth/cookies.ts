/**
 * Auth cookie constants dan helpers — server-side only.
 * Satu file, satu tanggung jawab: mengelola auth cookies.
 */
import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";

export const ACCESS_TOKEN_COOKIE = "gcg-access-token";
export const REFRESH_TOKEN_COOKIE = "gcg-refresh-token";

export function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
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
