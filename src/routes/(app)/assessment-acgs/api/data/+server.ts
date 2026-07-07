import { json } from "@sveltejs/kit";
import { createPageCacheMeta, latestIsoVersion } from "$lib/server/page-cache-meta.server.js";
import { getAssessmentPageData } from "../../_services/load-assessment.server.js";
import type { RequestHandler } from "./$types.js";

const ROUTE = "/assessment-acgs";

function resolveYear(value: string | null): number {
	const currentYear = new Date().getFullYear();
	const parsed = Number.parseInt(value ?? String(currentYear), 10);
	return Number.isFinite(parsed) ? parsed : currentYear;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const year = resolveYear(url.searchParams.get("year"));
	const search = url.searchParams.get("q") ?? "";
	const payload = await getAssessmentPageData(year, locals.auth, { search });
	const version = latestIsoVersion(
		payload.questions.map((row) => (typeof row.updated_at === "string" ? row.updated_at : null)),
		`${ROUTE}:${year}:${payload.questionsTotal}:${payload.availableYears.join(",")}`
	);

	return json({
		assessmentQuestions: payload.error ? [] : payload.questions,
		questionsTotal: payload.error ? 0 : payload.questionsTotal,
		search: payload.search,
		availableYears: payload.availableYears,
		year,
		loadError: payload.error?.message ?? null,
		cacheMeta: createPageCacheMeta(ROUTE, version)
	});
};
