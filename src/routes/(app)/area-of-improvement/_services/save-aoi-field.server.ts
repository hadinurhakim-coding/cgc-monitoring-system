import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { canAccessDivision, hasPermission, type AuthContext } from "$lib/server/rbac.js";
import { STATUS_REKOMENDASI_OPTIONS, isValidStatusRekomendasi } from "../_lib/types.js";

export type SaveAoiAuth = AuthContext;

const FIELD_TO_COLUMN: Record<string, string> = {
	fakta_temuan: "fakta_temuan_override",
	tindak_lanjut_rekomendasi: "tindak_lanjut_rekomendasi",
	pic: "pic",
	target_waktu_penyelesaian: "target_waktu_penyelesaian",
	status_rekomendasi: "status_rekomendasi",
	eviden: "eviden",
	keterangan: "keterangan",
};

export async function saveAoiField(
	auth: SaveAoiAuth,
	input: { uid: string; field: string; value: string }
): Promise<{ error: Error | null }> {
	if (!auth.userId) return { error: new Error("Tidak terautentikasi") };
	if (!hasPermission(auth.role, "assessment:write")) return { error: new Error("Izin ditolak") };

	const uid = input.uid?.trim();
	if (!uid) return { error: new Error("uid wajib diisi") };

	const column = FIELD_TO_COLUMN[input.field];
	if (!column) return { error: new Error("Field tidak valid") };

	if (input.field === "status_rekomendasi" && !isValidStatusRekomendasi(input.value)) {
		return { error: new Error(`Status tidak valid. Pilih salah satu: ${STATUS_REKOMENDASI_OPTIONS.join(", ")}`) };
	}
	if (input.field === "target_waktu_penyelesaian" && input.value && !/^\d{4}-\d{2}-\d{2}$/.test(input.value)) {
		return { error: new Error("Target waktu wajib memakai format tanggal yang valid") };
	}

	const admin = createAdminServerClient();
	const { data: row, error: rowError } = await admin
		.from("aoi_items")
		.select("uid,division_id")
		.eq("uid", uid)
		.maybeSingle();

	if (rowError) return { error: new Error(rowError.message) };
	if (!row) return { error: new Error("AOI tidak ditemukan") };

	const raw = row as Record<string, unknown>;
	const rowDivisionId = typeof raw.division_id === "string" ? raw.division_id : null;
	if (!canAccessDivision(auth, rowDivisionId)) return { error: new Error("Izin ditolak") };

	const value = input.field === "target_waktu_penyelesaian" && input.value === "" ? null : input.value;
	const payload: Record<string, string | null> = {
		aoi_item_uid: uid,
		[column]: value,
		audit_field: input.field,
		created_by: auth.userId,
		updated_by: auth.userId,
	};

	const { error } = await admin
		.from("aoi_followups")
		.upsert(payload, { onConflict: "aoi_item_uid" });

	if (error) return { error: new Error(error.message) };
	return { error: null };
}
