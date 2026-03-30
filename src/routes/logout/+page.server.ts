/**
 * FIX: CRIT-03 — Logout via POST (SvelteKit form action) dengan CSRF protection.
 *
 * Menggantikan endpoint GET yang rentan terhadap CSRF attack.
 * SvelteKit form actions secara otomatis mendapat CSRF protection
 * melalui origin checking.
 */
import { redirect } from "@sveltejs/kit";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "$lib/server/auth.js";
import type { Actions } from "./$types.js";

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
		cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
		throw redirect(303, "/login");
	}
};
