import type { LayoutServerLoad } from "./$types.js";

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		authUser: {
			id: locals.auth.userId,
			email: locals.auth.email,
			role: locals.auth.role,
			divisionId: locals.auth.divisionId
		}
	};
};
