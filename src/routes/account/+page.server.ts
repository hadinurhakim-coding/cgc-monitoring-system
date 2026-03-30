import type { PageServerLoad } from "./$types.js";

// FIX: ARCH-05 
// - Redundant auth check dihapus (sudah dihandle secara global oleh hooks.server.ts)
export const load: PageServerLoad = async () => {
	return {};
};
