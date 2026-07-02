import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canAccessDivision, hasPermission } from "$lib/server/rbac.js";
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
	const { data: row, error: rowError } = await admin
		.from("aoi_items")
		.select("uid,division_id")
		.eq("uid", trimmed)
		.maybeSingle();

	if (rowError) return { error: new Error(rowError.message) };
	if (!row) return { error: new Error("AOI tidak ditemukan") };

	const rowDivisionId = row.division_id != null ? String(row.division_id) : null;
	if (!canAccessDivision(auth, rowDivisionId)) return { error: new Error("Izin ditolak") };

	const { error } = await admin.from("aoi_items").delete().eq("uid", trimmed);

	if (error) return { error: new Error(error.message) };
	return { error: null };
}
