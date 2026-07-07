import type { AssessmentItem } from "./types.js";
import { norm } from "./acgs-question-utils.js";

const SPECIAL_RECOMMENDATION_ITEM_ID = "(P)B.1.1";
const SPECIAL_RECOMMENDATION_YEAR = 2024;

export function canKeepRecommendationForNonNoStatus(params: {
	year: number;
	itemId: string | null | undefined;
}): boolean {
	return (
		params.year === SPECIAL_RECOMMENDATION_YEAR &&
		norm(params.itemId) === norm(SPECIAL_RECOMMENDATION_ITEM_ID)
	);
}

export function canKeepRecommendationForAssessmentItem(year: number, item: AssessmentItem): boolean {
	return canKeepRecommendationForNonNoStatus({
		year,
		itemId: item.item_id ?? item.part_id ?? item.label ?? item.id
	});
}
