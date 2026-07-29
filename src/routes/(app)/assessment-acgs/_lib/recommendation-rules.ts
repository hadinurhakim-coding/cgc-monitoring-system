import type { AssessmentItem } from "./types.js";
import { norm } from "./acgs-question-utils.js";

const SPECIAL_RECOMMENDATION_ITEM_ID = "(P)B.1.1";
const SPECIAL_RECOMMENDATION_YEAR = 2024;

export function canKeepRecommendationForNonNoStatus(params: {
	year: number;
	itemId: string | null | undefined;
	status: string | null | undefined;
}): boolean {
	const itemId = norm(params.itemId);
	const status = norm(params.status).toUpperCase();
	if (status !== "YES" && status !== "Y") return false;

	const isPenaltyItem = /^\(P\)[A-Z]\./i.test(itemId);
	const isSpecial2024Item =
		params.year === SPECIAL_RECOMMENDATION_YEAR &&
		itemId === norm(SPECIAL_RECOMMENDATION_ITEM_ID);

	return isPenaltyItem || isSpecial2024Item;
}

export function canKeepRecommendationForAssessmentItem(year: number, item: AssessmentItem): boolean {
	return canKeepRecommendationForNonNoStatus({
		year,
		itemId: item.item_id ?? item.part_id ?? item.label ?? item.id,
		status: item.status
	});
}
