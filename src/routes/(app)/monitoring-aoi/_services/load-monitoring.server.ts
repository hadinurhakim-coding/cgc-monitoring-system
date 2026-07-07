import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { latestIsoVersion } from "$lib/server/page-cache-meta.server.js";
import { hasPermission, isAuthenticated, type AuthContext } from "$lib/server/rbac.js";
import { getAoiPageData } from "../../area-of-improvement/_services/load-aoi.server.js";
import { buildMonitoringData } from "../_lib/monitoring-aggregator.js";
import type { AoiLevelGroup, MonitoringGrandTotal } from "../_lib/types.js";

type KeteranganRow = {
	part_id: string;
	keterangan: string;
	updated_at: string | null;
};

async function loadKeteranganMap(year: number): Promise<{
	map: Map<string, string>;
	updatedAt: string[];
}> {
	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("aoi_monitoring_keterangan")
		.select("part_id,keterangan,updated_at")
		.eq("year", year);

	if (error) {
		console.warn("[monitoring-aoi] aoi_monitoring_keterangan query failed:", error.message);
		return { map: new Map(), updatedAt: [] };
	}

	const map = new Map<string, string>();
	const updatedAt: string[] = [];
	for (const row of (data ?? []) as KeteranganRow[]) {
		if (row.part_id) map.set(row.part_id, row.keterangan ?? "");
		if (row.updated_at) updatedAt.push(row.updated_at);
	}
	return { map, updatedAt };
}

export async function getMonitoringPageData(year: number, auth: AuthContext): Promise<{
	levels: AoiLevelGroup[];
	grandTotal: MonitoringGrandTotal;
	availableYears: number[];
	dataVersion: string;
	error: Error | null;
}> {
	const emptyGrandTotal = { jumlahAoi: 0, statusCounts: { selesai: 0, onProgress: 0, tidakDapat: 0, belum: 0 } };
	const emptyVersion = `/monitoring-aoi:${year}:empty`;
	if (!isAuthenticated(auth)) {
		return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], dataVersion: emptyVersion, error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:read")) {
		return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], dataVersion: emptyVersion, error: new Error("Izin ditolak") };
	}

	const { items, availableYears, error } = await getAoiPageData(year, auth);
	if (error) return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], dataVersion: emptyVersion, error };

	const keterangan = await loadKeteranganMap(year);
	const { levels, grandTotal } = buildMonitoringData(items, keterangan.map);
	const dataVersion = latestIsoVersion(
		[...items.map((item) => item.updated_at), ...keterangan.updatedAt],
		`/monitoring-aoi:${year}:${items.length}:${availableYears.join(",")}`
	);
	return { levels, grandTotal, availableYears, dataVersion, error: null };
}
