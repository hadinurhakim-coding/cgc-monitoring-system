import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { hasPermission, isAdminRole, isAuthenticated, scopedDivisionId, type AuthContext } from "$lib/server/rbac.js";
import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
import { STATUS_REKOMENDASI_OPTIONS } from "../_lib/types.js";

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

export async function getAoiPageData(year: number, auth: AuthContext): Promise<{
	items: AoiItem[];
	availableYears: number[];
	error: Error | null;
}> {
	if (!isAuthenticated(auth)) {
		return { items: [], availableYears: [], error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:read")) {
		return { items: [], availableYears: [], error: new Error("Izin ditolak") };
	}

	const admin = createAdminServerClient();
	const divisionId = scopedDivisionId(auth);
	if (!isAdminRole(auth.role) && !divisionId) {
		return { items: [], availableYears: [], error: null };
	}

	let rowsQuery = admin
		.from("aoi_items")
		.select("*")
		.eq("year", year)
		.order("sort_order", { ascending: true, nullsFirst: false })
		.order("created_at", { ascending: true });
	let yearsQuery = admin
		.from("aoi_items")
		.select("year")
		.order("year", { ascending: false });
	if (!isAdminRole(auth.role) && divisionId) {
		rowsQuery = rowsQuery.eq("division_id", divisionId);
		yearsQuery = yearsQuery.eq("division_id", divisionId);
	}

	const [{ data: rows, error: rowsErr }, { data: yearRows, error: yearErr }] = await Promise.all([
		rowsQuery,
		yearsQuery,
	]);

	if (rowsErr) return { items: [], availableYears: [], error: new Error(rowsErr.message) };
	if (yearErr) return { items: [], availableYears: [], error: new Error(yearErr.message) };

	const items = (rows ?? []).map((r) => toAoiItem(r as Record<string, unknown>));

	const years = new Set<number>();
	for (const r of yearRows ?? []) {
		const y = Number((r as Record<string, unknown>).year);
		if (Number.isFinite(y)) years.add(y);
	}
	const availableYears = [...years].sort((a, b) => b - a);

	return { items, availableYears, error: null };
}
