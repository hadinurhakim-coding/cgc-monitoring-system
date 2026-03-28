import { redirect } from "@sveltejs/kit";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "$lib/server/auth.js";
import type { RequestHandler } from "./$types.js";

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
	throw redirect(303, "/login");
};
