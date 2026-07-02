import { redirect } from "@sveltejs/kit";
import { isSafeRedirect } from "$lib/server/safe-redirect.js";
import type { LayoutServerLoad } from "./$types.js";

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.auth.isAuthenticated) {
		const redirectTo = isSafeRedirect(`${url.pathname}${url.search}`);
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
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
