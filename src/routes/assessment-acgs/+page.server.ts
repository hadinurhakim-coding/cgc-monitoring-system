import type { PageServerLoad } from "./$types.js";
import { getAssessmentData } from "./assessment-service.server.js";

export const load: PageServerLoad = async ({ url }) => {
  const currentYear = new Date().getFullYear();
  const yearStr = url.searchParams.get('year') || currentYear.toString();
  const year = parseInt(yearStr);

  // We could also get divisionId from query params if multi-division is supported
  const { data: assessmentData, assessmentId, error } = await getAssessmentData(year);

  console.log(`Server Load ACGS: Year=${year}, Rows=${assessmentData?.length}, ID=${assessmentId}`);
  if (error) {
    console.error('Error fetching ACGS data:', error);
    return { assessmentData: [], assessmentId: null, year };
  }

  return {
    assessmentData,
    assessmentId,
    year
  };
};
