import { createAdminServerClient } from "$lib/server/auth/clients.js";
import { latestIsoVersion } from "$lib/server/page-cache-meta.server.js";
import { hasPermission, isAuthenticated, type AuthContext } from "$lib/server/rbac.js";
import { getAoiPageData } from "../../area-of-improvement/_services/load-aoi.server.js";
import { buildMonitoringData } from "../_lib/monitoring-aggregator.js";
import type { MonitoringHierarchyItem } from "../_lib/monitoring-aggregator.js";
import type { AoiLevelGroup, MonitoringGrandTotal } from "../_lib/types.js";

type HierarchyRow = {
	type: string | null;
	sort_order: number | null;
	level_label: string | null;
	part_id: string | null;
	item_id: string | null;
	label: string | null;
	name_id: string | null;
	full_name_id: string | null;
	updated_at: string | null;
};

type KeteranganRow = {
	part_id: string;
	keterangan: string;
	updated_at: string | null;
};

function norm(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback = 0): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function toHierarchyItem(row: HierarchyRow): MonitoringHierarchyItem | null {
	if (row.type !== "level" && row.type !== "part" && row.type !== "section") return null;
	return {
		type: row.type,
		sortOrder: numberValue(row.sort_order),
		levelLabel: norm(row.level_label),
		partId: norm(row.part_id),
		itemId: norm(row.item_id),
		label: norm(row.label),
		nameId: norm(row.name_id),
		fullNameId: norm(row.full_name_id),
	};
}

async function loadMonitoringHierarchy(): Promise<{
	hierarchy: MonitoringHierarchyItem[];
	updatedAt: string[];
	error: Error | null;
}> {
	const admin = createAdminServerClient();
	const { data, error } = await admin
		.from("acgs_items")
		.select("type,sort_order,level_label,part_id,item_id,label,name_id,full_name_id,updated_at")
		.in("type", ["level", "part", "section"])
		.eq("is_active", true)
		.order("sort_order", { ascending: true });

	if (error) {
		return { hierarchy: [], updatedAt: [], error: new Error(error.message) };
	}

	const hierarchy: MonitoringHierarchyItem[] = [];
	const updatedAt: string[] = [];
	for (const row of (data ?? []) as HierarchyRow[]) {
		const item = toHierarchyItem(row);
		if (item) hierarchy.push(item);
		if (row.updated_at) updatedAt.push(row.updated_at);
	}
	return { hierarchy, updatedAt, error: null };
}

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

	const hierarchy = await loadMonitoringHierarchy();
	if (hierarchy.error) return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], dataVersion: emptyVersion, error: hierarchy.error };

	const { items, availableYears, error } = await getAoiPageData(year, auth, { syncFromAssessment: true });
	if (error) return { levels: [], grandTotal: emptyGrandTotal, availableYears: [], dataVersion: emptyVersion, error };

	const keterangan = await loadKeteranganMap(year);
	const { levels, grandTotal } = buildMonitoringData(hierarchy.hierarchy, items, keterangan.map);
	const dataVersion = latestIsoVersion(
		[
			...items.map((item) => item.updated_at),
			...items.map((item) => item.followup_updated_at),
			...keterangan.updatedAt,
			...hierarchy.updatedAt,
		],
		`/monitoring-aoi:${year}:${items.length}:${hierarchy.hierarchy.length}:${availableYears.join(",")}`
	);
	return { levels, grandTotal, availableYears, dataVersion, error: null };
}
