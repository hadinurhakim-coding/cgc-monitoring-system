import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import type { SaveAoiAuth } from "./save-aoi-field.server.js";

export async function deleteAoiItem(
	auth: SaveAoiAuth,
	uid: string
): Promise<{ error: Error | null }> {
	if (!auth.userId) return { error: new Error("Tidak terautentikasi") };
	if (!hasPermission(auth.role, "assessment:write")) return { error: new Error("Izin ditolak") };

	const trimmed = uid?.trim();
	if (!trimmed) return { error: new Error("uid wajib diisi") };

	const admin = createAdminServerClient();
	const { error } = await admin.from("aoi_items").delete().eq("uid", trimmed);

	if (error) return { error: new Error(error.message) };
	return { error: null };
}
