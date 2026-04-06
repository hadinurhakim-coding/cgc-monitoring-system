import type { PageServerLoad } from "./$types.js";

// FIX: ARCH-05 & ARCH-06
// - Redundant auth check dihapus (sudah dihandle hooks.server.ts)
// - Redundant authUser return dihapus (sudah dihandle +layout.server.ts)
export const load: PageServerLoad = async () => {
	return {};
};
