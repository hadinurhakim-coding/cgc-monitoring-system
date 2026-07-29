import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { isAdminRole } from "$lib/server/rbac.js";
import type { SaveAoiAuth } from "../../area-of-improvement/_services/save-aoi-field.server.js";

export async function saveKeterangan(
	auth: SaveAoiAuth,
	input: { year: number; partId: string; keterangan: string }
): Promise<{ error: Error | null }> {
	if (!auth.userId) return { error: new Error("Tidak terautentikasi") };
	if (!isAdminRole(auth.role)) return { error: new Error("Izin ditolak") };

	if (!input.partId?.trim()) return { error: new Error("partId wajib diisi") };

	const admin = createAdminServerClient();
	const { error } = await admin
		.from("aoi_monitoring_keterangan")
		.upsert(
			{
				year: input.year,
				part_id: input.partId,
				keterangan: input.keterangan,
				audit_field: "keterangan",
				updated_at: new Date().toISOString(),
				updated_by: auth.userId,
			},
			{ onConflict: "year,part_id" }
		);

	if (error) return { error: new Error(error.message) };
	return { error: null };
}
