import { hasPermission, isAuthenticated, type AuthContext } from "$lib/server/rbac.js";
import { getAoiPageData } from "../../area-of-improvement/_services/load-aoi.server.js";
import { buildMonitoringData } from "../_lib/monitoring-aggregator.js";
import type { AoiLevelGroup, MonitoringGrandTotal } from "../_lib/types.js";

export async function getMonitoringPageData(year: number, auth: AuthContext): Promise<{
	levels: AoiLevelGroup[];
	grandTotal: MonitoringGrandTotal;
	availableYears: number[];
	error: Error | null;
}> {
	const emptyGrandTotal = { jumlahAoi: 0, statusCounts: { selesai: 0, onProgress: 0, tidakDapat: 0, belum: 0 } };
	if (!isAuthenticated(auth)) {
		return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], error: new Error("Tidak terautentikasi") };
	}
	if (!hasPermission(auth.role, "assessment:read")) {
		return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], error: new Error("Izin ditolak") };
	}

	const { items, availableYears, error } = await getAoiPageData(year, auth);
	if (error) return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], error };

	const { levels, grandTotal } = buildMonitoringData(items, new Map());
	return { levels, grandTotal, availableYears, error: null };
}
