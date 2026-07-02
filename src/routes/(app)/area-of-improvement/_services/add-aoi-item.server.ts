import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole } from "$lib/server/rbac.js";
import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
import { STATUS_REKOMENDASI_OPTIONS } from "../_lib/types.js";
import type { SaveAoiAuth } from "./save-aoi-field.server.js";

function toAoiItem(raw: Record<string, unknown>): AoiItem {
	const status = String(raw.status_rekomendasi ?? "Belum ditindak-lanjuti");
	const validStatus: StatusRekomendasi = (STATUS_REKOMENDASI_OPTIONS as readonly string[]).includes(status)
		? (status as StatusRekomendasi)
		: "Belum ditindak-lanjuti";
	return {
		uid: String(raw.uid ?? ""),
		year: Number(raw.year ?? 0),
		sort_order: raw.sort_order != null ? Number(raw.sort_order) : null,
		division_id: raw.division_id != null ? String(raw.division_id) : null,
		level_label: String(raw.level_label ?? ""),
		part_id: String(raw.part_id ?? ""),
		section_id: String(raw.section_id ?? ""),
		standar_label: String(raw.standar_label ?? ""),
		fakta_temuan: String(raw.fakta_temuan ?? ""),
		rekomendasi: String(raw.rekomendasi ?? ""),
		pic: String(raw.pic ?? ""),
		status_rekomendasi: validStatus,
		eviden: String(raw.eviden ?? ""),
		created_at: String(raw.created_at ?? ""),
		updated_at: String(raw.updated_at ?? ""),
		created_by: raw.created_by != null ? String(raw.created_by) : null,
		updated_by: raw.updated_by != null ? String(raw.updated_by) : null,
	};
}

export async function addAoiItem(
	auth: SaveAoiAuth,
	input: {
		year: number;
		sectionId: string;
		standarLabel: string;
		partId: string;
		levelLabel: string;
	}
): Promise<{ data: AoiItem | null; error: Error | null }> {
	if (!auth.userId) return { data: null, error: new Error("Tidak terautentikasi") };
	if (!hasPermission(auth.role, "assessment:write")) return { data: null, error: new Error("Izin ditolak") };
	if (!isAdminRole(auth.role) && !auth.divisionId) {
		return { data: null, error: new Error("Divisi pengguna tidak valid") };
	}

	const admin = createAdminServerClient();
	const divisionId = isAdminRole(auth.role) ? null : auth.divisionId;

	let maxQuery = admin
		.from("aoi_items")
		.select("sort_order")
		.eq("year", input.year)
		.order("sort_order", { ascending: false, nullsFirst: false })
		.limit(1);
	if (divisionId) {
		maxQuery = maxQuery.eq("division_id", divisionId);
	}

	const { data: maxRow } = await maxQuery.maybeSingle();

	const nextSortOrder = maxRow != null && (maxRow as Record<string, unknown>).sort_order != null
		? Number((maxRow as Record<string, unknown>).sort_order) + 1
		: 1;

	const { data, error } = await admin
		.from("aoi_items")
		.insert({
			year: input.year,
			sort_order: nextSortOrder,
			division_id: divisionId,
			level_label: input.levelLabel,
			part_id: input.partId,
			section_id: input.sectionId,
			standar_label: input.standarLabel,
			created_by: auth.userId,
			updated_by: auth.userId,
		})
		.select()
		.single();

	if (error) return { data: null, error: new Error(error.message) };
	if (!data) return { data: null, error: new Error("Insert berhasil tapi tidak ada data kembali") };

	return { data: toAoiItem(data as Record<string, unknown>), error: null };
}
