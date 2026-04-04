/**
 * FIX: CRIT-03 — Logout via POST (SvelteKit form action) dengan CSRF protection.
 *
 * Menggantikan endpoint GET yang rentan terhadap CSRF attack.
 * SvelteKit form actions secara otomatis mendapat CSRF protection
 * melalui origin checking.
 */
import { redirect } from "@sveltejs/kit";
import { clearAuthCookies } from "$lib/server/session-resolve.js";
import type { Actions } from "./$types.js";

export const actions: Actions = {
	default: async ({ cookies }) => {
		clearAuthCookies(cookies);
		throw redirect(303, "/login");
	}
};
