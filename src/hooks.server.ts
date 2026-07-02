import type { Handle } from "@sveltejs/kit";
import { resolveAuthFromCookies } from "$lib/server/auth/session-resolve.js";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = {
		userId: null,
		email: null,
		role: null,
		divisionId: null,
		isAuthenticated: false
	};

	await resolveAuthFromCookies(event);

	const response = await resolve(event);

	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	if (!response.headers.has("Strict-Transport-Security")) {
		response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
	}

	return response;
};
