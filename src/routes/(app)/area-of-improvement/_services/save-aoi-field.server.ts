import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission } from "$lib/server/rbac.js";
import { STATUS_REKOMENDASI_OPTIONS, isValidStatusRekomendasi } from "../_lib/types.js";

export type SaveAoiAuth = {
	userId: string | null;
	role: string | null;
	email: string | null;
	divisionId: string | null;
};

const ALLOWED_FIELDS = new Set([
	"fakta_temuan",
	"rekomendasi",
	"pic",
	"status_rekomendasi",
	"eviden",
	"level_label",
	"part_id",
	"section_id",
	"standar_label",
]);

export async function saveAoiField(
	auth: SaveAoiAuth,
	input: { uid: string; field: string; value: string }
): Promise<{ error: Error | null }> {
	if (!auth.userId) return { error: new Error("Tidak terautentikasi") };
	if (!hasPermission(auth.role, "assessment:write")) return { error: new Error("Izin ditolak") };

	const uid = input.uid?.trim();
	if (!uid) return { error: new Error("uid wajib diisi") };
	if (!ALLOWED_FIELDS.has(input.field)) return { error: new Error("Field tidak valid") };

	if (input.field === "status_rekomendasi" && !isValidStatusRekomendasi(input.value)) {
		return { error: new Error(`Status tidak valid. Pilih salah satu: ${STATUS_REKOMENDASI_OPTIONS.join(", ")}`) };
	}

	const admin = createAdminServerClient();
	const { error } = await admin
		.from("aoi_items")
		.update({
			[input.field]: input.value,
			updated_at: new Date().toISOString(),
			updated_by: auth.userId,
		})
		.eq("uid", uid);

	if (error) return { error: new Error(error.message) };
	return { error: null };
}
