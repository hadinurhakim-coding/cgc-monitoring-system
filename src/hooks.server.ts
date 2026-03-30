import { redirect, type Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
	createAdminServerClient,
	createAnonServerClient
} from "$lib/server/auth.js";

const PUBLIC_PATHS = new Set(["/", "/login", "/auth/callback"]);

function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	if (pathname.startsWith("/_app")) return true;
	if (pathname.startsWith("/favicon")) return true;
	if (pathname.includes(".") && !pathname.startsWith("/api")) return true;
	return false;
}

function setAuthCookies(
	cookies: Parameters<Handle>[0]["event"]["cookies"],
	accessToken: string,
	refreshToken: string
) {
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

function clearAuthCookies(cookies: Parameters<Handle>[0]["event"]["cookies"]) {
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = {
		userId: null,
		email: null,
		role: null,
		divisionId: null,
		isAuthenticated: false
	};

	const accessToken = event.cookies.get(ACCESS_TOKEN_COOKIE);
	const refreshToken = event.cookies.get(REFRESH_TOKEN_COOKIE);
	const pathname = event.url.pathname;

	if (accessToken) {
		const anonClient = createAnonServerClient();
		let resolvedAccessToken = accessToken;
		let resolvedRefreshToken = refreshToken ?? "";

		const { data: userData, error: userError } = await anonClient.auth.getUser(accessToken);
		let authUser = userData.user;

		if (!authUser && refreshToken && userError) {
			const { data: refreshed, error: refreshError } = await anonClient.auth.refreshSession({
				refresh_token: refreshToken
			});
			if (!refreshError && refreshed.session?.access_token && refreshed.session?.refresh_token) {
				resolvedAccessToken = refreshed.session.access_token;
				resolvedRefreshToken = refreshed.session.refresh_token;
				authUser = refreshed.user ?? null;
				setAuthCookies(event.cookies, resolvedAccessToken, resolvedRefreshToken);
			}
		}

		if (authUser) {
			const adminClient = createAdminServerClient();
			const { data: userRow } = await adminClient
				.from("users")
				.select("id,email,role,division_id")
				.eq("id", authUser.id)
				.maybeSingle();

			// FIX: ARCH-09 — Guard user tanpa entry di tabel public.users
			if (!userRow) {
				clearAuthCookies(event.cookies);
			} else {
				event.locals.auth = {
					userId: authUser.id,
					email: authUser.email ?? null,
					role: userRow.role ?? null,
					divisionId: userRow.division_id ?? null,
					isAuthenticated: true
				};
			}
		} else {
			clearAuthCookies(event.cookies);
		}
	}

	const isPublic = isPublicPath(pathname);
	if (!isPublic && !event.locals.auth.isAuthenticated) {
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}

	if (pathname === "/login" && event.locals.auth.isAuthenticated) {
		throw redirect(303, "/dashboard");
	}

	return resolve(event);
};
