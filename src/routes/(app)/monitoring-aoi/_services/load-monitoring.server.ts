import { createAdminServerClient } from "$lib/server/auth/clients.js";
import type { AoiItem, StatusRekomendasi } from "../../area-of-improvement/_lib/types.js";
import { STATUS_REKOMENDASI_OPTIONS } from "../../area-of-improvement/_lib/types.js";
import { buildMonitoringData } from "../_lib/monitoring-aggregator.js";
import type { AoiLevelGroup, MonitoringGrandTotal } from "../_lib/types.js";

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

export async function getMonitoringPageData(year: number): Promise<{
	levels: AoiLevelGroup[];
	grandTotal: MonitoringGrandTotal;
	availableYears: number[];
	error: Error | null;
}> {
	const admin = createAdminServerClient();

	const [
		{ data: rows, error: rowsErr },
		{ data: keteranganRows, error: keteranganErr },
		{ data: yearRows, error: yearErr },
	] = await Promise.all([
		admin.from("aoi_items").select("*").eq("year", year),
		admin.from("aoi_monitoring_keterangan").select("part_id,keterangan").eq("year", year),
		admin.from("aoi_items").select("year").order("year", { ascending: false }),
	]);

	if (rowsErr) return { levels: [], grandTotal: { jumlahAoi: 0, statusCounts: { selesai: 0, onProgress: 0, tidakDapat: 0, belum: 0 } }, availableYears: [], error: new Error(rowsErr.message) };
	if (keteranganErr) return { levels: [], grandTotal: { jumlahAoi: 0, statusCounts: { selesai: 0, onProgress: 0, tidakDapat: 0, belum: 0 } }, availableYears: [], error: new Error(keteranganErr.message) };

	const items = (rows ?? []).map((r) => toAoiItem(r as Record<string, unknown>));

	const keteranganMap = new Map<string, string>();
	for (const r of keteranganRows ?? []) {
		const row = r as Record<string, unknown>;
		if (typeof row.part_id === "string") {
			keteranganMap.set(row.part_id, String(row.keterangan ?? ""));
		}
	}

	const { levels, grandTotal } = buildMonitoringData(items, keteranganMap);

	const years = new Set<number>();
	for (const r of yearRows ?? []) {
		const y = Number((r as Record<string, unknown>).year);
		if (Number.isFinite(y)) years.add(y);
	}
	const availableYears = [...years].sort((a, b) => b - a);

	return { levels, grandTotal, availableYears, error: yearErr ? new Error(yearErr.message) : null };
}
