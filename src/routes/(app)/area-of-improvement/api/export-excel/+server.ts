import { error } from "@sveltejs/kit";
import { filterAoiItems } from "../../_lib/aoi-filter.js";
import { createAoiExcelFile } from "../../_services/export-aoi-excel.server.js";
import { getAoiPageData } from "../../_services/load-aoi.server.js";
import type { RequestHandler } from "./$types.js";

function resolveYear(value: string | null): number {
	const currentYear = new Date().getFullYear();
	const parsed = Number.parseInt(value ?? String(currentYear), 10);
	return Number.isFinite(parsed) ? parsed : currentYear;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.auth.isAuthenticated) throw error(401, "Tidak terautentikasi");

	const year = resolveYear(url.searchParams.get("year"));
	const query = (url.searchParams.get("q") ?? "").trim().slice(0, 500);
	const payload = await getAoiPageData(year, locals.auth, { syncFromAssessment: true });
	if (payload.error) throw error(403, payload.error.message);

	const items = filterAoiItems(payload.items, query);
	const file = await createAoiExcelFile(year, query, items);
	const responseBody = Uint8Array.from(file);
	const filename = `area-of-improvement-${year}${query ? "-filtered" : ""}.xlsx`;

	return new Response(responseBody, {
		headers: {
			"Cache-Control": "private, no-store",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"X-Exported-Rows": String(items.length),
		},
	});
};
