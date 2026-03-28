import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw redirect(303, "/login?redirectTo=%2Faccount");
	}
};
