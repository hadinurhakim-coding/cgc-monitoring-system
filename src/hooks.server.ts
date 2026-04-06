import { redirect, type Handle } from "@sveltejs/kit";
import { resolveAuthFromCookies } from "$lib/server/auth/session-resolve.js";

const STATIC_FILE_EXT = /\.(svg|png|jpg|jpeg|webp|ico|json|txt|woff2?)$/i;

function isPublicPath(pathname: string) {
	if (pathname === "/" || pathname === "/login" || pathname === "/auth/callback") return true;
	if (pathname.startsWith("/_app/") || pathname === "/_app") return true;
	if (pathname === "/favicon.svg" || pathname === "/favicon.ico" || pathname === "/robots.txt") return true;
	if (STATIC_FILE_EXT.test(pathname) && !pathname.startsWith("/api")) return true;
	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = {
		userId: null,
		email: null,
		role: null,
		divisionId: null,
		isAuthenticated: false
	};

	await resolveAuthFromCookies(event);

	const pathname = event.url.pathname;
	const isPublic = isPublicPath(pathname);
	if (!isPublic && !event.locals.auth.isAuthenticated) {
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}

	if (pathname === "/login" && event.locals.auth.isAuthenticated) {
		throw redirect(303, "/dashboard");
	}

	const response = await resolve(event);

	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	if (!response.headers.has("Strict-Transport-Security")) {
		response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
	}

	return response;
};
