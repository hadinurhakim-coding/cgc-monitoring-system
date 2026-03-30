import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	return {
		nextPath: locals.auth.isAuthenticated ? "/dashboard" : "/login"
	};
};
