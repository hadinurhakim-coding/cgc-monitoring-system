import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.isAuthenticated) {
		throw redirect(303, "/login?redirectTo=%2Fdashboard");
	}

	return {
		authUser: {
			id: locals.auth.userId,
			email: locals.auth.email,
			role: locals.auth.role,
			divisionId: locals.auth.divisionId
		}
	};
};
